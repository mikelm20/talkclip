import { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, Square, X, Minus, Check, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { cleanupText } from './services/grammarCleanup';

type ProcessingState = 'idle' | 'recording' | 'processing' | 'copied';

function App() {
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [transcription, setTranscription] = useState('');
  const [cleanedText, setCleanedText] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [silenceProgress, setSilenceProgress] = useState(0);
  const [audioLevel, setAudioLevel] = useState<number[]>(new Array(20).fill(0.2));
  const [error, setError] = useState<string | null>(null);

  const lastActivityRef = useRef<number>(Date.now());
  const timerRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<number | null>(null);

  const SILENCE_THRESHOLD = 1.8; // seconds of silence before auto-stop

  const handleTranscript = useCallback((text: string, isFinal: boolean) => {
    setTranscription(text);
    if (text.trim()) {
      lastActivityRef.current = Date.now();
      setSilenceProgress(0);
    }
  }, []);

  const handleAudioLevel = useCallback((level: number) => {
    setAudioLevel((prev) => {
      const newLevels = [...prev.slice(1), level];
      return newLevels;
    });
  }, []);

  const {
    isListening,
    startListening,
    stopListening,
    isSupported,
    error: recognitionError
  } = useSpeechRecognition({
    onTranscript: handleTranscript,
    onAudioLevel: handleAudioLevel
  });

  // Recording timer
  useEffect(() => {
    if (processingState === 'recording') {
      timerRef.current = window.setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [processingState]);

  // Silence detection
  useEffect(() => {
    if (processingState !== 'recording') {
      setSilenceProgress(0);
      if (silenceTimerRef.current) {
        clearInterval(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      return;
    }

    silenceTimerRef.current = window.setInterval(() => {
      const silenceTime = (Date.now() - lastActivityRef.current) / 1000;

      // Only start countdown after we have some transcription
      if (transcription.trim() && silenceTime > 0.3) {
        const progress = Math.min(1, silenceTime / SILENCE_THRESHOLD);
        setSilenceProgress(progress);

        if (silenceTime >= SILENCE_THRESHOLD) {
          handleStopRecording();
        }
      }
    }, 50);

    return () => {
      if (silenceTimerRef.current) {
        clearInterval(silenceTimerRef.current);
      }
    };
  }, [processingState, transcription]);

  // Handle hotkey activation
  useEffect(() => {
    if (window.electronAPI) {
      const cleanup = window.electronAPI.onHotkeyActivated(() => {
        if (processingState === 'idle') {
          handleStartRecording();
        }
      });
      return cleanup;
    }
  }, [processingState]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (processingState === 'recording') {
          handleStopRecording();
        } else {
          window.electronAPI?.closeWindow();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [processingState]);

  const handleStartRecording = useCallback(async () => {
    setError(null);
    setTranscription('');
    setCleanedText('');
    setRecordingTime(0);
    setSilenceProgress(0);
    setAudioLevel(new Array(20).fill(0.2));
    lastActivityRef.current = Date.now();

    try {
      await startListening();
      setProcessingState('recording');
    } catch (err) {
      setError('Failed to start recording. Please check microphone permissions.');
      console.error('Recording error:', err);
    }
  }, [startListening]);

  const handleStopRecording = useCallback(async () => {
    stopListening();
    setSilenceProgress(0);

    if (!transcription.trim()) {
      setProcessingState('idle');
      return;
    }

    setProcessingState('processing');

    try {
      // Clean up the transcription with grammar/punctuation
      const cleaned = await cleanupText(transcription);
      setCleanedText(cleaned);

      // Copy to clipboard
      if (window.electronAPI) {
        await window.electronAPI.copyToClipboard(cleaned);
      } else {
        await navigator.clipboard.writeText(cleaned);
      }

      setProcessingState('copied');

      // Reset after showing confirmation
      setTimeout(() => {
        setProcessingState('idle');
      }, 2000);
    } catch (err) {
      console.error('Processing error:', err);
      // Fallback: copy raw transcription
      const textToCopy = transcription;
      if (window.electronAPI) {
        await window.electronAPI.copyToClipboard(textToCopy);
      } else {
        await navigator.clipboard.writeText(textToCopy);
      }
      setCleanedText(textToCopy);
      setProcessingState('copied');
      setTimeout(() => {
        setProcessingState('idle');
      }, 2000);
    }
  }, [transcription, stopListening]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    window.electronAPI?.closeWindow();
  };

  const handleMinimize = () => {
    window.electronAPI?.minimizeWindow();
  };

  if (!isSupported) {
    return (
      <div className="app">
        <div className="window-controls">
          <button className="control-btn close" onClick={handleClose}>
            <X size={12} />
          </button>
        </div>
        <div className="error-message">
          Speech recognition is not supported in this browser.
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="window-controls">
        <button className="control-btn minimize" onClick={handleMinimize}>
          <Minus size={12} />
        </button>
        <button className="control-btn close" onClick={handleClose}>
          <X size={12} />
        </button>
      </div>

      <div className="drag-region" />

      <header className="app-header">
        <div className="logo">
          <Mic size={20} />
          <h1>TalkClip</h1>
        </div>
        <p className="tagline">Voice to clipboard in seconds</p>
      </header>

      <main className="main-content">
        <div className="voice-recorder">
          <div className="recorder-header">
            <div className={clsx('recording-indicator', processingState === 'recording' && 'active')}>
              <span className="dot" />
              <span>
                {processingState === 'recording'
                  ? 'Recording...'
                  : processingState === 'processing'
                  ? 'Processing...'
                  : processingState === 'copied'
                  ? 'Copied!'
                  : 'Ready'}
              </span>
            </div>
            <div className="recording-time">{formatTime(recordingTime)}</div>
          </div>

          {/* Auto-stop progress bar */}
          {processingState === 'recording' && silenceProgress > 0 && (
            <div className="auto-stop-bar">
              <div
                className="auto-stop-progress"
                style={{ width: `${silenceProgress * 100}%` }}
              />
            </div>
          )}

          {/* Waveform visualization */}
          <div className="waveform-container">
            <div className={clsx('waveform', processingState === 'recording' && 'active')}>
              {audioLevel.map((level, i) => (
                <div
                  key={i}
                  className="waveform-bar"
                  style={{
                    height: processingState === 'recording' ? `${Math.max(20, level * 100)}%` : '20%'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Main control button */}
          <div className="controls">
            {processingState === 'idle' && (
              <button
                className="record-button"
                onClick={handleStartRecording}
                aria-label="Start recording"
              >
                <Mic size={32} />
              </button>
            )}
            {processingState === 'recording' && (
              <button
                className="stop-button"
                onClick={handleStopRecording}
                aria-label="Stop recording"
              >
                <Square size={24} />
              </button>
            )}
            {processingState === 'processing' && (
              <div className="processing-indicator">
                <Loader2 size={32} className="spin" />
              </div>
            )}
            {processingState === 'copied' && (
              <div className="success-indicator">
                <Check size={32} />
              </div>
            )}
          </div>

          {/* Transcription display */}
          <div className="transcription-box">
            <div className="transcription-header">
              <span>Transcription</span>
            </div>
            <div className="transcription-content">
              {processingState === 'copied' && cleanedText ? (
                cleanedText
              ) : transcription ? (
                <>
                  {transcription}
                  {processingState === 'recording' && <span className="cursor" />}
                </>
              ) : (
                <span className="placeholder">
                  {processingState === 'recording'
                    ? 'Listening...'
                    : 'Tap mic to record. Auto-stops & copies when you pause.'}
                </span>
              )}
            </div>
          </div>

          {/* Error display */}
          {(error || recognitionError) && (
            <div className="error-toast">{error || recognitionError}</div>
          )}

          {/* Success toast */}
          {processingState === 'copied' && (
            <div className="toast">
              <Check size={16} />
              <span>Copied to clipboard!</span>
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <span>Ctrl+Shift+V to toggle</span>
        <span>ESC to close</span>
      </footer>
    </div>
  );
}

export default App;

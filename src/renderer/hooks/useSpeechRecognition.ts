import { useState, useCallback, useRef, useEffect } from 'react';

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface UseSpeechRecognitionOptions {
  onTranscript: (text: string, isFinal: boolean) => void;
  onAudioLevel?: (level: number) => void;
  language?: string;
}

export function useSpeechRecognition({
  onTranscript,
  onAudioLevel,
  language = 'en-US'
}: UseSpeechRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const transcriptRef = useRef<string>('');

  const SpeechRecognitionAPI =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

  const isSupported = !!SpeechRecognitionAPI;

  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current || !onAudioLevel) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average level
    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    const normalizedLevel = average / 255;

    onAudioLevel(normalizedLevel);

    if (isListening) {
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    }
  }, [isListening, onAudioLevel]);

  const startAudioAnalysis = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      analyzeAudio();
    } catch (err) {
      console.error('Audio analysis error:', err);
    }
  }, [analyzeAudio]);

  const stopAudioAnalysis = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
  }, []);

  const startListening = useCallback(async () => {
    if (!SpeechRecognitionAPI) {
      setError('Speech recognition not supported');
      return;
    }

    setError(null);
    transcriptRef.current = '';

    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });

      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        startAudioAnalysis();
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        if (finalTranscript) {
          transcriptRef.current += finalTranscript;
          onTranscript(transcriptRef.current, true);
        } else if (interimTranscript) {
          onTranscript(transcriptRef.current + interimTranscript, false);
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === 'no-speech') {
          // Ignore no-speech errors - this is normal during pauses
          return;
        }
        console.error('Speech recognition error:', event.error);
        setError(`Recognition error: ${event.error}`);
      };

      recognitionRef.current.onend = () => {
        // Restart if still supposed to be listening (continuous mode workaround)
        if (isListening && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            // Ignore errors when restarting
          }
        }
      };

      recognitionRef.current.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setError('Failed to access microphone');
      throw err;
    }
  }, [SpeechRecognitionAPI, language, onTranscript, startAudioAnalysis, isListening]);

  const stopListening = useCallback(() => {
    setIsListening(false);

    if (recognitionRef.current) {
      recognitionRef.current.onend = null; // Prevent restart
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    stopAudioAnalysis();
  }, [stopAudioAnalysis]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopAudioAnalysis();
    };
  }, [stopAudioAnalysis]);

  return {
    isListening,
    startListening,
    stopListening,
    isSupported,
    error
  };
}

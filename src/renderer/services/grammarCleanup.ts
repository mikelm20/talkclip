const OLLAMA_URL = 'http://localhost:11434/api/generate';

interface OllamaResponse {
  response: string;
  done: boolean;
}

const CLEANUP_PROMPT = `You are a grammar and punctuation cleanup assistant. Your task is to clean up speech-to-text output by:
1. Adding proper punctuation (periods, commas, question marks)
2. Fixing capitalization (start of sentences, proper nouns)
3. Removing filler words like "um", "uh", "like", "you know"
4. Keeping the original meaning intact

IMPORTANT: Only output the cleaned text, nothing else. No explanations, no quotes, just the cleaned text.

Text to clean:
`;

async function cleanWithOllama(text: string): Promise<string> {
  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3.2:1b', // Small, fast model suitable for this task
        prompt: CLEANUP_PROMPT + text,
        stream: false,
        options: {
          temperature: 0.1, // Low temperature for consistent output
          num_predict: 500
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data: OllamaResponse = await response.json();
    return data.response.trim();
  } catch (error) {
    console.error('Ollama cleanup failed:', error);
    throw error;
  }
}

function basicCleanup(text: string): string {
  // Remove common filler words
  const fillerWords = /\b(um|uh|er|ah|like|you know|i mean|basically|actually|literally)\b/gi;
  let cleaned = text.replace(fillerWords, '');

  // Remove multiple spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Capitalize first letter of sentences
  cleaned = cleaned.replace(/(^|[.!?]\s+)([a-z])/g, (_, prefix, letter) => {
    return prefix + letter.toUpperCase();
  });

  // Ensure first letter is capitalized
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  // Add period at end if missing and text doesn't end with punctuation
  if (cleaned.length > 0 && !/[.!?]$/.test(cleaned)) {
    cleaned += '.';
  }

  return cleaned;
}

async function checkOllamaAvailable(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      signal: AbortSignal.timeout(1000)
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function cleanupText(text: string): Promise<string> {
  if (!text.trim()) {
    return text;
  }

  // Try Ollama first
  const ollamaAvailable = await checkOllamaAvailable();

  if (ollamaAvailable) {
    try {
      const cleaned = await cleanWithOllama(text);
      // Validate the response - make sure it's not empty and not an error message
      if (cleaned && cleaned.length > 0 && !cleaned.toLowerCase().includes('error')) {
        return cleaned;
      }
    } catch (error) {
      console.warn('Ollama cleanup failed, falling back to basic cleanup:', error);
    }
  }

  // Fallback to basic cleanup
  return basicCleanup(text);
}

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function streamGroq(
  messages: Message[],
  onChunk: (chunk: string) => void,
  onDone: (full: string) => void,
  onError: (err: string) => void
) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        stream: true,
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      onError(`Groq error: ${response.status} - ${errText}`);
      return;
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let full = '';

    if (!reader) {
      onError('No stream reader');
      return;
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const text = parsed.choices?.[0]?.delta?.content;
          if (text) {
            full += text;
            onChunk(text);
          }
        } catch {}
      }
    }
    onDone(full);
  } catch (e: any) {
    onError(e.message || 'Unknown error');
  }
}

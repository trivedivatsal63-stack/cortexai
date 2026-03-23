import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your actual deployed URL
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://your-CortexAI-app.vercel.app';

async function getAuthToken(): Promise<string | null> {
  return await AsyncStorage.getItem('clerk_token');
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = await getAuthToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  return res.json();
}

// ---- Chats ----
export async function fetchChats() {
  return apiFetch('/api/chats');
}

export async function createChat(title: string) {
  return apiFetch('/api/chats', {
    method: 'POST',
    body: JSON.stringify({ title }),
  });
}

export async function deleteChat(chatId: string) {
  return apiFetch(`/api/chats/${chatId}`, { method: 'DELETE' });
}

export async function renameChat(chatId: string, title: string) {
  return apiFetch(`/api/chats/${chatId}`, {
    method: 'PATCH',
    body: JSON.stringify({ title }),
  });
}

// ---- Messages ----
export async function fetchMessages(chatId: string) {
  return apiFetch(`/api/messages?chatId=${chatId}`);
}

// ---- Usage ----
export async function fetchUsage() {
  return apiFetch('/api/usage');
}

// ---- Blog ----
export async function fetchPosts() {
  return apiFetch('/api/blog');
}

export async function fetchPost(slug: string) {
  return apiFetch(`/api/blog/${slug}`);
}

// ---- Streaming Chat ----
export async function streamChat(
  messages: { role: string; content: string }[],
  systemPrompt: string,
  chatId: string,
  onChunk: (chunk: string) => void,
  onDone: (fullText: string) => void,
  onError: (err: string) => void
) {
  const token = await getAuthToken();

  try {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ messages, systemPrompt, chatId }),
    });

    if (!response.ok) {
      onError(`Server error: ${response.status}`);
      return;
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let full = '';

    if (!reader) {
      onError('No response stream');
      return;
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      // Parse SSE format: "data: {...}\n\n"
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            const text = parsed.choices?.[0]?.delta?.content || '';
            if (text) {
              full += text;
              onChunk(text);
            }
          } catch { }
        }
      }
    }
    onDone(full);
  } catch (e: any) {
    onError(e.message || 'Stream failed');
  }
}

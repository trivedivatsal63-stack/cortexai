import { useState, useCallback } from 'react';
import { streamGroq, Message as GroqMessage } from '../lib/groq';
import {
  Message, Chat,
  loadMessagesLocally, saveMessagesLocally,
  loadChatsLocally, saveChatsLocally,
  incrementUsageLocally,
} from '../lib/store';
import { MODES } from '../constants/modes';

interface UseChatOptions {
  chatId: string;
  activeMode: string;
}

export function useChat({ chatId, activeMode }: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    const stored = await loadMessagesLocally(chatId);
    setMessages(stored);
  }, [chatId]);

  const sendMessage = useCallback(async (text: string, currentMessages: Message[]) => {
    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      chatId,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    const updatedMessages = [...currentMessages, userMsg];
    setMessages(updatedMessages);
    setIsStreaming(true);
    setStreamingText('');
    setError(null);

    await incrementUsageLocally();

    const mode = MODES.find(m => m.id === activeMode) || MODES[0];
    const systemMsg: GroqMessage = { role: 'system', content: mode.systemPrompt };
    const groqMessages: GroqMessage[] = [
      systemMsg,
      ...updatedMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ];

    return new Promise<void>((resolve) => {
      streamGroq(
        groqMessages,
        (chunk) => {
          setStreamingText(prev => prev + chunk);
        },
        async (full) => {
          const aiMsg: Message = {
            id: `msg_${Date.now() + 1}`,
            chatId,
            role: 'assistant',
            content: full,
            createdAt: new Date().toISOString(),
          };
          const finalMessages = [...updatedMessages, aiMsg];
          setMessages(finalMessages);
          setIsStreaming(false);
          setStreamingText('');
          await saveMessagesLocally(chatId, finalMessages);

          // Auto-title from first message
          if (currentMessages.length === 0) {
            const title = text.slice(0, 50) + (text.length > 50 ? '...' : '');
            const allChats = await loadChatsLocally();
            let updated = allChats.map((c: Chat) => c.id === chatId ? { ...c, title } : c);
            if (!updated.find((c: Chat) => c.id === chatId)) {
              updated = [{ id: chatId, title, createdAt: new Date().toISOString() }, ...updated];
            }
            await saveChatsLocally(updated);
          }
          resolve();
        },
        (err) => {
          setIsStreaming(false);
          setStreamingText('');
          setError(err);
          resolve();
        }
      );
    });
  }, [chatId, activeMode]);

  return { messages, setMessages, isStreaming, streamingText, error, loadMessages, sendMessage };
}

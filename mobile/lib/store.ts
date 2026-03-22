import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Message {
  id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

// Local cache helpers
export async function saveChatsLocally(chats: Chat[]) {
  await AsyncStorage.setItem('chats', JSON.stringify(chats));
}

export async function loadChatsLocally(): Promise<Chat[]> {
  const raw = await AsyncStorage.getItem('chats');
  return raw ? JSON.parse(raw) : [];
}

export async function saveMessagesLocally(chatId: string, messages: Message[]) {
  await AsyncStorage.setItem(`messages_${chatId}`, JSON.stringify(messages));
}

export async function loadMessagesLocally(chatId: string): Promise<Message[]> {
  const raw = await AsyncStorage.getItem(`messages_${chatId}`);
  return raw ? JSON.parse(raw) : [];
}

export async function saveUsageLocally(count: number) {
  const today = new Date().toISOString().split('T')[0];
  await AsyncStorage.setItem('usage', JSON.stringify({ count, date: today }));
}

export async function loadUsageLocally(): Promise<{ count: number; date: string } | null> {
  const raw = await AsyncStorage.getItem('usage');
  if (!raw) return null;
  const usage = JSON.parse(raw);
  const today = new Date().toISOString().split('T')[0];
  if (usage.date !== today) {
    await AsyncStorage.setItem('usage', JSON.stringify({ count: 0, date: today }));
    return { count: 0, date: today };
  }
  return usage;
}

export async function incrementUsageLocally(): Promise<number> {
  const usage = await loadUsageLocally();
  const newCount = (usage?.count || 0) + 1;
  await saveUsageLocally(newCount);
  return newCount;
}

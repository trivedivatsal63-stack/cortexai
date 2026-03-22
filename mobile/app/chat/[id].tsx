import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { colors, spacing, radius, fontSize } from '../../constants/theme';
import ChatBubble from '../../components/ChatBubble';
import InputBox from '../../components/InputBox';
import SidebarDrawer from '../../components/SidebarDrawer';
import { MODES } from '../../constants/modes';
import { streamGroq } from '../../lib/groq';
import {
  Message, Chat,
  loadMessagesLocally, saveMessagesLocally,
  loadChatsLocally, saveChatsLocally,
  loadUsageLocally, incrementUsageLocally,
} from '../../lib/store';

const FREE_LIMIT = 10;

export default function ChatScreen() {
  const { id, initialMessage, mode: initialMode, limitReached } = useLocalSearchParams<{
    id: string; initialMessage?: string; mode?: string; limitReached?: string;
  }>();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [activeMode, setActiveMode] = useState(initialMode || 'general');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [queryCount, setQueryCount] = useState(0);
  const [isPro] = useState(false);
  const [chatTitle, setChatTitle] = useState('New Chat');

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    if (limitReached === '1') {
      Alert.alert(
        '🔒 Daily Limit Reached',
        'You\'ve used all 10 free queries today. Upgrade to Pro for unlimited access.',
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/(tabs)/profile') },
        ]
      );
    }
  }, [limitReached]);

  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      handleSend(initialMessage);
    }
  }, [initialMessage, messages.length]);

  const loadData = async () => {
    const stored = await loadMessagesLocally(id);
    setMessages(stored);
    const allChats = await loadChatsLocally();
    setChats(allChats);
    const usage = await loadUsageLocally();
    setQueryCount(usage?.count || 0);
    const thisChat = allChats.find(c => c.id === id);
    if (thisChat) setChatTitle(thisChat.title);
  };

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const handleSend = async (text: string) => {
    if (!isPro && queryCount >= FREE_LIMIT) {
      Alert.alert('Daily Limit', 'Upgrade to Pro for unlimited queries.');
      return;
    }

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      chatId: id,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    scrollToBottom();
    setIsStreaming(true);
    setStreamingText('');

    const newCount = await incrementUsageLocally();
    setQueryCount(newCount);

    const currentMode = MODES.find(m => m.id === activeMode);
    const systemMsg = {
      role: 'system' as const,
      content: currentMode?.systemPrompt || MODES[0].systemPrompt,
    };

    const groqMessages = [
      systemMsg,
      ...updatedMessages.map(m => ({ role: m.role, content: m.content })),
    ];

    let fullResponse = '';

    streamGroq(
      groqMessages,
      (chunk) => {
        fullResponse += chunk;
        setStreamingText(fullResponse);
        scrollToBottom();
      },
      async (full) => {
        const aiMsg: Message = {
          id: `msg_${Date.now() + 1}`,
          chatId: id,
          role: 'assistant',
          content: full,
          createdAt: new Date().toISOString(),
        };
        const finalMessages = [...updatedMessages, aiMsg];
        setMessages(finalMessages);
        setIsStreaming(false);
        setStreamingText('');
        await saveMessagesLocally(id, finalMessages);

        // Update chat title if first message
        if (updatedMessages.length === 1) {
          const title = text.slice(0, 50) + (text.length > 50 ? '...' : '');
          const allChats = await loadChatsLocally();
          let updated = allChats.map(c => c.id === id ? { ...c, title } : c);
          if (!updated.find(c => c.id === id)) {
            updated = [{ id, title, createdAt: new Date().toISOString() }, ...updated];
          }
          await saveChatsLocally(updated);
          setChats(updated);
          setChatTitle(title);
        }
        scrollToBottom();
      },
      (err) => {
        setIsStreaming(false);
        setStreamingText('');
        Toast.show({ type: 'error', text1: 'Error', text2: err });
      }
    );
  };

  const handleRegenerate = useCallback(async () => {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMsg) return;
    const withoutLastAI = messages.filter((_, i) => i < messages.length - 1);
    setMessages(withoutLastAI);
    await handleSend(lastUserMsg.content);
  }, [messages]);

  const currentMode = MODES.find(m => m.id === activeMode);

  const allDisplayMessages: Array<Message | { id: string; role: 'streaming'; content: string; chatId: string; createdAt: string }> = [
    ...messages,
    ...(isStreaming ? [{
      id: 'streaming',
      chatId: id,
      role: 'streaming' as const,
      content: streamingText,
      createdAt: new Date().toISOString(),
    }] : []),
  ];

  const handleDeleteChat = async (chatId: string) => {
    const updated = chats.filter(c => c.id !== chatId);
    setChats(updated);
    await saveChatsLocally(updated);
  };

  const handleRenameChat = async (chatId: string, title: string) => {
    const updated = chats.map(c => c.id === chatId ? { ...c, title } : c);
    setChats(updated);
    await saveChatsLocally(updated);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>{chatTitle}</Text>
            <View style={styles.modePill}>
              <Text style={styles.modePillText}>{currentMode?.icon} {currentMode?.label}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.menuBtn} onPress={() => setDrawerOpen(true)}>
            <View style={styles.menuDot} />
            <View style={styles.menuDot} />
            <View style={styles.menuDot} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={styles.body}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          {allDisplayMessages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyOrb}>⚡</Text>
              <Text style={styles.emptyTitle}>Start a conversation</Text>
              <Text style={styles.emptySub}>Ask anything about {currentMode?.label}</Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={allDisplayMessages}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <ChatBubble
                  role={item.role === 'streaming' ? 'assistant' : item.role as 'user' | 'assistant'}
                  content={item.content}
                  isStreaming={item.role === 'streaming'}
                  onRegenerate={
                    item.role === 'assistant' && index === allDisplayMessages.length - 1
                      ? handleRegenerate : undefined
                  }
                  onCopy={() => Toast.show({ type: 'success', text1: 'Copied to clipboard' })}
                />
              )}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={scrollToBottom}
            />
          )}

          <InputBox
            onSend={handleSend}
            disabled={isStreaming || (!isPro && queryCount >= FREE_LIMIT)}
            placeholder={isStreaming ? 'Generating...' : 'Ask a follow-up...'}
            examMode={activeMode === 'exam'}
            onToggleExamMode={() => setActiveMode(m => m === 'exam' ? 'general' : 'exam')}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>

      <SidebarDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        chats={chats}
        activeChatId={id}
        activeMode={activeMode}
        queryCount={queryCount}
        maxQueries={FREE_LIMIT}
        isPro={isPro}
        onSelectChat={(chat) => {
          setDrawerOpen(false);
          router.push({ pathname: '/chat/[id]', params: { id: chat.id } });
        }}
        onNewChat={async () => {
          const chatId = `chat_${Date.now()}`;
          router.push({ pathname: '/chat/[id]', params: { id: chatId } });
        }}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        onSetMode={setActiveMode}
        onUpgrade={() => router.push('/(tabs)/profile')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  backBtn: { padding: 4, minWidth: 28 },
  backText: { fontSize: 24, color: colors.text2, lineHeight: 28 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: fontSize.base, fontWeight: '600', color: colors.text, maxWidth: 180 },
  modePill: {
    marginTop: 2,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(124,111,247,0.12)',
    borderRadius: radius.full,
  },
  modePillText: { fontSize: 10, color: colors.purple },
  menuBtn: { flexDirection: 'row', gap: 3, padding: 4, alignItems: 'center' },
  menuDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.text3 },
  body: { flex: 1 },
  messagesList: { paddingVertical: spacing.md, paddingBottom: 16 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyOrb: { fontSize: 48, marginBottom: spacing.lg },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  emptySub: { fontSize: fontSize.base, color: colors.text2, textAlign: 'center' },
});

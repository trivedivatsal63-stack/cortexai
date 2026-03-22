import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, radius, fontSize } from '../../constants/theme';
import SuggestionCards from '../../components/SuggestionCards';
import SidebarDrawer from '../../components/SidebarDrawer';
import InputBox from '../../components/InputBox';
import {
  Chat, loadChatsLocally, saveChatsLocally,
  loadUsageLocally, incrementUsageLocally,
} from '../../lib/store';
import { MODES } from '../../constants/modes';

const FREE_LIMIT = 10;

export default function HomeScreen() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeMode, setActiveMode] = useState('general');
  const [queryCount, setQueryCount] = useState(0);
  const [isPro] = useState(false);
  const [examMode, setExamMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    loadChats();
    loadUsage();
  }, []);

  const loadChats = async () => {
    const stored = await loadChatsLocally();
    setChats(stored);
  };

  const loadUsage = async () => {
    const usage = await loadUsageLocally();
    setQueryCount(usage?.count || 0);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadChats();
    await loadUsage();
    setRefreshing(false);
  }, []);

  const handleSend = async (text: string, mode?: string) => {
    if (!isPro && queryCount >= FREE_LIMIT) {
      router.push({ pathname: '/chat/new', params: { limitReached: '1' } });
      return;
    }

    const newCount = await incrementUsageLocally();
    setQueryCount(newCount);

    const chatId = `chat_${Date.now()}`;
    const title = text.slice(0, 50) + (text.length > 50 ? '...' : '');
    const newChat: Chat = { id: chatId, title, createdAt: new Date().toISOString() };

    const updated = [newChat, ...chats];
    setChats(updated);
    await saveChatsLocally(updated);

    router.push({
      pathname: '/chat/[id]',
      params: {
        id: chatId,
        initialMessage: text,
        mode: mode || (examMode ? 'exam' : activeMode),
      },
    });
  };

  const handleSuggestion = (prompt: string, mode: string) => {
    handleSend(prompt, mode);
  };

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

  const currentMode = MODES.find(m => m.id === activeMode);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#13131c', '#0d0d12', '#0d0d12']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuBtn} onPress={() => setDrawerOpen(true)}>
            <View style={styles.menuLine} />
            <View style={[styles.menuLine, { width: 16 }]} />
            <View style={styles.menuLine} />
          </TouchableOpacity>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}><Text style={{ fontSize: 14 }}>⚡</Text></View>
            <Text style={styles.logoText}>CyberAI</Text>
          </View>
          <TouchableOpacity
            style={styles.headerRight}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <View style={styles.userAvatar}><Text style={styles.userAvatarText}>S</Text></View>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.purple} />}
          keyboardShouldPersistTaps="handled"
        >
          {/* Welcome */}
          <View style={styles.welcomeSection}>
            <View style={styles.orb} />
            <Text style={styles.welcomeTitle}>{greeting}, Student.</Text>
            <Text style={styles.welcomeSub}>Can I help you with anything?</Text>

            {/* Mode badge */}
            <View style={styles.modeBadge}>
              <Text style={styles.modeBadgeText}>
                {currentMode?.icon} {currentMode?.label} Mode
              </Text>
            </View>
          </View>

          {/* Suggestions */}
          <Text style={styles.suggestLabel}>Try asking...</Text>
          <SuggestionCards onSelect={handleSuggestion} />

          {/* Recent chats */}
          {chats.length > 0 && (
            <View style={styles.recentSection}>
              <Text style={styles.recentLabel}>Recent Chats</Text>
              {chats.slice(0, 5).map(chat => (
                <TouchableOpacity
                  key={chat.id}
                  style={styles.recentItem}
                  onPress={() => router.push({ pathname: '/chat/[id]', params: { id: chat.id } })}
                >
                  <View style={styles.recentIcon}>
                    <Text style={{ fontSize: 12 }}>💬</Text>
                  </View>
                  <Text style={styles.recentTitle} numberOfLines={1}>{chat.title}</Text>
                  <Text style={styles.recentArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Usage warning */}
        {!isPro && queryCount >= FREE_LIMIT * 0.8 && queryCount < FREE_LIMIT && (
          <View style={styles.usageWarning}>
            <Text style={styles.usageWarningText}>
              ⚠️ {FREE_LIMIT - queryCount} queries left today
            </Text>
          </View>
        )}

        {/* Input */}
        <InputBox
          onSend={handleSend}
          disabled={!isPro && queryCount >= FREE_LIMIT}
          placeholder={!isPro && queryCount >= FREE_LIMIT ? '🔒 Daily limit reached · Upgrade to Pro' : 'Ask CyberAI anything...'}
          examMode={examMode}
          onToggleExamMode={() => setExamMode(e => !e)}
        />
      </SafeAreaView>

      <SidebarDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        chats={chats}
        activeChatId={null}
        activeMode={activeMode}
        queryCount={queryCount}
        maxQueries={FREE_LIMIT}
        isPro={isPro}
        onSelectChat={(chat) => router.push({ pathname: '/chat/[id]', params: { id: chat.id } })}
        onNewChat={() => {}}
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
  },
  menuBtn: { gap: 4, padding: 4 },
  menuLine: { width: 20, height: 1.5, backgroundColor: colors.text2, borderRadius: 2 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { fontSize: fontSize.lg, fontWeight: '600', color: colors.text },
  headerRight: {},
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.bg4,
    borderWidth: 1,
    borderColor: colors.border2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: { fontSize: 12, fontWeight: '600', color: colors.text2 },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: spacing.xxl },
  welcomeSection: { alignItems: 'center', paddingHorizontal: spacing.xl, marginBottom: spacing.xxl },
  orb: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.purple,
    marginBottom: spacing.xl,
    opacity: 0.85,
  },
  welcomeTitle: {
    fontSize: fontSize.display,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },
  welcomeSub: {
    fontSize: fontSize.lg,
    color: colors.text2,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  modeBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: 'rgba(124,111,247,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(124,111,247,0.25)',
    borderRadius: radius.full,
  },
  modeBadgeText: { fontSize: fontSize.sm, color: colors.purple },
  suggestLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text3,
    letterSpacing: 0.5,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  recentSection: { paddingHorizontal: spacing.lg, marginTop: spacing.xxl },
  recentLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text3,
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.bg3,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
  },
  recentIcon: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: colors.bg4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentTitle: { flex: 1, fontSize: fontSize.base, color: colors.text2 },
  recentArrow: { fontSize: 16, color: colors.text3 },
  usageWarning: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    backgroundColor: 'rgba(251,191,36,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.2)',
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  usageWarningText: { fontSize: fontSize.sm, color: colors.amber },
});

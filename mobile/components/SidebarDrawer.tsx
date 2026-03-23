import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, Dimensions, TouchableWithoutFeedback, Alert,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, fontSize } from '../constants/theme';
import { MODES } from '../constants/modes';
import { Chat } from '../lib/store';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.78;

interface Props {
  visible: boolean;
  onClose: () => void;
  chats: Chat[];
  activeChatId: string | null;
  activeMode: string;
  queryCount: number;
  maxQueries: number;
  isPro: boolean;
  onSelectChat: (chat: Chat) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, title: string) => void;
  onSetMode: (mode: string) => void;
  onUpgrade: () => void;
}

export default function SidebarDrawer({
  visible, onClose, chats, activeChatId, activeMode,
  queryCount, maxQueries, isPro,
  onSelectChat, onNewChat, onDeleteChat, onRenameChat, onSetMode, onUpgrade,
}: Props) {
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const [searchText, setSearchText] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState('');

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 200 }),
        Animated.timing(bgOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, { toValue: -DRAWER_WIDTH, duration: 220, useNativeDriver: true }),
        Animated.timing(bgOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const filteredChats = chats.filter(c =>
    c.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleDelete = (chat: Chat) => {
    Alert.alert('Delete Chat', `Delete "${chat.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDeleteChat(chat.id) },
    ]);
  };

  const startRename = (chat: Chat) => {
    setRenamingId(chat.id);
    setRenameText(chat.title);
  };

  const submitRename = (chatId: string) => {
    if (renameText.trim()) onRenameChat(chatId, renameText.trim());
    setRenamingId(null);
  };

  const usagePct = isPro ? 0 : Math.min((queryCount / maxQueries) * 100, 100);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: bgOpacity }]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
        <LinearGradient
          colors={['#13131c', '#0d0d12']}
          style={styles.drawerInner}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <View style={styles.logoIcon}><Text style={styles.logoEmoji}>⚡</Text></View>
              <Text style={styles.logoText}>CortexAI</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.newChatBtn} onPress={() => { onNewChat(); onClose(); }}>
            <Text style={styles.newChatBtnText}>+ New Chat</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search chats..."
            placeholderTextColor={colors.text3}
          />

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Modes */}
            <Text style={styles.sectionLabel}>MODES</Text>
            {MODES.map(mode => (
              <TouchableOpacity
                key={mode.id}
                style={[styles.modeItem, activeMode === mode.id && styles.modeItemActive]}
                onPress={() => { onSetMode(mode.id); onClose(); }}
              >
                <Text style={styles.modeIcon}>{mode.icon}</Text>
                <Text style={[styles.modeLabel, activeMode === mode.id && styles.modeLabelActive]}>
                  {mode.label}
                </Text>
              </TouchableOpacity>
            ))}

            {/* History */}
            <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>TODAY</Text>
            {filteredChats.length === 0 ? (
              <Text style={styles.emptyText}>No chats yet</Text>
            ) : (
              filteredChats.map(chat => (
                <View key={chat.id} style={styles.chatItemWrapper}>
                  {renamingId === chat.id ? (
                    <TextInput
                      style={styles.renameInput}
                      value={renameText}
                      onChangeText={setRenameText}
                      onBlur={() => submitRename(chat.id)}
                      onSubmitEditing={() => submitRename(chat.id)}
                      autoFocus
                    />
                  ) : (
                    <TouchableOpacity
                      style={[styles.chatItem, activeChatId === chat.id && styles.chatItemActive]}
                      onPress={() => { onSelectChat(chat); onClose(); }}
                      onLongPress={() => startRename(chat)}
                    >
                      <Text style={styles.chatTitle} numberOfLines={1}>{chat.title}</Text>
                      <TouchableOpacity
                        onPress={() => handleDelete(chat)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={styles.deleteIcon}>✕</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            {!isPro && (
              <>
                <View style={styles.usageRow}>
                  <Text style={styles.usageLabel}>Queries</Text>
                  <Text style={styles.usageCount}>{queryCount}/{maxQueries}</Text>
                </View>
                <View style={styles.usageTrack}>
                  <View style={[styles.usageFill, { width: `${usagePct}%` }]} />
                </View>
                <TouchableOpacity style={styles.upgradeBtn} onPress={onUpgrade}>
                  <Text style={styles.upgradeBtnText}>⚡ Upgrade to Pro</Text>
                </TouchableOpacity>
              </>
            )}
            {isPro && (
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>⚡ Pro Plan · Unlimited</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
  },
  drawerInner: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: 56,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 14 },
  logoText: { fontSize: fontSize.lg, fontWeight: '600', color: colors.text },
  closeBtn: { padding: 6 },
  closeBtnText: { color: colors.text3, fontSize: 16 },
  newChatBtn: {
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.purple,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  newChatBtnText: { color: colors.white, fontWeight: '600', fontSize: fontSize.base },
  searchInput: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    backgroundColor: colors.bg3,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    color: colors.text,
    fontSize: fontSize.base,
  },
  scroll: { flex: 1, paddingHorizontal: spacing.sm },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text3,
    letterSpacing: 0.8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  modeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 2,
  },
  modeItemActive: {
    backgroundColor: colors.bg4,
    borderColor: colors.border2,
  },
  modeIcon: { fontSize: 14, width: 18, textAlign: 'center' },
  modeLabel: { fontSize: fontSize.base, color: colors.text2 },
  modeLabelActive: { color: colors.purple },
  chatItemWrapper: { marginBottom: 2 },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: radius.sm,
    gap: 6,
  },
  chatItemActive: { backgroundColor: colors.bg4 },
  chatTitle: { flex: 1, fontSize: fontSize.base, color: colors.text2 },
  deleteIcon: { fontSize: 11, color: colors.text3 },
  renameInput: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    backgroundColor: colors.bg4,
    borderWidth: 1,
    borderColor: colors.purple,
    borderRadius: radius.sm,
    color: colors.text,
    fontSize: fontSize.base,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.text3,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  usageRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  usageLabel: { fontSize: fontSize.sm, color: colors.text2 },
  usageCount: { fontSize: fontSize.sm, color: colors.text2 },
  usageTrack: {
    height: 4,
    backgroundColor: colors.bg3,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  usageFill: {
    height: '100%',
    backgroundColor: colors.purple,
    borderRadius: 4,
  },
  upgradeBtn: {
    padding: spacing.md,
    backgroundColor: colors.purple,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  upgradeBtnText: { color: colors.white, fontWeight: '600', fontSize: fontSize.base },
  proBadge: {
    padding: spacing.md,
    backgroundColor: 'rgba(124,111,247,0.15)',
    borderRadius: radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124,111,247,0.3)',
  },
  proBadgeText: { color: colors.purple, fontWeight: '600', fontSize: fontSize.base },
});

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, fontSize } from '../../constants/theme';
import { MODES, SUGGESTIONS } from '../../constants/modes';
import { saveChatsLocally, loadChatsLocally, incrementUsageLocally } from '../../lib/store';

const TOPICS = [
  { label: 'Network Security', icon: '🔒', mode: 'cyber', prompts: ['Explain firewalls', 'What is IDS/IPS?', 'How does VPN work?', 'Explain DMZ'] },
  { label: 'Web Security', icon: '🌐', mode: 'cyber', prompts: ['Explain XSS attacks', 'What is CSRF?', 'SQL Injection explained', 'HTTP vs HTTPS'] },
  { label: 'Cryptography', icon: '🔑', mode: 'cyber', prompts: ['Symmetric vs asymmetric', 'How does RSA work?', 'Explain hashing', 'Digital signatures'] },
  { label: 'Data Structures', icon: '📊', mode: 'code', prompts: ['Explain linked lists', 'Binary trees basics', 'Hash tables', 'Stack vs Queue'] },
  { label: 'Algorithms', icon: '⚙️', mode: 'code', prompts: ['Big O notation', 'Sorting algorithms', 'Graph algorithms', 'Dynamic programming'] },
  { label: 'Operating Systems', icon: '💿', mode: 'general', prompts: ['Process scheduling', 'Memory management', 'File systems', 'Deadlocks'] },
];

export default function ExploreScreen() {
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);

  const handlePrompt = async (prompt: string, mode: string) => {
    const chatId = `chat_${Date.now()}`;
    const title = prompt.slice(0, 50);
    const existing = await loadChatsLocally();
    const updated = [{ id: chatId, title, createdAt: new Date().toISOString() }, ...existing];
    await saveChatsLocally(updated);
    await incrementUsageLocally();
    router.push({ pathname: '/chat/[id]', params: { id: chatId, initialMessage: prompt, mode } });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#13131c', '#0d0d12']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Explore Topics</Text>
          <Text style={styles.headerSub}>Browse structured learning paths</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Learning Modes */}
          <Text style={styles.sectionLabel}>LEARNING MODES</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modesRow}>
            {MODES.map(mode => (
              <TouchableOpacity key={mode.id} style={styles.modeCard}>
                <Text style={styles.modeCardIcon}>{mode.icon}</Text>
                <Text style={styles.modeCardLabel}>{mode.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Topics */}
          <Text style={styles.sectionLabel}>TOPIC AREAS</Text>
          {TOPICS.map((topic, i) => (
            <View key={i}>
              <TouchableOpacity
                style={[styles.topicHeader, selectedTopic === i && styles.topicHeaderActive]}
                onPress={() => setSelectedTopic(selectedTopic === i ? null : i)}
              >
                <View style={styles.topicLeft}>
                  <Text style={styles.topicIcon}>{topic.icon}</Text>
                  <Text style={styles.topicLabel}>{topic.label}</Text>
                </View>
                <Text style={styles.topicChevron}>{selectedTopic === i ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {selectedTopic === i && (
                <View style={styles.promptList}>
                  {topic.prompts.map((prompt, j) => (
                    <TouchableOpacity
                      key={j}
                      style={styles.promptItem}
                      onPress={() => handlePrompt(prompt, topic.mode)}
                    >
                      <Text style={styles.promptText}>{prompt}</Text>
                      <Text style={styles.promptArrow}>→</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.text, letterSpacing: -0.5 },
  headerSub: { fontSize: fontSize.base, color: colors.text2, marginTop: 4 },
  scrollContent: { padding: spacing.lg },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text3,
    letterSpacing: 0.8,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  modesRow: { gap: 10, paddingBottom: spacing.sm },
  modeCard: {
    width: 90,
    backgroundColor: colors.bg3,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: 6,
  },
  modeCardIcon: { fontSize: 22 },
  modeCardLabel: { fontSize: fontSize.xs, color: colors.text2, textAlign: 'center', fontWeight: '500' },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.bg3,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  topicHeaderActive: {
    borderColor: colors.purple,
    backgroundColor: colors.bg4,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
    marginBottom: 0,
  },
  topicLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topicIcon: { fontSize: 18 },
  topicLabel: { fontSize: fontSize.md, fontWeight: '500', color: colors.text },
  topicChevron: { fontSize: fontSize.xs, color: colors.text3 },
  promptList: {
    backgroundColor: colors.bg4,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.purple,
    borderBottomLeftRadius: radius.md,
    borderBottomRightRadius: radius.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  promptItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  promptText: { fontSize: fontSize.base, color: colors.text2 },
  promptArrow: { fontSize: fontSize.base, color: colors.purple },
});

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Markdown from 'react-native-markdown-display';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, fontSize } from '../../constants/theme';
import {
  loadChatsLocally, saveChatsLocally, incrementUsageLocally,
} from '../../lib/store';

export default function BlogArticleScreen() {
  const { postData } = useLocalSearchParams<{ postData: string }>();
  const router = useRouter();
  const post = postData ? JSON.parse(postData) : null;
  const [saved, setSaved] = useState(false);

  const handleAskAI = async () => {
    const chatId = `chat_${Date.now()}`;
    const prompt = `I just read your article "${post.title}". Can you explain this topic in more depth with exam-ready notes?`;
    const existing = await loadChatsLocally();
    const updated = [{ id: chatId, title: post.title, createdAt: new Date().toISOString() }, ...existing];
    await saveChatsLocally(updated);
    await incrementUsageLocally();
    router.push({ pathname: '/chat/[id]', params: { id: chatId, initialMessage: prompt, mode: 'cyber' } });
  };

  const handleShare = async () => {
    if (!post) return;
    await Share.share({ message: `Check out "${post.title}" on CyberAI!` });
  };

  if (!post) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safe} edges={['top']}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <View style={styles.errorState}>
            <Text style={styles.errorText}>Article not found</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#13131c', '#0d0d12']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
            <Text style={styles.shareBtnText}>↑ Share</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Article Header */}
          <View style={styles.articleHeader}>
            <View style={styles.metaRow}>
              <View style={styles.catBadge}>
                <Text style={styles.catBadgeText}>{post.category}</Text>
              </View>
              {post.readTime && (
                <Text style={styles.readTime}>{post.readTime}</Text>
              )}
            </View>
            <Text style={styles.articleTitle}>{post.title}</Text>
            <Text style={styles.articleDate}>
              {new Date(post.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </Text>
          </View>

          {/* Content */}
          <View style={styles.contentWrapper}>
            <Markdown style={markdownStyles}>{post.content}</Markdown>
          </View>

          {/* Ask AI CTA */}
          <TouchableOpacity style={styles.askAIBtn} onPress={handleAskAI} activeOpacity={0.85}>
            <LinearGradient
              colors={[colors.purple3, colors.purple]}
              style={styles.askAIGradient}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <Text style={styles.askAITitle}>⚡ Ask CyberAI about this topic</Text>
              <Text style={styles.askAISub}>Get a personalized explanation, exam notes, or practice questions</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const markdownStyles: any = {
  body: { color: colors.text, fontSize: fontSize.md, lineHeight: 24, backgroundColor: 'transparent' },
  heading1: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '700', marginTop: 20, marginBottom: 8 },
  heading2: { color: colors.text, fontSize: fontSize.xl, fontWeight: '600', marginTop: 16, marginBottom: 8, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  heading3: { color: colors.text, fontSize: fontSize.lg, fontWeight: '600', marginTop: 14, marginBottom: 6 },
  strong: { color: '#c4c0ff', fontWeight: '500' },
  em: { color: colors.text2 },
  code_inline: {
    fontFamily: 'monospace',
    fontSize: fontSize.sm,
    backgroundColor: colors.bg4,
    color: '#a78bfa',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fence: {
    backgroundColor: colors.bg2,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border2,
  },
  code_block: { fontFamily: 'monospace', fontSize: fontSize.xs + 1, color: '#e2e0ff' },
  bullet_list: { marginVertical: 8 },
  list_item: { marginBottom: 6 },
  paragraph: { marginBottom: 12 },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: colors.purple,
    paddingLeft: spacing.md,
    marginVertical: spacing.sm,
    backgroundColor: colors.bg3,
    paddingVertical: spacing.sm,
    borderRadius: 4,
  },
};

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
  backBtn: { padding: 4 },
  backText: { fontSize: 24, color: colors.text2, lineHeight: 28 },
  shareBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border2,
  },
  shareBtnText: { fontSize: fontSize.sm, color: colors.text2 },
  scrollContent: { padding: spacing.lg },
  articleHeader: { marginBottom: spacing.xl },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing.md },
  catBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(124,111,247,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(124,111,247,0.25)',
    borderRadius: radius.full,
  },
  catBadgeText: { fontSize: fontSize.xs, color: colors.purple, fontWeight: '500' },
  readTime: { fontSize: fontSize.xs, color: colors.text3 },
  articleTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 32,
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },
  articleDate: { fontSize: fontSize.sm, color: colors.text3 },
  contentWrapper: {
    backgroundColor: colors.bg2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  askAIBtn: { borderRadius: radius.md, overflow: 'hidden' },
  askAIGradient: { padding: spacing.lg },
  askAITitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.white, marginBottom: 4 },
  askAISub: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.7)', lineHeight: 18 },
  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: colors.text2, fontSize: fontSize.lg },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, radius, fontSize } from '../constants/theme';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  createdAt: string;
  readTime?: string;
}

interface Props {
  post: BlogPost;
  onPress: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  cybersecurity: '#7c6ff7',
  programming: '#4ade80',
  networking: '#60a5fa',
  os: '#fbbf24',
  general: '#9090a8',
};

export default function BlogCard({ post, onPress }: Props) {
  const catColor = CATEGORY_COLORS[post.category?.toLowerCase()] || colors.purple;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={[styles.catBadge, { backgroundColor: catColor + '22', borderColor: catColor + '44' }]}>
          <Text style={[styles.catText, { color: catColor }]}>
            {post.category || 'General'}
          </Text>
        </View>
        {post.readTime && (
          <Text style={styles.readTime}>{post.readTime}</Text>
        )}
      </View>
      <Text style={styles.title} numberOfLines={2}>{post.title}</Text>
      <Text style={styles.excerpt} numberOfLines={3}>{post.excerpt}</Text>
      <View style={styles.footer}>
        <Text style={styles.date}>
          {new Date(post.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
          })}
        </Text>
        <Text style={styles.readMore}>Read →</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg3,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  catBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  catText: { fontSize: fontSize.xs, fontWeight: '500' },
  readTime: { fontSize: fontSize.xs, color: colors.text3 },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  excerpt: {
    fontSize: fontSize.base,
    color: colors.text2,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  date: { fontSize: fontSize.xs, color: colors.text3 },
  readMore: { fontSize: fontSize.xs, color: colors.purple, fontWeight: '500' },
});

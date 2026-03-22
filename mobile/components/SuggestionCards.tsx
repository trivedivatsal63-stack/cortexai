import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacing, radius, fontSize } from '../constants/theme';
import { SUGGESTIONS } from '../constants/modes';

interface Props {
  onSelect: (prompt: string, mode: string) => void;
}

export default function SuggestionCards({ onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {SUGGESTIONS.map((s, i) => (
        <TouchableOpacity
          key={i}
          style={styles.card}
          onPress={() => onSelect(s.prompt, s.mode)}
          activeOpacity={0.75}
        >
          <Text style={styles.title}>{s.title}</Text>
          <Text style={styles.desc}>{s.desc}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.lg,
    gap: 10,
    paddingBottom: spacing.sm,
  },
  card: {
    width: 150,
    backgroundColor: colors.bg3,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  title: {
    fontSize: fontSize.base,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  desc: {
    fontSize: fontSize.xs,
    color: colors.text3,
    lineHeight: 16,
  },
});

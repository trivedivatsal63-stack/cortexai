import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Clipboard } from 'react-native';
import { colors, spacing, radius, fontSize } from '../constants/theme';

interface Props {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  onCopy?: () => void;
}

export default function ChatBubble({ role, content, isStreaming, onRegenerate, onCopy }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleCopy = async () => {
    Clipboard.setString(content);
    onCopy?.();
  };

  const isUser = role === 'user';

  return (
    <Animated.View style={[styles.wrapper, isUser && styles.wrapperUser, { opacity: fadeAnim }]}>
      {!isUser && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>⚡</Text>
        </View>
      )}

      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        {isUser ? (
          <Text style={styles.userText}>{content}</Text>
        ) : (
          <>
            <Markdown style={markdownStyles}>{content}</Markdown>
            {isStreaming && (
              <View style={styles.cursorWrapper}>
                <BlinkingCursor />
              </View>
            )}
            {!isStreaming && content.length > 0 && (
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={handleCopy}>
                  <Text style={styles.actionText}>📋 Copy</Text>
                </TouchableOpacity>
                {onRegenerate && (
                  <TouchableOpacity style={styles.actionBtn} onPress={onRegenerate}>
                    <Text style={styles.actionText}>🔄 Regenerate</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        )}
      </View>

      {isUser && (
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>S</Text>
        </View>
      )}
    </Animated.View>
  );
}

function BlinkingCursor() {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return <Animated.View style={[styles.cursor, { opacity }]} />;
}

const markdownStyles: any = {
  body: { color: colors.text, fontSize: fontSize.md, lineHeight: 22 },
  heading1: { color: colors.text, fontSize: fontSize.xl, fontWeight: '600', marginTop: 12, marginBottom: 6 },
  heading2: { color: colors.text, fontSize: fontSize.lg, fontWeight: '600', marginTop: 10, marginBottom: 4 },
  heading3: { color: colors.text, fontSize: fontSize.md, fontWeight: '600', marginTop: 8, marginBottom: 4 },
  strong: { color: '#c4c0ff', fontWeight: '500' },
  em: { color: colors.text2 },
  code_inline: {
    fontFamily: 'monospace',
    fontSize: fontSize.sm,
    backgroundColor: colors.bg4,
    color: '#a78bfa',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  fence: {
    backgroundColor: colors.bg2,
    borderRadius: radius.sm,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.border2,
  },
  code_block: {
    fontFamily: 'monospace',
    fontSize: fontSize.xs + 1,
    color: '#e2e0ff',
  },
  bullet_list: { marginVertical: 6 },
  ordered_list: { marginVertical: 6 },
  list_item: { marginBottom: 4 },
  paragraph: { marginBottom: 8 },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: colors.purple,
    paddingLeft: 12,
    marginVertical: 6,
    backgroundColor: colors.bg4,
    borderRadius: 4,
    paddingVertical: 6,
  },
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'flex-start',
    gap: 10,
  },
  wrapperUser: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  avatarText: { fontSize: 14 },
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.bg4,
    borderWidth: 1,
    borderColor: colors.border2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  userAvatarText: { fontSize: 12, fontWeight: '600', color: colors.text2 },
  bubble: {
    flex: 1,
    maxWidth: '85%',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  userBubble: {
    flex: 0,
    backgroundColor: colors.bg3,
    borderWidth: 1,
    borderColor: colors.border2,
    borderBottomRightRadius: 4,
    maxWidth: '80%',
  },
  aiBubble: {
    backgroundColor: 'transparent',
    padding: 0,
  },
  userText: {
    color: colors.text,
    fontSize: fontSize.md,
    lineHeight: 21,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.bg3,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
  },
  actionText: { color: colors.text3, fontSize: fontSize.xs },
  cursorWrapper: { flexDirection: 'row', marginTop: 4 },
  cursor: {
    width: 2,
    height: 14,
    backgroundColor: colors.purple,
    marginLeft: 2,
    borderRadius: 1,
  },
});

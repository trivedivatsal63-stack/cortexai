import React, { useState, useRef } from 'react';
import {
  View, TextInput, TouchableOpacity, Text, StyleSheet,
  Keyboard, Platform, Animated,
} from 'react-native';
import { colors, spacing, radius, fontSize } from '../constants/theme';

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  examMode?: boolean;
  onToggleExamMode?: () => void;
}

export default function InputBox({ onSend, disabled, placeholder, examMode, onToggleExamMode }: Props) {
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText('');
    Keyboard.dismiss();
  };

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  return (
    <View style={styles.container}>
      <View style={[styles.inputWrapper, disabled && styles.inputDisabled]}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={placeholder || 'Message CyberAI...'}
          placeholderTextColor={colors.text3}
          multiline
          maxLength={4000}
          onSubmitEditing={Platform.OS === 'ios' ? undefined : handleSend}
          blurOnSubmit={false}
          editable={!disabled}
          returnKeyType="default"
        />
        <View style={styles.toolbar}>
          <View style={styles.toolbarLeft}>
            <TouchableOpacity
              style={[styles.toolBtn, examMode && styles.toolBtnActive]}
              onPress={onToggleExamMode}
            >
              <Text style={[styles.toolBtnText, examMode && styles.toolBtnTextActive]}>
                📋 {examMode ? 'Exam ON' : 'Exam'}
              </Text>
            </TouchableOpacity>
          </View>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={[styles.sendBtn, (!text.trim() || disabled) && styles.sendBtnDisabled]}
              onPress={handleSend}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              disabled={!text.trim() || disabled}
            >
              <Text style={styles.sendIcon}>↑</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
      {disabled && (
        <Text style={styles.hintText}>⏳ Generating response...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.bg,
  },
  inputWrapper: {
    backgroundColor: colors.bg3,
    borderWidth: 1,
    borderColor: colors.border2,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  inputDisabled: {
    opacity: 0.6,
    borderColor: colors.border,
  },
  input: {
    color: colors.text,
    fontSize: fontSize.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    minHeight: 48,
    maxHeight: 160,
    lineHeight: 21,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.xs,
  },
  toolbarLeft: {
    flexDirection: 'row',
    gap: 6,
  },
  toolBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  toolBtnActive: {
    backgroundColor: 'rgba(124,111,247,0.15)',
    borderColor: 'rgba(124,111,247,0.35)',
  },
  toolBtnText: {
    color: colors.text3,
    fontSize: fontSize.xs,
  },
  toolBtnTextActive: {
    color: colors.purple,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: colors.bg4,
  },
  sendIcon: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  hintText: {
    color: colors.text3,
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

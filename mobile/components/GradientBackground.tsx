import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../constants/theme';

interface Props {
  children: React.ReactNode;
}

export default function GradientBackground({ children }: Props) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#13131c', '#0d0d12', '#0a0a10']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});

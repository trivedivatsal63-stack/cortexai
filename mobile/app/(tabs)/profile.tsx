import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, fontSize } from '../../constants/theme';
import { loadUsageLocally } from '../../lib/store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const [queryCount, setQueryCount] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const FREE_LIMIT = 10;

  useEffect(() => {
    loadUsageLocally().then(u => setQueryCount(u?.count || 0));
  }, []);

  const handleUpgrade = () => {
    Alert.alert(
      '⚡ Upgrade to Pro',
      'Pro Plan gives you:\n\n✓ Unlimited queries daily\n✓ Priority response speed\n✓ All learning modes\n✓ Export chat as PDF\n✓ Early access to features\n\nComming soon!',
      [{ text: 'OK' }]
    );
  };

  const handleClearData = () => {
    Alert.alert('Clear All Data', 'This will delete all your chat history and settings.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear', style: 'destructive', onPress: async () => {
          await AsyncStorage.clear();
          setQueryCount(0);
          Alert.alert('Done', 'All data cleared.');
        }
      },
    ]);
  };

  const usagePct = Math.min((queryCount / FREE_LIMIT) * 100, 100);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#13131c', '#0d0d12']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* User Card */}
          <View style={styles.userCard}>
            <LinearGradient
              colors={['rgba(124,111,247,0.2)', 'rgba(124,111,247,0.05)']}
              style={styles.userCardGradient}
            >
              <View style={styles.userAvatarLarge}>
                <Text style={styles.userAvatarText}>S</Text>
              </View>
              <Text style={styles.userName}>Student</Text>
              <Text style={styles.userEmail}>student@cyberai.app</Text>
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>
                  {isPro ? '⚡ Pro Plan' : '🆓 Free Plan'}
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* Usage */}
          {!isPro && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Daily Usage</Text>
              <View style={styles.usageCard}>
                <View style={styles.usageRow}>
                  <Text style={styles.usageLabel}>Queries today</Text>
                  <Text style={styles.usageValue}>{queryCount} / {FREE_LIMIT}</Text>
                </View>
                <View style={styles.usageTrack}>
                  <View style={[
                    styles.usageFill,
                    { width: `${usagePct}%` },
                    usagePct >= 90 && styles.usageFillDanger,
                  ]} />
                </View>
                <Text style={styles.usageReset}>Resets daily at midnight</Text>
              </View>
            </View>
          )}

          {/* Upgrade */}
          {!isPro && (
            <TouchableOpacity style={styles.upgradeCard} onPress={handleUpgrade} activeOpacity={0.85}>
              <LinearGradient
                colors={[colors.purple3, colors.purple]}
                style={styles.upgradeGradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                <View style={styles.upgradeContent}>
                  <Text style={styles.upgradeTitle}>⚡ Upgrade to Pro</Text>
                  <Text style={styles.upgradeSub}>Unlimited queries · All features</Text>
                </View>
                <Text style={styles.upgradeArrow}>→</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>

            <View style={styles.settingsCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingIcon}>🔔</Text>
                  <Text style={styles.settingLabel}>Notifications</Text>
                </View>
                <Switch
                  value={notificationsOn}
                  onValueChange={setNotificationsOn}
                  trackColor={{ false: colors.bg4, true: colors.purple }}
                  thumbColor={colors.white}
                />
              </View>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingIcon}>📤</Text>
                  <Text style={styles.settingLabel}>Export Chat History</Text>
                </View>
                <Text style={styles.settingArrow}>›</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingIcon}>🔒</Text>
                  <Text style={styles.settingLabel}>Privacy Policy</Text>
                </View>
                <Text style={styles.settingArrow}>›</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingIcon}>ℹ️</Text>
                  <Text style={styles.settingLabel}>About CyberAI</Text>
                </View>
                <Text style={styles.settingArrow}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{queryCount}</Text>
                <Text style={styles.statLabel}>Today's Queries</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>8</Text>
                <Text style={styles.statLabel}>CS Domains</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>5</Text>
                <Text style={styles.statLabel}>Learn Modes</Text>
              </View>
            </View>
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.dangerBtn} onPress={handleClearData}>
              <Text style={styles.dangerBtnText}>🗑️ Clear All Data</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.signOutBtn}>
              <Text style={styles.signOutBtnText}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>CyberAI v1.0 · Built for CS Students</Text>
          </View>
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
  scrollContent: { padding: spacing.lg, gap: spacing.xl },
  userCard: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border2,
  },
  userCardGradient: { padding: spacing.xxl, alignItems: 'center' },
  userAvatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  userAvatarText: { fontSize: 28, fontWeight: '700', color: colors.white },
  userName: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text, marginBottom: 4 },
  userEmail: { fontSize: fontSize.base, color: colors.text2, marginBottom: spacing.md },
  planBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    backgroundColor: 'rgba(124,111,247,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(124,111,247,0.3)',
    borderRadius: radius.full,
  },
  planBadgeText: { fontSize: fontSize.sm, color: colors.purple, fontWeight: '500' },
  section: { gap: spacing.md },
  sectionTitle: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text3, letterSpacing: 0.8 },
  usageCard: {
    backgroundColor: colors.bg3,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  usageRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  usageLabel: { fontSize: fontSize.base, color: colors.text2 },
  usageValue: { fontSize: fontSize.base, color: colors.text, fontWeight: '500' },
  usageTrack: { height: 6, backgroundColor: colors.bg4, borderRadius: 4, overflow: 'hidden', marginBottom: spacing.sm },
  usageFill: { height: '100%', backgroundColor: colors.purple, borderRadius: 4 },
  usageFillDanger: { backgroundColor: colors.red },
  usageReset: { fontSize: fontSize.xs, color: colors.text3 },
  upgradeCard: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  upgradeGradient: { padding: spacing.lg, flexDirection: 'row', alignItems: 'center' },
  upgradeContent: { flex: 1 },
  upgradeTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.white },
  upgradeSub: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  upgradeArrow: { fontSize: 20, color: colors.white },
  settingsCard: {
    backgroundColor: colors.bg3,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingIcon: { fontSize: 16 },
  settingLabel: { fontSize: fontSize.md, color: colors.text },
  settingArrow: { fontSize: 18, color: colors.text3 },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.lg },
  statsGrid: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: colors.bg3,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.purple },
  statLabel: { fontSize: fontSize.xs, color: colors.text3, marginTop: 4, textAlign: 'center' },
  dangerBtn: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.3)',
    backgroundColor: 'rgba(248,113,113,0.08)',
    alignItems: 'center',
  },
  dangerBtnText: { fontSize: fontSize.base, color: colors.red },
  signOutBtn: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border2,
    alignItems: 'center',
  },
  signOutBtnText: { fontSize: fontSize.base, color: colors.text2 },
  footer: { alignItems: 'center', paddingBottom: spacing.xl },
  footerText: { fontSize: fontSize.xs, color: colors.text3 },
});

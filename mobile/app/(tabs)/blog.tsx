import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, ScrollView, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, fontSize } from '../../constants/theme';
import BlogCard from '../../components/BlogCard';

// Static blog posts (replace with API fetch when backend is ready)
const MOCK_POSTS = [
  {
    id: '1',
    slug: 'sql-injection-guide',
    title: 'SQL Injection: Complete Guide for CS Students',
    excerpt: 'Learn how SQL injection attacks work, see real examples, and understand how to prevent them in your applications.',
    category: 'cybersecurity',
    readTime: '8 min read',
    createdAt: '2025-03-15T00:00:00Z',
    content: `## What is SQL Injection?\n\nSQL Injection (SQLi) is one of the most critical web security vulnerabilities. It allows attackers to interfere with database queries.\n\n## How it works\n\n1. Application takes user input\n2. Input is embedded in SQL query\n3. Attacker injects malicious SQL code\n\n## Example\n\n\`\`\`sql\nSELECT * FROM users WHERE username = 'admin' --' AND password = 'anything'\n\`\`\`\n\nThe -- comments out the rest, bypassing authentication.\n\n## Prevention\n\n- Use parameterized queries\n- Input validation\n- Least privilege principle\n- WAF (Web Application Firewall)`,
  },
  {
    id: '2',
    slug: 'osi-model-explained',
    title: 'OSI Model Explained: 7 Layers You Must Know for Exams',
    excerpt: 'A complete breakdown of all 7 OSI layers with real examples, mnemonics, and exam tips.',
    category: 'networking',
    readTime: '10 min read',
    createdAt: '2025-03-10T00:00:00Z',
    content: `## The 7 Layers of OSI Model\n\n**Mnemonic:** Please Do Not Throw Sausage Pizza Away\n\n1. Physical\n2. Data Link\n3. Network\n4. Transport\n5. Session\n6. Presentation\n7. Application\n\n## Layer Details\n\n### Layer 1: Physical\nDeals with raw bit transmission. Cables, switches, hubs.\n\n### Layer 2: Data Link\nMAC addresses, frames, error detection.\n\n### Layer 3: Network\nIP addresses, routing, packets.\n\n### Layer 4: Transport\nTCP/UDP, ports, reliability.`,
  },
  {
    id: '3',
    slug: 'buffer-overflow-explained',
    title: 'Buffer Overflow Attacks: Stack Smashing Explained',
    excerpt: 'Deep dive into buffer overflow vulnerabilities, stack memory exploitation, and defense mechanisms.',
    category: 'cybersecurity',
    readTime: '12 min read',
    createdAt: '2025-03-05T00:00:00Z',
    content: `## Buffer Overflow\n\nA buffer overflow occurs when a program writes more data to a buffer than it can hold.\n\n## How Stack Smashing Works\n\n1. Function is called\n2. Stack frame created\n3. Attacker overflows buffer\n4. Overwrites return address\n5. Control hijacked\n\n## Defense\n\n- Stack canaries\n- ASLR (Address Space Layout Randomization)\n- DEP/NX bit\n- Safe programming practices`,
  },
  {
    id: '4',
    slug: 'process-scheduling-os',
    title: 'Process Scheduling in OS: FCFS, SJF, Round Robin',
    excerpt: 'Complete guide to CPU scheduling algorithms with examples, Gantt charts, and calculations.',
    category: 'os',
    readTime: '15 min read',
    createdAt: '2025-02-28T00:00:00Z',
    content: `## CPU Scheduling Algorithms\n\n### FCFS (First Come First Serve)\nSimplest algorithm. Processes served in arrival order.\n\n### SJF (Shortest Job First)\nProcess with smallest burst time runs first.\n\n### Round Robin\nEach process gets a fixed time quantum.\n\n## Performance Metrics\n\n- Turnaround time\n- Waiting time\n- Response time\n- CPU utilization`,
  },
  {
    id: '5',
    slug: 'oop-cpp-complete-guide',
    title: 'OOP in C++: Classes, Inheritance & Polymorphism',
    excerpt: 'Master Object Oriented Programming in C++ with practical examples and exam-ready explanations.',
    category: 'programming',
    readTime: '20 min read',
    createdAt: '2025-02-20T00:00:00Z',
    content: `## Object Oriented Programming in C++\n\n### Classes and Objects\n\n\`\`\`cpp\nclass Student {\npublic:\n  string name;\n  int age;\n  void display() {\n    cout << name << " " << age;\n  }\n};\n\`\`\`\n\n### Inheritance\n\n\`\`\`cpp\nclass CS_Student : public Student {\npublic:\n  string specialization;\n};\n\`\`\`\n\n### Polymorphism\n\nVirtual functions enable runtime polymorphism.`,
  },
];

const CATEGORIES = ['All', 'cybersecurity', 'networking', 'programming', 'os', 'general'];

export default function BlogScreen() {
  const router = useRouter();
  const [selectedCat, setSelectedCat] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = selectedCat === 'All'
    ? MOCK_POSTS
    : MOCK_POSTS.filter(p => p.category === selectedCat);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 800));
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#13131c', '#0d0d12']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Blog & Learn</Text>
          <Text style={styles.headerSub}>Structured articles for CS students</Text>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catRow}
        >
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, selectedCat === cat && styles.catChipActive]}
              onPress={() => setSelectedCat(cat)}
            >
              <Text style={[styles.catChipText, selectedCat === cat && styles.catChipTextActive]}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <BlogCard
              post={item}
              onPress={() => router.push({
                pathname: '/blog/[slug]',
                params: { slug: item.slug, postData: JSON.stringify(item) },
              })}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.purple} />}
        />
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
  catRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: 8,
  },
  catChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg3,
  },
  catChipActive: {
    backgroundColor: 'rgba(124,111,247,0.15)',
    borderColor: colors.purple,
  },
  catChipText: { fontSize: fontSize.sm, color: colors.text2 },
  catChipTextActive: { color: colors.purple, fontWeight: '500' },
  list: { paddingTop: spacing.md, paddingBottom: 32 },
});

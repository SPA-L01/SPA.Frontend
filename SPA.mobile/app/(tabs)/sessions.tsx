import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, radius, typography, shadows } from '@/constants/theme';
import { mockSessions, BookingSession } from '@/constants/mockData';

const STATUS_COLORS = {
  active: '#30D158',
  completed: '#8E8E93',
  cancelled: '#FF453A',
};

const STATUS_LABELS = {
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function SessionCard({ session }: { session: BookingSession }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.parkingName}>{session.parkingName}</Text>
          <Text style={styles.address}>{session.address}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: STATUS_COLORS[session.status] + '22' },
          ]}
        >
          <View
            style={[styles.statusDot, { backgroundColor: STATUS_COLORS[session.status] }]}
          />
          <Text style={[styles.statusText, { color: STATUS_COLORS[session.status] }]}>
            {STATUS_LABELS[session.status]}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailRow}>
        <DetailItem icon="grid-outline" label="Slot" value={session.slotCode} />
        <DetailItem icon="calendar-outline" label="Date" value={session.date} />
        <DetailItem
          icon="time-outline"
          label="Time"
          value={`${session.startTime} - ${session.endTime}`}
        />
        <DetailItem
          icon="cash-outline"
          label="Total"
          value={`$${session.totalPrice}`}
          highlight
        />
      </View>
    </View>
  );
}

function DetailItem({
  icon,
  label,
  value,
  highlight,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.detailItem}>
      <Ionicons name={icon} size={14} color={palette.textSecondary} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, highlight && styles.detailValueHighlight]}>
        {value}
      </Text>
    </View>
  );
}

export default function SessionsScreen() {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  const filtered =
    filter === 'all' ? mockSessions : mockSessions.filter((s) => s.status === filter);

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Done' },
    { key: 'cancelled', label: 'Cancelled' },
  ] as const;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={palette.darkBg} />

      {/* Header */}
      <View style={styles.header}>
        <SafeAreaView>
          <Text style={styles.headerTitle}>My Sessions</Text>
          <Text style={styles.headerSub}>{mockSessions.length} bookings total</Text>

          {/* Filter Pills */}
          <View style={styles.filterRow}>
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterPill, filter === f.key && styles.filterPillActive]}
                onPress={() => setFilter(f.key)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    filter === f.key && styles.filterPillTextActive,
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={48} color={palette.textSecondary} />
            <Text style={styles.emptyText}>No sessions found</Text>
          </View>
        ) : (
          filtered.map((s) => <SessionCard key={s.id} session={s} />)
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.offWhite },

  header: {
    backgroundColor: palette.darkBg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    ...typography.h1,
    color: palette.white,
    marginTop: spacing.sm,
  },
  headerSub: {
    ...typography.caption,
    color: palette.textMuted,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: 2,
  },
  filterPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: palette.darkBg2,
  },
  filterPillActive: {
    backgroundColor: palette.white,
  },
  filterPillText: {
    ...typography.label,
    color: palette.textMuted,
  },
  filterPillTextActive: {
    color: palette.darkBg,
    fontWeight: '700',
  },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md },

  card: {
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  cardHeaderLeft: { flex: 1, marginRight: spacing.sm },
  parkingName: { ...typography.h3, color: palette.textPrimary },
  address: { ...typography.caption, color: palette.textSecondary, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '600' },

  divider: {
    height: 1,
    backgroundColor: palette.border,
    marginBottom: spacing.md,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: { alignItems: 'center', gap: 2 },
  detailLabel: { ...typography.caption, color: palette.textSecondary },
  detailValue: { ...typography.label, color: palette.textPrimary, fontWeight: '600' },
  detailValueHighlight: { color: palette.black, fontWeight: '800' },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: spacing.md,
  },
  emptyText: { ...typography.body, color: palette.textSecondary },
});

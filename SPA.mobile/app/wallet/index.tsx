import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { palette, spacing, radius, typography, shadows } from '@/constants/theme';
import { mockUser, mockTransactions, Transaction } from '@/constants/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function TransactionItem({ item }: { item: Transaction }) {
  const isNegative = item.type === 'payment';
  const iconName = item.type === 'topup' ? 'add-circle' : item.type === 'refund' ? 'refresh-circle' : 'car';
  const iconColor = item.type === 'topup' ? palette.success : item.type === 'refund' ? '#5856D6' : palette.textPrimary;

  return (
    <View style={styles.transactionItem}>
      <View style={[styles.transactionIconBg, { backgroundColor: iconColor + '15' }]}>
        <Ionicons name={iconName} size={22} color={iconColor} />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle}>{item.title}</Text>
        <Text style={styles.transactionSub}>{item.subtitle}</Text>
        <Text style={styles.transactionDate}>{item.date}</Text>
      </View>
      <View style={styles.transactionAmountSection}>
        <Text style={[styles.transactionAmount, isNegative && styles.textDanger]}>
          {isNegative ? '-' : '+'}{item.amount.toLocaleString()}đ
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'success' ? '#30D15815' : '#FF9F0A15' }]}>
          <Text style={[styles.statusText, { color: item.status === 'success' ? '#30D158' : '#FF9F0A' }]}>
            {item.status === 'success' ? 'Thành công' : 'Chờ xử lý'}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function WalletScreen() {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={palette.darkBg} />

      {/* Header */}
      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerInner}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={palette.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Ví tiền của tôi</Text>
            <TouchableOpacity style={styles.supportBtn}>
              <Ionicons name="help-circle-outline" size={24} color={palette.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Card */}
        <LinearGradient
          colors={['#1A1A1E', '#2C2C2E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.cardTop}>
            <View>
              <Text style={styles.balanceLabel}>Số dư khả dụng</Text>
              <Text style={styles.balanceValue}>{mockUser.balance.toLocaleString()}đ</Text>
            </View>
            <View style={styles.logoBadge}>
              <Text style={styles.logoBadgeText}>SPA</Text>
            </View>
          </View>
          
          <View style={styles.cardDivider} />
          
          <View style={styles.cardBottom}>
            <Text style={styles.userName}>{mockUser.name.toUpperCase()}</Text>
            <View style={styles.cardType}>
              <View style={styles.cardDotRow}>
                <View style={[styles.cardDot, { backgroundColor: '#FFD700' }]} />
                <View style={[styles.cardDot, { backgroundColor: '#FFA500' }]} />
              </View>
              <Text style={styles.cardTypeText}>Platinum Member</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => router.push('/wallet/top-up')}
          >
            <View style={[styles.actionIconBg, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="add" size={24} color="#1976D2" />
            </View>
            <Text style={styles.actionText}>Nạp tiền</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => router.push('/wallet/add-card')}
          >
            <View style={[styles.actionIconBg, { backgroundColor: '#F3E5F5' }]}>
              <Ionicons name="card" size={24} color="#7B1FA2" />
            </View>
            <Text style={styles.actionText}>Thêm thẻ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <View style={[styles.actionIconBg, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="paper-plane" size={22} color="#388E3C" />
            </View>
            <Text style={styles.actionText}>Chuyển tiền</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <View style={[styles.actionIconBg, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="receipt" size={22} color="#F57C00" />
            </View>
            <Text style={styles.actionText}>Hóa đơn</Text>
          </TouchableOpacity>
        </View>

        {/* Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>
          <TouchableOpacity>
            <Text style={styles.viewMore}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionCard}>
          {mockTransactions.map((t, i) => (
            <React.Fragment key={t.id}>
              <TransactionItem item={t} />
              {i < mockTransactions.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.offWhite },
  header: { backgroundColor: palette.darkBg, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  headerInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm },
  backBtn: { padding: 4 },
  headerTitle: { ...typography.h2, color: palette.white },
  supportBtn: { padding: 4 },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md },

  balanceCard: {
    width: '100%',
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  balanceLabel: { color: palette.textMuted, fontSize: 13, fontWeight: '500', marginBottom: 4 },
  balanceValue: { color: palette.white, fontSize: 32, fontWeight: '800' },
  logoBadge: { backgroundColor: palette.white + '20', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  logoBadgeText: { color: palette.white, fontWeight: '900', fontSize: 16 },
  cardDivider: { height: 1, backgroundColor: palette.white + '10', marginVertical: spacing.lg },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userName: { color: palette.white, fontSize: 14, fontWeight: '700', letterSpacing: 1 },
  cardType: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardDotRow: { flexDirection: 'row', gap: -4 },
  cardDot: { width: 12, height: 12, borderRadius: 6 },
  cardTypeText: { color: palette.white, fontSize: 10, fontWeight: '600' },

  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xl },
  actionBtn: { alignItems: 'center', gap: 8 },
  actionIconBg: { width: 56, height: 56, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', ...shadows.sm },
  actionText: { fontSize: 12, fontWeight: '600', color: palette.textPrimary },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: spacing.md },
  sectionTitle: { ...typography.h2, color: palette.textPrimary },
  viewMore: { ...typography.caption, color: palette.textSecondary, fontWeight: '600' },

  transactionCard: { backgroundColor: palette.white, borderRadius: radius.xl, overflow: 'hidden', ...shadows.sm },
  transactionItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md },
  transactionIconBg: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  transactionInfo: { flex: 1, gap: 2 },
  transactionTitle: { fontSize: 15, fontWeight: '700', color: palette.textPrimary },
  transactionSub: { fontSize: 12, color: palette.textSecondary },
  transactionDate: { fontSize: 10, color: palette.textMuted, marginTop: 2 },
  transactionAmountSection: { alignItems: 'flex-end', gap: 4 },
  transactionAmount: { fontSize: 16, fontWeight: '800', color: palette.success },
  textDanger: { color: palette.danger },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  statusText: { fontSize: 9, fontWeight: '700' },
  divider: { height: 1, backgroundColor: palette.offWhite, marginHorizontal: spacing.md },
});

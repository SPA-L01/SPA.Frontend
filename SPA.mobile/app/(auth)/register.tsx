import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  StatusBar, ScrollView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, radius, typography, shadows } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      setError('Vui lòng điền đầy đủ các thông tin');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register({ firstName, lastName, email, password });
      Alert.alert('Tạo tài khoản thành công!', 'Vui lòng đăng nhập để tiếp tục.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join('\n') : (msg ?? 'Đăng ký thất bại'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0D0D0F', '#1A1A1E', '#2C2C30']} locations={[0, 0.5, 1]} style={styles.gradient} />
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <KeyboardAvoidingView style={styles.kav} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <Ionicons name="car" size={36} color={palette.white} />
            </View>
            <Text style={styles.appName}>SPA Parking</Text>
            <Text style={styles.tagline}>Tạo tài khoản của bạn</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Đăng ký</Text>
            <Text style={styles.cardSubtitle}>Điền thông tin chi tiết của bạn bên dưới</Text>

            {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

            {[
              { label: 'Tên', value: firstName, set: setFirstName, placeholder: 'Vd: Anh', icon: 'person-outline' },
              { label: 'Họ', value: lastName, set: setLastName, placeholder: 'Vd: Nguyễn', icon: 'person-outline' },
              { label: 'Email', value: email, set: setEmail, placeholder: 'john.doe@example.com', icon: 'mail-outline', keyboard: 'email-address' as any },
            ].map(({ label, value, set, placeholder, icon, keyboard }) => (
              <View key={label} style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{label}</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name={icon as any} size={18} color={palette.textSecondary} />
                  <TextInput style={styles.input} placeholder={placeholder} placeholderTextColor={palette.textSecondary}
                    value={value} onChangeText={set} keyboardType={keyboard} autoCapitalize="none" autoCorrect={false} />
                </View>
              </View>
            ))}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mật khẩu</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={palette.textSecondary} />
                <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor={palette.textSecondary}
                  value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={palette.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={[styles.btn, loading && styles.btnLoading]} onPress={handleRegister} activeOpacity={0.85} disabled={loading}>
              <Text style={styles.btnText}>{loading ? 'Đang tạo tài khoản…' : 'Tạo tài khoản'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.signInRow}>
            <Text style={styles.signInText}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.signInLink}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.darkBg },
  gradient: { ...StyleSheet.absoluteFillObject },
  kav: { flex: 1 },
  circle1: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: '#FFFFFF08', top: -80, right: -80 },
  circle2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: '#FFFFFF05', bottom: 200, left: -60 },
  scrollContent: { flexGrow: 1, paddingHorizontal: spacing.md, paddingTop: 80 },
  logoSection: { alignItems: 'center', marginBottom: spacing.xl, gap: spacing.sm },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFFFFF15', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FFFFFF20', marginBottom: spacing.xs },
  appName: { fontSize: 32, fontWeight: '800', color: palette.white, letterSpacing: -0.5 },
  tagline: { ...typography.body, color: palette.textMuted },
  card: { backgroundColor: palette.white, borderRadius: radius.xl + 4, padding: spacing.lg, ...shadows.lg, gap: spacing.md },
  cardTitle: { ...typography.h1, color: palette.textPrimary },
  cardSubtitle: { ...typography.body, color: palette.textSecondary, marginTop: -spacing.sm },
  errorBox: { backgroundColor: '#FEE2E2', borderRadius: radius.md, padding: spacing.sm },
  errorText: { color: '#DC2626', fontSize: 13 },
  inputGroup: { gap: spacing.xs },
  inputLabel: { ...typography.label, color: palette.textPrimary, fontWeight: '600' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: palette.offWhite, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, borderWidth: 1.5, borderColor: 'transparent' },
  input: { flex: 1, ...typography.body, color: palette.textPrimary },
  btn: { backgroundColor: palette.darkBg, paddingVertical: 16, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', marginTop: spacing.xs, ...shadows.md },
  btnLoading: { backgroundColor: palette.darkBg2 },
  btnText: { ...typography.body, color: palette.white, fontWeight: '700', fontSize: 16 },
  signInRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing.lg },
  signInText: { ...typography.body, color: palette.textMuted },
  signInLink: { ...typography.body, color: palette.white, fontWeight: '700' },
});

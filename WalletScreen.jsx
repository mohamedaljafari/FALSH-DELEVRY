import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, FlatList } from 'react-native';
import api, { newIdempotencyKey, getCurrentUserPhone } from '../services/api';

// شاشة المحفظة: عرض الرصيد، شحن، وتحويل الرصيد لزبون آخر عبر رقم الهاتف
export default function WalletScreen() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [toPhone, setToPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  async function load() {
    try {
      const w = await api.get('/wallet/me');
      setWallet(w.data);
      const t = await api.get('/wallet/me/transactions');
      setTransactions(t.data);
    } catch (e) {
      // تجاهل بصمت إن لم يكن مسجّلاً بعد
    }
  }

  useEffect(() => { load(); }, []);

  async function sendOtpForTransfer() {
    try {
      // يُرسل الرمز لرقم هاتف صاحب الحساب الحالي (المُسجَّل عند الدخول)، وليس رقم المستلم
      await api.post('/otp/request', { phone: getCurrentUserPhone(), purpose: 'wallet_transfer', channel: 'sms' });
      setOtpSent(true);
      Alert.alert('تم الإرسال', 'تم إرسال رمز التحقق عبر SMS إلى رقمك');
    } catch (e) {
      Alert.alert('خطأ', e.response?.data?.error || 'فشل إرسال رمز التحقق');
    }
  }

  async function transfer() {
    try {
      const { data } = await api.post(
        '/wallet/transfer',
        { to_phone: toPhone, amount: Number(amount), otp_code: otpCode || undefined },
        { headers: { 'Idempotency-Key': newIdempotencyKey() } } // يمنع تكرار التحويل عند ضعف الشبكة
      );
      Alert.alert('تم', data.message);
      setToPhone('');
      setAmount('');
      setOtpCode('');
      setOtpSent(false);
      load();
    } catch (e) {
      Alert.alert('خطأ', e.response?.data?.error || 'فشل التحويل');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.balance}>{wallet ? `${wallet.balance} ${wallet.currency}` : '...'}</Text>
      <Text style={styles.label}>الرصيد الحالي</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>تحويل رصيد إلى زبون آخر</Text>
        <TextInput style={styles.input} placeholder="رقم هاتف المستلم" value={toPhone} onChangeText={setToPhone} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="المبلغ" value={amount} onChangeText={setAmount} keyboardType="numeric" />
        {Number(amount) > 500 && (
          <View>
            <TouchableOpacity style={styles.otpBtn} onPress={sendOtpForTransfer}>
              <Text style={styles.otpBtnText}>{otpSent ? 'إعادة إرسال رمز التحقق' : 'إرسال رمز تحقق (OTP) لتأكيد التحويل'}</Text>
            </TouchableOpacity>
            <TextInput style={styles.input} placeholder="رمز التحقق المُرسَل" value={otpCode} onChangeText={setOtpCode} keyboardType="numeric" />
          </View>
        )}
        <TouchableOpacity style={styles.btn} onPress={transfer}>
          <Text style={styles.btnText}>تحويل</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>آخر الحركات</Text>
      <FlatList
        data={transactions}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => (
          <View style={styles.txRow}>
            <Text>{item.type}</Text>
            <Text>{item.amount}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  balance: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginTop: 20 },
  label: { textAlign: 'center', color: '#666', marginBottom: 20 },
  card: { backgroundColor: '#f7f7f7', padding: 16, borderRadius: 12, marginBottom: 20 },
  cardTitle: { fontWeight: 'bold', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 8 },
  btn: { backgroundColor: '#111', padding: 12, borderRadius: 8 },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  otpBtn: { backgroundColor: '#2563eb', padding: 10, borderRadius: 8, marginBottom: 8 },
  otpBtnText: { color: '#fff', textAlign: 'center' },
  sectionTitle: { fontWeight: 'bold', marginBottom: 8 },
  txRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
});

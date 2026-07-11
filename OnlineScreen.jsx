import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';
import api from '../services/api';

// شاشة تفعيل/إيقاف الاتصال وإرسال الموقع الحي
export default function OnlineScreen({ navigation }) {
  const [online, setOnline] = useState(false);

  async function toggleOnline() {
    try {
      if (!online) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('تنبيه', 'يجب السماح بالوصول للموقع لتفعيل الاتصال');
          return;
        }
        await api.post('/driver/online');
        setOnline(true);
      } else {
        await api.post('/driver/offline');
        setOnline(false);
      }
    } catch (e) {
      Alert.alert('خطأ', e.response?.data?.error || 'حدث خطأ');
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.toggle, { backgroundColor: online ? '#16a34a' : '#9ca3af' }]}
        onPress={toggleOnline}
      >
        <Text style={styles.toggleText}>{online ? 'متصل الآن' : 'غير متصل'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Heatmap')}>
        <Text style={styles.linkText}>عرض الخريطة الحرارية للطلب</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Earnings')}>
        <Text style={styles.linkText}>أرباحي</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  toggle: { width: 200, height: 200, borderRadius: 100, alignItems: 'center', justifyContent: 'center' },
  toggleText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  link: { marginTop: 16, padding: 12 },
  linkText: { color: '#111', fontWeight: 'bold' },
});

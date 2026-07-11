import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import api from '../services/api';

// الصفحة الرئيسية لتطبيق الزبون: تعرض بانر الصفحة الرئيسية (إن كان مفعّلاً من الأدمن)
// ثم روابط سريعة، مع تجاهل أي عنصر إذا كانت الميزة معطّلة (يُرجع الباكند 423 أو مصفوفة فارغة)
export default function HomeScreen({ navigation }) {
  const [banners, setBanners] = useState([]);
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    api.get('/public/banners').then((r) => setBanners(r.data)).catch(() => setBanners([]));
    api.get('/public/offers').then((r) => setOffers(r.data.slice(0, 5))).catch(() => setOffers([]));
  }, []);

  return (
    <ScrollView style={styles.container}>
      {banners.length > 0 && (
        <FlatList
          horizontal
          data={banners}
          keyExtractor={(b) => b.id}
          renderItem={({ item }) => (
            <Image source={{ uri: item.image_url }} style={styles.banner} />
          )}
          showsHorizontalScrollIndicator={false}
        />
      )}

      <Text style={styles.sectionTitle}>عروض اليوم</Text>
      {offers.map((o) => (
        <View key={o.id} style={styles.offerCard}>
          <Text style={styles.offerTitle}>{o.title}</Text>
          {o.description && <Text style={styles.offerDesc}>{o.description}</Text>}
        </View>
      ))}

      <TouchableOpacity style={styles.walletBtn} onPress={() => navigation.navigate('Wallet')}>
        <Text style={styles.walletBtnText}>محفظتي وتحويل الرصيد</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  banner: { width: 340, height: 140, borderRadius: 12, margin: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', margin: 12 },
  offerCard: { backgroundColor: '#f7f7f7', margin: 8, padding: 12, borderRadius: 10 },
  offerTitle: { fontWeight: 'bold' },
  offerDesc: { color: '#666', marginTop: 4 },
  walletBtn: { backgroundColor: '#111', margin: 16, padding: 14, borderRadius: 10 },
  walletBtnText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});

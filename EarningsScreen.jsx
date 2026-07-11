import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import api from '../services/api';

export default function EarningsScreen() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/driver/earnings').then((r) => setData(r.data)).catch(() => {});
  }, []);

  if (!data) return <View style={styles.center}><Text>جارِ التحميل...</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.total}>{data.totalDeliveryFees} د.ل</Text>
      <Text style={styles.label}>{data.deliveredOrdersCount} طلب مكتمل</Text>
      <FlatList
        data={data.orders}
        keyExtractor={(o) => o.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text>طلب #{item.id.slice(0, 8)}</Text>
            <Text>{item.delivery_fee} د.ل</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  total: { fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  label: { textAlign: 'center', color: '#666', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' },
});

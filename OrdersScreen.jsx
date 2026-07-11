import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import api from '../services/api';

const STATUS_FLOW = {
  pending: 'accepted',
  accepted: 'preparing',
  preparing: 'ready_for_pickup',
};

const STATUS_LABEL = {
  pending: 'بانتظار القبول',
  accepted: 'مقبول',
  preparing: 'قيد التحضير',
  ready_for_pickup: 'جاهز للاستلام',
  picked_up: 'خرج مع السائق',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
};

// شاشة استقبال الطلبات في تطبيق/بوابة المطعم
export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);

  async function load() {
    const { data } = await api.get('/orders/mine');
    setOrders(data);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000); // تحديث كل 10 ثوانٍ
    return () => clearInterval(interval);
  }, []);

  async function advanceStatus(order) {
    const next = STATUS_FLOW[order.status];
    if (!next) return;
    await api.patch(`/orders/${order.id}/status`, { status: next });
    load();
  }

  return (
    <FlatList
      style={styles.container}
      data={orders}
      keyExtractor={(o) => o.id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.orderId}>طلب #{item.id.slice(0, 8)}</Text>
          <Text style={styles.status}>{STATUS_LABEL[item.status]}</Text>
          <Text>الإجمالي: {item.total} د.ل</Text>
          {STATUS_FLOW[item.status] && (
            <TouchableOpacity style={styles.btn} onPress={() => advanceStatus(item)}>
              <Text style={styles.btnText}>الانتقال إلى: {STATUS_LABEL[STATUS_FLOW[item.status]]}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#fff' },
  card: { backgroundColor: '#f7f7f7', padding: 14, borderRadius: 10, marginBottom: 10 },
  orderId: { fontWeight: 'bold' },
  status: { color: '#666', marginVertical: 4 },
  btn: { backgroundColor: '#111', padding: 10, borderRadius: 8, marginTop: 8 },
  btnText: { color: '#fff', textAlign: 'center' },
});

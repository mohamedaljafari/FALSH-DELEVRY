import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Heatmap } from 'react-native-maps';
import api from '../services/api';

// الخريطة الحرارية: تعرض للسائق مناطق كثافة الطلب مقارنة بعدد السائقين المتاحين
// حتى يتوجّه لأكثر المناطق ربحية. الميزة بأكملها تُقفل تلقائيًا لو عطّلها الأدمن (driver.heatmap)
export default function HeatmapScreen() {
  const [points, setPoints] = useState([]);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    api.get('/driver/heatmap')
      .then((r) => {
        const pts = r.data.cells.map((c) => ({
          latitude: c.latitude,
          longitude: c.longitude,
          weight: Math.min(c.intensity, 10),
        }));
        setPoints(pts);
      })
      .catch((e) => {
        if (e.response?.status === 423) setDisabled(true);
      });
  }, []);

  if (disabled) {
    return (
      <View style={styles.center}>
        <Text>الخريطة الحرارية معطّلة حاليًا من قبل الإدارة</Text>
      </View>
    );
  }

  return (
    <MapView
      style={styles.map}
      initialRegion={{ latitude: 32.8872, longitude: 13.1913, latitudeDelta: 0.2, longitudeDelta: 0.2 }}
    >
      {points.length > 0 && (
        <Heatmap points={points} radius={40} opacity={0.7} />
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

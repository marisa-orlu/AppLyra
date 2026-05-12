import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  const Card = ({ title, onPress }: { title: string; onPress: () => void }) => (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.cardText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Image
          source={require('@/assets/images/Logo App Lyra Color_Mesa de trabajo 1 copia 5.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>

      <View style={styles.banner}>
        <Text style={styles.bannerText}>Te damos la bienvenida a Lyra</Text>
      </View>

      <View style={styles.grid}>
        <Card title="Libros" onPress={() => router.push('/(tabs)/libros' as any)} />
        <Card title="Mi biblioteca" onPress={() => router.push('/(tabs)/biblioteca' as any)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8e7f0',
    paddingTop: Platform.select({ ios: 84, default: 40 }),
    paddingHorizontal: 16,
  },
  topRow: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: '95%',
    maxWidth: 420,
    height: 170,
  },
  banner: {
    backgroundColor: '#e5b6ce',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  bannerText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 22,
    paddingHorizontal: 12,
    marginBottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    color: '#11181C',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});

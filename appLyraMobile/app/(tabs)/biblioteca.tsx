import { Image } from 'expo-image';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { getBibliotecaUsuario, getStoredUserId, toPublicImageUrl, type BibliotecaItem } from '@/services/api';

function toDateLabel(value: unknown): string {
  if (typeof value === 'number') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString('es-ES');
  }
  if (typeof value === 'string') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('es-ES');
  }
  return '-';
}

function toEstadoLabel(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const any = value as Record<string, unknown>;
    const name = any['name'] ?? any['estado'] ?? any['valor'] ?? any['value'];
    if (typeof name === 'string') return name;
    if (typeof name === 'number') return String(name);
  }
  return '-';
}

function toDisplayText(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (Array.isArray(value)) {
    const parts = value
      .map((v) => toDisplayText(v).trim())
      .filter((v) => v && v !== '-');
    return parts.join(', ');
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const candidate =
      obj['nombre'] ??
      obj['name'] ??
      obj['titulo'] ??
      obj['title'] ??
      obj['autor'] ??
      obj['genero'] ??
      obj['categoria'] ??
      obj['valor'] ??
      obj['value'] ??
      obj['label'] ??
      obj['descripcion'] ??
      obj['description'];
    const inner = toDisplayText(candidate).trim();
    if (inner && inner !== '-') return inner;
  }
  return '';
}

function toDisplayOrDash(value: unknown): string {
  const s = toDisplayText(value).trim();
  return s ? s : '-';
}

function toNullableNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = Number(value.replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const candidate = obj['puntuacion'] ?? obj['rating'] ?? obj['valor'] ?? obj['value'] ?? obj['media'] ?? obj['avg'];
    return toNullableNumber(candidate);
  }
  return null;
}

function pickFirst(obj: Record<string, unknown>, keys: string[]): unknown {
  for (const k of keys) {
    if (obj[k] != null) return obj[k];
  }
  return undefined;
}

function getLibroFromItem(item: BibliotecaItem): Record<string, unknown> {
  const anyItem = item as unknown as Record<string, unknown>;
  const candidates: unknown[] = [
    anyItem['libro'],
    anyItem['book'],
    anyItem['libroDTO'],
    anyItem['libroDto'],
    anyItem['detalleLibro'],
    anyItem['libroDetalle'],
    anyItem['libroInfo'],
  ];

  for (const c of candidates) {
    if (c && typeof c === 'object' && !Array.isArray(c)) return c as Record<string, unknown>;
  }

  return anyItem;
}

function CoverImage({ uri }: { uri: string }) {
  const [failed, setFailed] = useState(false);

  if (!uri || failed) {
    return (
      <Image
        source={require('@/assets/images/partial-react-logo.png')}
        style={styles.cover}
        contentFit="cover"
      />
    );
  }

  return (
    <Image
      source={{ uri }}
      style={styles.cover}
      contentFit="cover"
      onError={() => setFailed(true)}
    />
  );
}

function Stars({ value }: { value: number | null | undefined }) {
  const rating = typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(5, value)) : 0;
  const filled = Math.round(rating);

  return (
    <Text style={styles.stars}>
      {Array.from({ length: 5 }).map((_, idx) => (idx < filled ? '★' : '☆')).join(' ')}
      <Text style={styles.starsSuffix}>{`  ${rating}/5`}</Text>
    </Text>
  );
}

export default function BibliotecaScreen() {
  const [items, setItems] = useState<BibliotecaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fTitulo, setFTitulo] = useState('');
  const [fAutor, setFAutor] = useState('');
  const [fCategoria, setFCategoria] = useState('');
  const [fEstado, setFEstado] = useState('');
  const [fPuntuacion, setFPuntuacion] = useState('');

  const load = useCallback(async () => {
    setError(null);
    let userId = await getStoredUserId();

    if (!userId) {
      const rawUser = await SecureStore.getItemAsync('user');
      if (rawUser) {
        try {
          const u = JSON.parse(rawUser) as any;
          const candidate = u?.id ?? u?.idUsuario ?? u?.userId;
          const n = typeof candidate === 'string' ? Number(candidate) : Number(candidate);
          if (Number.isFinite(n) && n > 0) {
            userId = String(n);
            await SecureStore.setItemAsync('userId', userId);
          }
        } catch {
          // ignore
        }
      }
    }

    if (!userId) {
      setItems([]);
      setError('No se encontró el usuario (userId). Cierra sesión e inicia sesión de nuevo.');
      return;
    }

    const data = await getBibliotecaUsuario(userId);
    setItems(Array.isArray(data) ? data : []);

    if (Array.isArray(data) && data.length > 0) {
      // Útil para ver el shape real del DTO en el log
      console.log('Biblioteca ejemplo item:', data[0]);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        await load();
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message ?? 'No se pudo cargar la biblioteca');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [load]);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await load();
    } catch (e: any) {
      setError(e?.message ?? 'No se pudo actualizar');
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const emptyLabel = useMemo(() => {
    if (loading) return '';
    if (error) return '';
    return 'Aún no tienes libros en tu biblioteca.';
  }, [error, loading]);

  const filteredItems = useMemo(() => {
    const t = fTitulo.trim().toLowerCase();
    const a = fAutor.trim().toLowerCase();
    const c = fCategoria.trim().toLowerCase();
    const e = fEstado.trim().toLowerCase();
    const p = fPuntuacion.trim();
    const pNum = p ? Number(p) : NaN;

    return items.filter((item) => {
      const libro = getLibroFromItem(item);
      const anyItem = item as unknown as Record<string, unknown>;

      const titulo = toDisplayOrDash(pickFirst(libro, ['titulo', 'nombre', 'title']) ?? anyItem['titulo']).toLowerCase();
      const autor = toDisplayOrDash(pickFirst(libro, ['autor', 'autores', 'authors', 'author']) ?? anyItem['autor']).toLowerCase();
      const categoria = toDisplayOrDash(pickFirst(libro, ['genero', 'categoria', 'genre', 'category']) ?? anyItem['genero']).toLowerCase();
      const estado = toEstadoLabel(item.estado).toLowerCase();

      const puntuacion =
        toNullableNumber(anyItem['puntuacion']) ??
        toNullableNumber(anyItem['puntuacionUsuario']) ??
        toNullableNumber(anyItem['valoracion']) ??
        toNullableNumber(anyItem['rating']) ??
        toNullableNumber((libro as Record<string, unknown>)['puntuacion']);

      if (t && !titulo.includes(t)) return false;
      if (a && !autor.includes(a)) return false;
      if (c && !categoria.includes(c)) return false;
      if (e && !estado.includes(e)) return false;
      if (p) {
        if (Number.isFinite(pNum)) {
          if (puntuacion == null || puntuacion !== pNum) return false;
        } else {
          const label = puntuacion == null ? '' : String(puntuacion);
          if (!label.includes(p)) return false;
        }
      }

      return true;
    });
  }, [fAutor, fCategoria, fEstado, fPuntuacion, fTitulo, items]);

  const clearFilters = useCallback(() => {
    setFTitulo('');
    setFAutor('');
    setFCategoria('');
    setFEstado('');
    setFPuntuacion('');
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>Mi biblioteca</Text>
        <Text style={styles.headerSubtitle}>Gestiona tu biblioteca</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.centerText}>Cargando…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>No se pudo cargar</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item, index) => String(item.id ?? item.idLibroUsuario ?? index)}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={
            <View style={styles.filtersCard}>
              <View style={styles.filtersRow}>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Título</Text>
                  <TextInput
                    value={fTitulo}
                    onChangeText={setFTitulo}
                    placeholder="Buscar por título"
                    placeholderTextColor="#8c8c8c"
                    style={styles.input}
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Autor</Text>
                  <TextInput
                    value={fAutor}
                    onChangeText={setFAutor}
                    placeholder="Buscar por autor"
                    placeholderTextColor="#8c8c8c"
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.filtersRow}>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Categoría</Text>
                  <TextInput
                    value={fCategoria}
                    onChangeText={setFCategoria}
                    placeholder="Todas"
                    placeholderTextColor="#8c8c8c"
                    style={styles.input}
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Estado</Text>
                  <TextInput
                    value={fEstado}
                    onChangeText={setFEstado}
                    placeholder="Todos"
                    placeholderTextColor="#8c8c8c"
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.filtersRow}>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Puntuación</Text>
                  <TextInput
                    value={fPuntuacion}
                    onChangeText={setFPuntuacion}
                    placeholder="Todas"
                    placeholderTextColor="#8c8c8c"
                    keyboardType="decimal-pad"
                    style={styles.input}
                  />
                </View>
                <View style={styles.field} />
              </View>

              <View style={styles.filtersActions}>
                <TouchableOpacity style={styles.clearBtn} onPress={clearFilters} activeOpacity={0.85}>
                  <Text style={styles.clearBtnText}>Limpiar filtros</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          ListEmptyComponent={
            emptyLabel ? (
              <View style={styles.center}>
                <Text style={styles.emptyText}>{emptyLabel}</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const libro = getLibroFromItem(item);
            const anyItem = item as unknown as Record<string, unknown>;

            const titulo = toDisplayOrDash(pickFirst(libro, ['titulo', 'nombre', 'title']) ?? anyItem['titulo']);
            const autor = toDisplayOrDash(pickFirst(libro, ['autor', 'autores', 'authors', 'author']) ?? anyItem['autor']);
            const genero = toDisplayOrDash(pickFirst(libro, ['genero', 'categoria', 'genre', 'category']) ?? anyItem['genero']);

            const estado = toEstadoLabel(item.estado);
            const fecha = toDateLabel(item.fecha_agregacion ?? (item as any)['fechaAgregacion'] ?? (anyItem as any)['fechaAgregacion']);
            const prestamo = typeof item.isPrestamo === 'boolean' ? (item.isPrestamo ? 'Sí' : 'No') : '-';
            const puntuacion =
              toNullableNumber(anyItem['puntuacion']) ??
              toNullableNumber(anyItem['puntuacionUsuario']) ??
              toNullableNumber(anyItem['valoracion']) ??
              toNullableNumber(anyItem['rating']) ??
              toNullableNumber((libro as Record<string, unknown>)['puntuacion']);

            const rawCover = toDisplayText(pickFirst(libro, ['portada', 'imagen', 'urlImagen', 'cover', 'image', 'imageUrl']));
            const coverUri = rawCover !== '-' ? toPublicImageUrl(rawCover) : '';

            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.coverWrap}>
                    <CoverImage uri={coverUri} />
                  </View>

                  <View style={styles.meta}>
                    <Text style={styles.title} numberOfLines={2}>
                      {titulo}
                    </Text>
                    <Text style={styles.line} numberOfLines={1}>
                      <Text style={styles.label}>Autor: </Text>
                      {autor}
                    </Text>
                    <Text style={styles.line} numberOfLines={1}>
                      <Text style={styles.label}>Género: </Text>
                      {genero}
                    </Text>
                    <Text style={styles.line}>
                      <Text style={styles.label}>Estado: </Text>
                      {estado}
                    </Text>
                    <Text style={styles.line}>
                      <Text style={styles.label}>Fecha de agregación: </Text>
                      {fecha}
                    </Text>
                    <Text style={styles.line}>
                      <Text style={styles.label}>Préstamo: </Text>
                      {prestamo}
                    </Text>
                  </View>
                </View>

                <View style={styles.ratingRow}>
                  <Text style={styles.label}>Puntuación: </Text>
                  <Stars value={puntuacion} />
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3d7e6',
    paddingTop: Platform.select({ ios: 60, default: 24 }),
    paddingHorizontal: 16,
  },
  headerCard: {
    backgroundColor: '#e5b6ce',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#ffffff',
    opacity: 0.95,
    textAlign: 'center',
  },
  filtersCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  field: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#11181C',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c7b7d6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#11181C',
  },
  filtersActions: {
    alignItems: 'flex-end',
  },
  clearBtn: {
    borderWidth: 1,
    borderColor: '#c7b7d6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  clearBtnText: {
    color: '#7a6a86',
    fontWeight: '700',
    fontSize: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  centerText: {
    marginTop: 10,
    color: '#2d2d2d',
  },
  emptyText: {
    color: '#2d2d2d',
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#b00020',
    marginBottom: 6,
  },
  errorText: {
    color: '#2d2d2d',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
  },
  coverWrap: {
    width: 88,
    height: 130,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#faf7fc',
    borderWidth: 1,
    borderColor: '#c7b7d6',
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  meta: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#11181C',
    marginBottom: 6,
  },
  line: {
    fontSize: 12,
    color: '#2d2d2d',
    marginBottom: 3,
  },
  label: {
    fontWeight: '700',
    color: '#11181C',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  stars: {
    color: '#b8a1c7',
    fontSize: 12,
  },
  starsSuffix: {
    color: '#2d2d2d',
    fontSize: 12,
  },
});

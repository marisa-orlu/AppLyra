import { Image } from 'expo-image';
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

import { getLibros, toPublicImageUrl, type LibroDTO } from '@/services/api';

function toText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
}

function pickCover(libro: LibroDTO): string {
  const raw =
    toText(libro.portada) ||
    toText(libro.imagen) ||
    toText((libro as any).urlImagen) ||
    toText((libro as any).portadaUrl) ||
    toText((libro as any).imagenUrl) ||
    toText((libro as any).cover) ||
    '';
  return toPublicImageUrl(raw);
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

function toYear(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const m = value.match(/\d{4}/);
    if (m) {
      const n = Number(m[0]);
      return Number.isFinite(n) ? n : null;
    }
  }
  return null;
}

export default function LibrosScreen() {
  const [items, setItems] = useState<LibroDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fTitulo, setFTitulo] = useState('');
  const [fAutor, setFAutor] = useState('');
  const [fAnio, setFAnio] = useState('');
  const [fCategoria, setFCategoria] = useState('');

  const load = useCallback(async () => {
    setError(null);
    const page = await getLibros(0, 50);
    setItems(Array.isArray(page?.content) ? page.content : []);

    if (Array.isArray(page?.content) && page.content.length > 0) {
      console.log('Libros ejemplo item:', page.content[0]);
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
        setError(e?.message ?? 'No se pudieron cargar los libros');
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
    if (loading || error) return '';
    return 'No hay libros para mostrar.';
  }, [error, loading]);

  const filteredItems = useMemo(() => {
    const t = fTitulo.trim().toLowerCase();
    const a = fAutor.trim().toLowerCase();
    const c = fCategoria.trim().toLowerCase();
    const y = fAnio.trim();
    const yNum = y ? Number(y) : NaN;

    return items.filter((item) => {
      const titulo = toText(item.titulo || (item as any).nombre).toLowerCase();
      const autor = toText(item.autor || (item as any).autores).toLowerCase();
      const categoria = toText(item.categoria || item.genero || (item as any).genero).toLowerCase();

      const year =
        toYear((item as any).anioPublicacion) ??
        toYear((item as any).anio_publicacion) ??
        toYear((item as any).anio) ??
        toYear((item as any).year) ??
        toYear((item as any).fechaPublicacion);

      if (t && !titulo.includes(t)) return false;
      if (a && !autor.includes(a)) return false;
      if (c && !categoria.includes(c)) return false;
      if (y) {
        if (Number.isFinite(yNum)) {
          if (year == null || year !== yNum) return false;
        } else {
          const yearLabel = year == null ? '' : String(year);
          if (!yearLabel.includes(y)) return false;
        }
      }
      return true;
    });
  }, [fAnio, fAutor, fCategoria, fTitulo, items]);

  const clearFilters = useCallback(() => {
    setFTitulo('');
    setFAutor('');
    setFAnio('');
    setFCategoria('');
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>Libros</Text>
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
          numColumns={2}
          keyExtractor={(item, index) => String(item.id ?? index)}
          columnWrapperStyle={styles.row}
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
                  <Text style={styles.fieldLabel}>Año de publicación</Text>
                  <TextInput
                    value={fAnio}
                    onChangeText={setFAnio}
                    placeholder="Ej: 2024"
                    placeholderTextColor="#8c8c8c"
                    keyboardType="number-pad"
                    style={styles.input}
                  />
                </View>
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
            const titulo = toText(item.titulo || (item as any).nombre);
            const autor = toText(item.autor || (item as any).autores);
            const categoria = toText(item.categoria || item.genero || (item as any).genero);
            const coverUri = pickCover(item);

            return (
              <View style={styles.card}>
                <View style={styles.coverWrap}>
                  <CoverImage uri={coverUri} />
                </View>

                <Text style={styles.title} numberOfLines={2}>
                  {titulo}
                </Text>
                <Text style={styles.metaLine} numberOfLines={1}>
                  <Text style={styles.label}>Autor: </Text>
                  {autor || '-'}
                </Text>
                <Text style={styles.metaLine} numberOfLines={1}>
                  <Text style={styles.label}>Categoría: </Text>
                  {categoria || '-'}
                </Text>
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
  row: {
    justifyContent: 'space-between',
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
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
  },
  coverWrap: {
    width: '100%',
    aspectRatio: 0.72,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#faf7fc',
    borderWidth: 1,
    borderColor: '#c7b7d6',
    marginBottom: 10,
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#11181C',
    marginBottom: 6,
    minHeight: 36,
  },
  metaLine: {
    fontSize: 12,
    color: '#2d2d2d',
    marginBottom: 3,
  },
  label: {
    fontWeight: '700',
    color: '#11181C',
  },
});

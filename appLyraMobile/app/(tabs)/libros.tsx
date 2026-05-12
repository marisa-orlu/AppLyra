import { Image } from 'expo-image';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

import { API_URL, getLibros, toPublicImageUrl, type LibroDTO } from '@/services/api';

const API_ORIGIN = (() => {
  try {
    return new URL(API_URL).origin;
  } catch {
    return String(API_URL).replace(/\/$/, '');
  }
})();

function toText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const candidate =
      obj['url'] ??
      obj['uri'] ??
      obj['path'] ??
      obj['filename'] ??
      obj['name'] ??
      obj['portada'] ??
      obj['imagen'] ??
      obj['urlImagen'] ??
      obj['imageUrl'] ??
      obj['cover'] ??
      obj['src'];
    return toText(candidate);
  }
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
    toText((libro as any).imageUrl) ||
    '';
  return toPublicImageUrl(raw);
}

function CoverImage({ uri, authToken }: { uri: string; authToken: string | null }) {
  const [currentUri, setCurrentUri] = useState(uri);
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrentUri(uri);
    setAttempt(0);
    setFailed(false);
  }, [uri]);

  const computeFallbackUri = useCallback((u: string, nextAttempt: number): string | null => {
    if (!u) return null;
    if (!u.startsWith(API_ORIGIN)) return null;

    // Caso típico: backend devuelve /portadas/.. pero realmente sirve en /uploads/..
    if (u.includes('/portadas/')) {
      const file = u.split('/portadas/')[1];
      if (!file) return null;
      if (nextAttempt === 1) return `${API_ORIGIN}/uploads/${file}`;
      if (nextAttempt === 2) return `${API_ORIGIN}/uploads/portadas/${file}`;
    }

    // Último intento: si no lleva /uploads/ pero es del backend, prueba a meterlo en /uploads/
    if (nextAttempt === 1 && !u.includes('/uploads/')) {
      try {
        const parsed = new URL(u);
        const file = parsed.pathname.split('/').filter(Boolean).pop();
        if (file) return `${API_ORIGIN}/uploads/${file}`;
      } catch {
        return null;
      }
    }

    return null;
  }, []);

  if (!currentUri || failed) {
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
      source={
        authToken && currentUri.startsWith(API_ORIGIN)
          ? { uri: currentUri, headers: { Authorization: `Bearer ${authToken}` } }
          : { uri: currentUri }
      }
      style={styles.cover}
      contentFit="cover"
      onError={(e) => {
        const nextAttempt = attempt + 1;
        const fallback = computeFallbackUri(currentUri, nextAttempt);
        console.warn('Error cargando portada:', currentUri, (e as any)?.error ?? '');

        if (fallback && fallback !== currentUri && nextAttempt <= 2) {
          setAttempt(nextAttempt);
          setCurrentUri(fallback);
          return;
        }

        setFailed(true);
      }}
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

  const listRef = useRef<FlatList<LibroDTO>>(null);
  const [showToTop, setShowToTop] = useState(false);

  const PAGE_SIZE = 50;
  const [pageIndex, setPageIndex] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [authToken, setAuthToken] = useState<string | null>(null);

  const [fTitulo, setFTitulo] = useState('');
  const [fAutor, setFAutor] = useState('');
  const [fAnio, setFAnio] = useState('');
  const [fCategoria, setFCategoria] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const t = await SecureStore.getItemAsync('token');
        if (mounted) setAuthToken(t ?? null);
      } catch {
        if (mounted) setAuthToken(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const loadPage = useCallback(async (nextPageIndex: number, mode: 'replace' | 'append') => {
    setError(null);
    const page = await getLibros(nextPageIndex, PAGE_SIZE);
    const content = Array.isArray(page?.content) ? page.content : [];

    setItems((prev) => (mode === 'append' ? [...prev, ...content] : content));
    setPageIndex(nextPageIndex);

    const totalPages = typeof page?.totalPages === 'number' ? page.totalPages : null;
    const nextHasMore = totalPages != null ? nextPageIndex + 1 < totalPages : content.length === PAGE_SIZE;
    setHasMore(nextHasMore);

    if (content.length > 0 && nextPageIndex === 0) {
      console.log('Libros ejemplo item:', content[0]);
    }
  }, []);

  const loadFirst = useCallback(async () => {
    await loadPage(0, 'replace');
  }, [loadPage]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        await loadFirst();
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
  }, [loadFirst]);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await loadFirst();
    } catch (e: any) {
      setError(e?.message ?? 'No se pudo actualizar');
    } finally {
      setRefreshing(false);
    }
  }, [loadFirst]);

  const onEndReached = useCallback(async () => {
    if (loading || refreshing || loadingMore) return;
    if (!hasMore) return;

    try {
      setLoadingMore(true);
      await loadPage(pageIndex + 1, 'append');
    } catch (e: any) {
      setError(e?.message ?? 'No se pudieron cargar más libros');
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadPage, loading, loadingMore, pageIndex, refreshing]);

  const onScroll = useCallback((e: any) => {
    const offsetY = e?.nativeEvent?.contentOffset?.y ?? 0;
    const shouldShow = offsetY > 350;
    setShowToTop((prev) => (prev === shouldShow ? prev : shouldShow));
  }, []);

  const scrollToTop = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

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
        <Text style={styles.headerSubtitle}>Libros de AppLyra</Text>
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
          ref={listRef}
          data={filteredItems}
          numColumns={2}
          keyExtractor={(item, index) => String(item.id ?? index)}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.35}
          onScroll={onScroll}
          scrollEventThrottle={16}
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
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator />
                <Text style={styles.footerLoadingText}>Cargando más…</Text>
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
                  <CoverImage uri={coverUri} authToken={authToken} />
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

      {showToTop ? (
        <TouchableOpacity style={styles.toTopBtn} onPress={scrollToTop} activeOpacity={0.85}>
          <Text style={styles.toTopBtnText}>↑</Text>
        </TouchableOpacity>
      ) : null}
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
  footerLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  footerLoadingText: {
    marginTop: 10,
    color: '#2d2d2d',
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
  toTopBtn: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#e5b6ce',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#c7b7d6',
  },
  toTopBtnText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 24,
  },
});

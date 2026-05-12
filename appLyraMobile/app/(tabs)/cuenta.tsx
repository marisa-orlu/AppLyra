import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { API_URL, getStoredUserId, getUsuarioById, toPublicImageUrl, type UsuarioDTO } from '@/services/api';

const API_ORIGIN = (() => {
  try {
    return new URL(API_URL).origin;
  } catch {
    return String(API_URL).replace(/\/$/, '');
  }
})();

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

function pickString(...candidates: unknown[]): string {
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c;
    if (typeof c === 'number' && Number.isFinite(c)) return String(c);
  }
  return '';
}

export default function CuentaScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UsuarioDTO | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const doLogout = useCallback(async () => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync('token'),
        SecureStore.deleteItemAsync('userId'),
        SecureStore.deleteItemAsync('user'),
        SecureStore.deleteItemAsync('role'),
      ]);
    } catch {
      // ignore
    } finally {
      router.replace('/login' as any);
    }
  }, [router]);

  const onLogout = useCallback(() => {
    Alert.alert(
      'Cerrar sesión',
      '¿Seguro que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: () => doLogout() },
      ],
      { cancelable: true }
    );
  }, [doLogout]);

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

  const load = useCallback(async () => {
    setError(null);

    const userId = await getStoredUserId();
    if (!userId) {
      setUser(null);
      setError('No se encontró el usuario (userId). Cierra sesión e inicia sesión de nuevo.');
      return;
    }

    const dto = await getUsuarioById(userId);
    setUser(dto);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        await load();
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message ?? 'No se pudo cargar tu cuenta');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [load]);

  const email = useMemo(() => pickString(user?.email, (user as any)?.mail), [user]);
  const nombre = useMemo(() => pickString(user?.nombre, (user as any)?.username, (user as any)?.nick, email.split('@')[0]), [email, user]);
  const alias = useMemo(() => (email.includes('@') ? email.split('@')[0] : ''), [email]);
  const fechaRegistro = useMemo(() => {
    const v = (user as any)?.fechaRegistro ?? (user as any)?.fecha_registro ?? (user as any)?.createdAt ?? (user as any)?.fechaAlta;
    return toDateLabel(v);
  }, [user]);
  const biografia = useMemo(() => pickString(user?.biografia, (user as any)?.bio, (user as any)?.descripcion), [user]);

  const fotoRaw = useMemo(() => pickString(user?.fotoPerfil, (user as any)?.foto_perfil, (user as any)?.avatar, (user as any)?.avatarUrl), [user]);
  const fotoUrl = useMemo(() => toPublicImageUrl(fotoRaw), [fotoRaw]);

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>Cuenta</Text>
        <Text style={styles.headerSubtitle}>Gestiona tu información personal</Text>
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
        <View style={styles.card}>
          <Text style={styles.name}>{nombre || '-'}</Text>
          {!!alias && <Text style={styles.alias}>{alias}</Text>}

          <View style={styles.divider} />

          <View style={styles.avatarWrap}>
            {fotoUrl ? (
              <Image
                source={
                  authToken && fotoUrl.startsWith(API_ORIGIN)
                    ? { uri: fotoUrl, headers: { Authorization: `Bearer ${authToken}` } }
                    : { uri: fotoUrl }
                }
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <Image
                source={require('@/assets/images/partial-react-logo.png')}
                style={styles.avatar}
                contentFit="cover"
              />
            )}
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.infoLine}>
              <Text style={styles.label}>Email: </Text>
              {email || '-'}
            </Text>
            <Text style={styles.infoLine}>
              <Text style={styles.label}>Registrado: </Text>
              {fechaRegistro}
            </Text>
            <Text style={styles.infoLine}>
              <Text style={styles.label}>Biografía: </Text>
              {biografia || '-'}
            </Text>
          </View>

          <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.85} onPress={onLogout}>
            <Text style={styles.logoutBtnText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      )}
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
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  centerText: {
    marginTop: 10,
    color: '#2d2d2d',
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
    padding: 16,
    alignItems: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: '#11181C',
    textAlign: 'center',
  },
  alias: {
    marginTop: 2,
    fontSize: 13,
    color: '#2d2d2d',
    opacity: 0.8,
    textAlign: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#c7b7d6',
    opacity: 0.8,
    marginTop: 12,
    marginBottom: 14,
  },
  avatarWrap: {
    width: 78,
    height: 78,
    borderRadius: 39,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#c7b7d6',
    backgroundColor: '#faf7fc',
    marginBottom: 14,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  infoBlock: {
    width: '100%',
  },
  infoLine: {
    fontSize: 12,
    color: '#2d2d2d',
    marginBottom: 8,
  },
  label: {
    fontWeight: '700',
    color: '#11181C',
  },
  logoutBtn: {
  width: '100%',
  marginTop: 14,
  paddingVertical: 14,
  paddingHorizontal: 18,

  backgroundColor: '#f7f2fa',
  borderRadius: 12,

  borderWidth: 1,
  borderColor: '#d8c7e6',

  alignItems: 'center',
  justifyContent: 'center',

  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
},

logoutBtnText: {
  color: '#7a6a86',
  fontWeight: '600',
  fontSize: 17,
  letterSpacing: 0.3,
},

  editBtn: {
    marginTop: 6,
    backgroundColor: '#b8a1c7',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  editBtnText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});

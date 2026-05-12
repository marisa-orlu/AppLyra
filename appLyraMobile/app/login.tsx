import { login as apiLogin, decodeJwtPayload } from '@/services/api';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const extractUserId = (res: Record<string, unknown>): string | null => {
    const pickNumberId = (value: unknown): string | null => {
      const n = typeof value === 'string' ? Number(value) : Number(value as unknown);
      return Number.isFinite(n) && n > 0 ? String(n) : null;
    };

    const anyRes = res as any;
    const candidates: unknown[] = [
      anyRes?.id,
      anyRes?.id_usuario,
      anyRes?.idUsuario,
      anyRes?.userId,
      anyRes?.usuarioId,
      anyRes?.usuario?.id,
      anyRes?.usuario?.idUsuario,
      anyRes?.usuario?.id_usuario,
      anyRes?.user?.id,
      anyRes?.user?.userId,
      anyRes?.data?.id,
      anyRes?.data?.userId,
      anyRes?.data?.usuario?.id,
      anyRes?.data?.user?.id,
    ];

    for (const c of candidates) {
      const id = pickNumberId(c);
      if (id) return id;
    }

    return null;
  };

  const onSubmit = async () => {
    setErrorMessage('');
    if (!email || !contrasena) {
      setErrorMessage('Ambos campos son obligatorios');
      return;
    }

    setLoading(true);
    try {
      const res = await apiLogin(email, contrasena);

      const token = res.token ?? res.jwt ?? res.accessToken ?? res.access_token;
      const role = res.role ?? res.rol ?? null;

      if (!token) {
        setErrorMessage('Login correcto, pero no se recibió token de autenticación.');
        setLoading(false);
        return;
      }

      await SecureStore.setItemAsync('token', token);

      const resAny = res as Record<string, unknown>;
      let userId = extractUserId(resAny);

      if (!userId) {
        const payload = decodeJwtPayload(token);
        const candidates: unknown[] = [
          payload?.id,
          payload?.userId,
          payload?.usuarioId,
          payload?.id_usuario,
          payload?.uid,
          payload?.sub,
        ];
        for (const c of candidates) {
          const n = typeof c === 'string' ? Number(c) : Number(c as unknown);
          if (Number.isFinite(n) && n > 0) {
            userId = String(n);
            break;
          }
        }
      }

      if (userId) await SecureStore.setItemAsync('userId', userId);

      const usuario = (resAny as any)?.usuario ?? (resAny as any)?.user ?? (resAny as any)?.data?.usuario ?? null;
      if (usuario) await SecureStore.setItemAsync('user', JSON.stringify(usuario));

      if (role) {
        await SecureStore.setItemAsync('role', String(role));
      }

      ToastAndroid.show('Inicio de sesión realizado', ToastAndroid.SHORT);

      // Navegar a pestañas
      router.replace('/(tabs)' as any);

    } catch (err: any) {
      console.error('Login error:', err);
      const msg = err?.message || '';
      if (msg.includes('Error en login')) {
        setErrorMessage('Usuario o contraseña incorrectos');
      } else {
        setErrorMessage('No se pudo iniciar sesión. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.card}>
        <Image
          source={require('../assets/images/Logo App Lyra Color_Mesa de trabajo 1 copia 5.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Iniciar sesión</Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email *"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          placeholderTextColor="#7a6f85"
        />

        <TextInput
          value={contrasena}
          onChangeText={setContrasena}
          placeholder="Contraseña *"
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#7a6f85"
        />

        {!!errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

        <TouchableOpacity style={[styles.btnPrimary, loading && styles.btnDisabled]} onPress={onSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Iniciar sesión</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8e7f0',
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 38,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 28,
    alignItems: 'center',
  },
  logo: {
    width: 320,
    height: 125,
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: '#730182',
    marginBottom: 22,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    maxWidth: 420,
    height: 48,
    borderWidth: 1,
    borderColor: '#c7b7d6',
    borderRadius: 8,
    backgroundColor: '#faf7fc',
    color: '#2d2d2d',
    fontSize: 15,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  error: {
    color: '#b00020',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  btnPrimary: {
    width: '100%',
    maxWidth: 420,
    minHeight: 48,
    backgroundColor: '#b8a1c7',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
  },
  btnDisabled: {
    opacity: 0.8,
  },
});

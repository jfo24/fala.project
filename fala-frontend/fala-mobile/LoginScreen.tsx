import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from './AuthContext';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signInWithGoogle, signInWithFacebook, isLoading } = useAuth();

  const handleFacebookLogin = async () => {
    try {
      await signInWithFacebook();
    } catch (error) {
      console.error('Facebook login error:', error);
    }
  };

  const handlePhoneLogin = () => {
    // TODO: Implementar login com número de telemóvel
    console.log('Phone login pressed');
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('./assets/icon.png')} 
            style={styles.appIcon}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>
            Fala com alguém que te quer ouvir
          </Text>
        </View>

        <View style={styles.authContainer}>
          <TouchableOpacity
            style={[styles.googleButton, isLoading && styles.buttonDisabled]}
            onPress={signInWithGoogle}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleButtonText}>
                  Continuar com Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.facebookButton, isLoading && styles.buttonDisabled]}
            onPress={handleFacebookLogin}
            disabled={isLoading}
          >
            <Text style={styles.facebookIcon}>f</Text>
            <Text style={styles.facebookButtonText}>
              Continuar com Facebook
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.phoneButton, isLoading && styles.buttonDisabled]}
            onPress={handlePhoneLogin}
            disabled={isLoading}
          >
            <Text style={styles.phoneIcon}>📱</Text>
            <Text style={styles.phoneButtonText}>
              Continuar com número de telemóvel
            </Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            Ao continuar, aceitas os nossos Termos de Serviço e Política de Privacidade
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#BDE0FE', // Sky Blue - Pureza, calma
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'flex-start',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 5,
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  appIcon: {
    width: 380,
    height: 380,
    marginBottom: -20,
  },
  subtitle: {
    fontSize: 26,
    color: '#4A4A4A', // Dark Gray - Estabilidade
    textAlign: 'center',
    lineHeight: 36,
    fontWeight: '700',
    paddingHorizontal: 20,
  },
  authContainer: {
    marginBottom: 40,
    marginTop: 'auto',
  },
  googleButton: {
    backgroundColor: '#CDB4DB', // Lavender Dream - Espiritualidade
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 24, // Cantos muito arredondados
    marginBottom: 20,
    shadowColor: 'rgba(205,180,219,0.4)', // Sombra suave lavender
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  googleIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 12,
    backgroundColor: '#fff',
    color: '#CDB4DB', // Lavender Dream
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  facebookButton: {
    backgroundColor: '#FFC8DD', // Blush Pink - Alegria, energia
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: 'rgba(255,200,221,0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  facebookIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 12,
    backgroundColor: '#fff',
    color: '#FFC8DD',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  facebookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  phoneButton: {
    backgroundColor: '#FFAFCC', // Rose Petal - Paixão, conexão
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: 'rgba(255,175,204,0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  phoneIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  phoneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: '#8A8A8A', // Light Gray - Acolhimento
    textAlign: 'center',
    lineHeight: 18,
  },
});


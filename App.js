import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, ActivityIndicator, SafeAreaView, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';
import NetInfo from '@react-native-community/netinfo';

// =========================================================================
// VARIÁVEIS INJETADAS AUTOMATICAMENTE PELO GITHUB ACTIONS
// NÃO ALTERE ESTES NOMES DIRETAMENTE AQUI. O ROBÔ FARÁ ISSO NA COMPILAÇÃO.
// =========================================================================
const APP_CONFIG = {
  appId: "ID_INJETADO_PELO_GERADOR", 
  clubName: "NOME_INJETADO_PELO_GERADOR", 
  clubUrl: "URL_INJETADA_PELO_GERADOR", 
  // IMPORTANTE: Coloque aqui a URL final gerada pelo seu Google Apps Script (Terminada em /exec)
  googleSheetsApiUrl: "https://script.google.com/macros/s/AKfycbz01YeFqOpWZI1qbI7-4WfRXUldwi7smPhwMXwrk6O_lU5h_Yyl9n4Ucu6N1vOV9zs/exec" 
};

export default function App() {
  const [status, setStatus] = useState('LOADING'); 
  const [message, setMessage] = useState('');
  
  const checkAppStatus = async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      setStatus('SEM_INTERNET');
      return;
    }

    try {
      // Consulta a API (Google Sheets) da Sportech
      const response = await fetch(`${APP_CONFIG.googleSheetsApiUrl}?action=checkStatus&appId=${APP_CONFIG.appId}`);
      const data = await response.json();

      if (data.status === 'ATIVO') {
        setStatus('ATIVO');
      } else if (data.status === 'SUSPENSO') {
        setStatus('SUSPENSO');
        setMessage(data.message || 'Este aplicativo está temporariamente suspenso pela administração.');
      } else if (data.status === 'BLOQUEADO') {
        setStatus('BLOQUEADO');
        setMessage(data.message || 'Acesso bloqueado. Entre em contato com a administração.');
      } else {
        setStatus('BLOQUEADO');
        setMessage('Aplicativo não reconhecido pelo sistema central.');
      }
    } catch (error) {
      setStatus('SEM_INTERNET'); 
    }
  };

  useEffect(() => {
    checkAppStatus();
  }, []);

  if (status === 'LOADING') {
    return (
      <View style={styles.containerCenter}>
        <Image source={require('./assets/club-logo.png')} style={styles.clubLogo} resizeMode="contain" />
        <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
        <Text style={styles.loadingText}>Verificando credenciais...</Text>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by SPORTECH</Text>
        </View>
      </View>
    );
  }

  if (status === 'SEM_INTERNET') {
    return (
      <View style={styles.containerCenter}>
        <Text style={styles.errorTitle}>Sem Conexão</Text>
        <Text style={styles.errorText}>É necessário estar conectado à internet para acessar o aplicativo do {APP_CONFIG.clubName}.</Text>
        <Text style={styles.retryButton} onPress={checkAppStatus}>Tentar Novamente</Text>
      </View>
    );
  }

  if (status === 'SUSPENSO' || status === 'BLOQUEADO') {
    return (
      <View style={styles.containerCenter}>
        <Image source={require('./assets/club-logo.png')} style={styles.clubLogoSmall} resizeMode="contain" />
        <Text style={[styles.errorTitle, { color: status === 'BLOQUEADO' ? '#ef4444' : '#f59e0b' }]}>
          {status === 'BLOQUEADO' ? 'Acesso Bloqueado' : 'Acesso Suspenso'}
        </Text>
        <Text style={styles.errorText}>{message}</Text>
        <Text style={styles.retryButton} onPress={() => BackHandler.exitApp()}>Sair do Aplicativo</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <WebView 
        source={{ uri: APP_CONFIG.clubUrl }} 
        style={{ flex: 1 }}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={[styles.containerCenter, { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: '#fff' }]}>
             <Image source={require('./assets/club-logo.png')} style={styles.clubLogo} resizeMode="contain" />
             <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  containerCenter: { flex: 1, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', padding: 20 },
  clubLogo: { width: 150, height: 150, marginBottom: 10 },
  clubLogoSmall: { width: 80, height: 80, marginBottom: 20, opacity: 0.5 },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  errorTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  errorText: { fontSize: 16, textAlign: 'center', color: '#444', marginBottom: 30 },
  retryButton: { padding: 15, backgroundColor: '#1e293b', color: '#fff', borderRadius: 8, fontWeight: 'bold', overflow: 'hidden' },
  footer: { position: 'absolute', bottom: 30, alignItems: 'center' },
  footerText: { fontSize: 12, color: '#999', letterSpacing: 1 }
});

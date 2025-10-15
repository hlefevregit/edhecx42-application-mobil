import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import googleAuthService from '../services/googleAuthService.crossplatform';

/**
 * 🧪 Composant de test spécifique pour débugger le logout web
 */
const WebLogoutDebugger = () => {
  const [user, setUser] = useState(null);
  const [authState, setAuthState] = useState('unknown');
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`🧪 ${message}`);
  };

  useEffect(() => {
    addLog('🔄 Initialisation du debugger de logout web');
    addLog(`🌐 Platform: ${Platform.OS}`);
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      addLog(`👤 AuthStateChanged: ${currentUser ? currentUser.email : 'null'}`);
      setUser(currentUser);
      setAuthState(currentUser ? 'connected' : 'disconnected');
    });

    return () => {
      addLog('🛑 Nettoyage du listener');
      unsubscribe();
    };
  }, []);

  const testDirectFirebaseLogout = async () => {
    addLog('🔥 Test Firebase signOut direct');
    try {
      await signOut(auth);
      addLog('✅ Firebase signOut réussi');
    } catch (error) {
      addLog(`❌ Erreur Firebase signOut: ${error.message}`);
    }
  };

  const testServiceLogout = async () => {
    addLog('🔄 Test service googleAuthService.signOutGoogle()');
    try {
      const result = await googleAuthService.signOutGoogle();
      addLog(`📋 Résultat service: ${JSON.stringify(result)}`);
    } catch (error) {
      addLog(`❌ Erreur service: ${error.message}`);
    }
  };

  const testForceRefresh = async () => {
    addLog('🔄 Test forcer refresh auth state');
    try {
      await auth.currentUser?.reload();
      addLog('✅ Reload réussi');
      
      // Forcer un nouveau check
      const currentUser = auth.currentUser;
      addLog(`👤 User après reload: ${currentUser ? currentUser.email : 'null'}`);
    } catch (error) {
      addLog(`❌ Erreur reload: ${error.message}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Debug Logout Web</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.status}>
          État Auth: <Text style={authState === 'connected' ? styles.connected : styles.disconnected}>
            {authState}
          </Text>
        </Text>
        <Text style={styles.user}>
          User: {user ? user.email : 'Aucun'}
        </Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={testDirectFirebaseLogout}>
          <Text style={styles.buttonText}>🔥 Test Firebase Direct</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testServiceLogout}>
          <Text style={styles.buttonText}>⚙️ Test Service Google</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testForceRefresh}>
          <Text style={styles.buttonText}>🔄 Force Refresh</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearLogs}>
          <Text style={styles.buttonText}>🗑️ Clear Logs</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.logsContainer}>
        <Text style={styles.logsTitle}>📋 Logs:</Text>
        {logs.slice(-10).map((log, index) => (
          <Text key={index} style={styles.logText}>{log}</Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  status: {
    fontSize: 16,
    marginBottom: 5,
  },
  connected: {
    color: '#2ecc71',
    fontWeight: 'bold',
  },
  disconnected: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  user: {
    fontSize: 14,
    color: '#666',
  },
  buttonsContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logsContainer: {
    backgroundColor: '#2c3e50',
    padding: 15,
    borderRadius: 10,
    flex: 1,
  },
  logsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logText: {
    color: '#ecf0f1',
    fontSize: 12,
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

export default WebLogoutDebugger;

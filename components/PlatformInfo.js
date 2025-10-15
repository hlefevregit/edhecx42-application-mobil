import React, { useState, useEffect } from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';

const PlatformInfo = () => {
  const [platformInfo, setPlatformInfo] = useState('');

  useEffect(() => {
    const info = getPlatformInfo();
    setPlatformInfo(info);
  }, []);

  const getPlatformInfo = () => {
    switch (Platform.OS) {
      case 'web':
        return '🌐 Web Browser - Utilise Firebase Auth Web';
      case 'ios':
        return '📱 iOS - Utilise Google Sign-In natif';
      case 'android':
        return '🤖 Android - Utilise Google Sign-In natif';
      default:
        return `📱 ${Platform.OS} - Plateforme détectée`;
    }
  };

  const getColor = () => {
    switch (Platform.OS) {
      case 'web':
        return '#2196F3'; // Bleu pour web
      case 'ios':
        return '#007AFF'; // Bleu iOS
      case 'android':
        return '#4CAF50'; // Vert Android
      default:
        return '#666';
    }
  };

  return (
    <View style={[styles.container, { borderLeftColor: getColor() }]}>
      <Text style={[styles.text, { color: getColor() }]}>
        {platformInfo}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 10,
    borderRadius: 6,
    borderLeftWidth: 4,
    marginBottom: 15,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default PlatformInfo;

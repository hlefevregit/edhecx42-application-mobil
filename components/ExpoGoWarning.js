import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ExpoGoWarning = ({ onDismiss }) => {
  return (
    <View style={styles.container}>
      <View style={styles.warning}>
        <Ionicons name="information-circle" size={24} color="#FF9500" />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Mode Démo Expo Go</Text>
          <Text style={styles.message}>
            L'authentification Google est simulée avec Expo Go. 
            Pour une authentification réelle, utilisez un Development Build.
          </Text>
        </View>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
  warning: {
    flexDirection: 'row',
    backgroundColor: '#FFF3CD',
    borderColor: '#FFE69C',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  closeButton: {
    padding: 4,
  },
});

export default ExpoGoWarning;

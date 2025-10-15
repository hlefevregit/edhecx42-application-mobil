import React from 'react';
import { ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import NavigationExample from '../components/NavigationExample';

/**
 * 🧭 ÉCRAN DÉMO NAVIGATION
 * Démontre l'utilisation du nouveau système de navigation
 */
const NavigationDemoScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <NavigationExample />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
});

export default NavigationDemoScreen;

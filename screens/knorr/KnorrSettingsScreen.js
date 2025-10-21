import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function KnorrSettingsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.title}>Paramètres</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.content}>
        <Text>Paramètres du compte Knorr (à implémenter)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#F5F5F5' },
  header:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:20, paddingTop: Platform.OS==='ios'?60:40, backgroundColor:'#FFF' },
  title:{ fontSize:18, fontWeight:'700' },
  content:{ flex:1, alignItems:'center', justifyContent:'center' },
});
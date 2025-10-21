import React from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CustomTabBar({ state, descriptors, navigation }) {
  const COLORS = {
    primary: '#2d5f3e',
    textLight: '#666',
    white: '#FFFFFF',
  };

  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        let icon = 'apps';
        if (route.name === 'Feed') icon = 'newspaper-outline'; // ← Feed icon
        if (route.name === 'Create') icon = 'add-circle-outline'; // ← Icône Create
        if (route.name === 'Profile') icon = 'person-outline';

        return (
          <TouchableOpacity key={route.key} style={styles.btn} onPress={onPress} activeOpacity={0.8}>
            <Ionicons name={icon} size={24} color={focused ? COLORS.primary : COLORS.textLight} />
            <Text style={[styles.txt, focused && { color: COLORS.primary, fontWeight: '600' }]}>
              {descriptors[route.key].options.title ?? route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  btn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  txt: { marginTop: 4, fontSize: 12, color: '#666' },
});
import React from 'react';
import { Platform, TouchableOpacity, Text } from 'react-native';

export default function WebOnlyAction({ onPress, title, style, textStyle }) {
  if (Platform.OS !== 'web') return null;
  return (
    <TouchableOpacity onPress={onPress} style={style}>
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
}
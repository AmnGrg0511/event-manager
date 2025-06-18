import { TextInput, type TextInputProps } from 'react-native';

import { useThemeColor } from '../hooks/useThemeColor';

export type ThemedTextInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedTextInput({ style, lightColor, darkColor, ...rest }: ThemedTextInputProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const borderColor = useThemeColor({ light: '#ccc', dark: '#555' }, 'background');
  const placeholderTextColor = useThemeColor({ light: '#999', dark: '#888' }, 'text');

  return <TextInput style={[{ color, borderColor, borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, height: 48, fontSize: 16 }, style]} placeholderTextColor={placeholderTextColor} {...rest} />;
} 
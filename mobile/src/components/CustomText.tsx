import { Text as RNText, TextProps, StyleSheet } from 'react-native';

export function Text(props: TextProps) {
  const { style, ...rest } = props;
  
  const flatStyle = StyleSheet.flatten(style) || {};
  
  let fontFamily = 'Inter_400Regular';
  if (flatStyle.fontWeight === '500') fontFamily = 'Inter_500Medium';
  if (flatStyle.fontWeight === '600' || flatStyle.fontWeight === 'bold') fontFamily = 'Inter_600SemiBold';
  if (flatStyle.fontWeight === '700') fontFamily = 'Inter_700Bold';
  if (flatStyle.fontWeight === '800') fontFamily = 'Inter_800ExtraBold';
  if (flatStyle.fontWeight === '900') fontFamily = 'Inter_900Black';

  return <RNText style={[style, { fontFamily, fontWeight: undefined }]} {...rest} />;
}

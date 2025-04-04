import { Text, type TextProps, StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'med' | 'fade';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'med' ? styles.med : undefined,
        type === 'fade' ? styles.fade : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "CeraPro"
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "CeraPro_Medium"
  },
  title: {
    fontSize: 32,
    lineHeight: 32,
    fontFamily: "CeraPro_Bold"
  },
  subtitle: {
    fontSize: 20,
    fontFamily: "CeraPro_Medium"
  },
  mini: {
    fontSize: 14,
    fontFamily: "CeraPro_Light"
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
    fontFamily: "CeraPro_Light"
  },
  med:{
    fontSize: 18,
    fontFamily: "CeraPro_Medium"
  },
  fade:{
    fontSize: 16,
    fontFamily: "CeraPro_Light"
  }
});

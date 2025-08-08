import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { theme } from '../../utils';

interface LoadingProps {
  size?: 'small' | 'large';
  text?: string;
  overlay?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  text,
  overlay = false,
}) => {
  const Container = overlay ? View : React.Fragment;
  const containerProps = overlay ? { style: styles.overlay } : {};

  return (
    <Container {...containerProps}>
      <View style={styles.container}>
        <ActivityIndicator size={size} color={theme.colors.primary} />
        {text && <Text style={styles.text}>{text}</Text>}
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  text: {
    marginTop: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});

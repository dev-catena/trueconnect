import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { ErrorBoundary } from 'react-native';
import { UserProvider } from './src/core/context/UserContext';
import { AppNavigator } from './src/core/navigation/AppNavigator';
import { theme } from './src/core/theme';
import { View, Text, StyleSheet } from 'react-native';

class ErrorHandler extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Erro: {this.state.error?.message}</Text>
          <Text style={styles.errorStack}>{this.state.error?.stack}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
  try {
    return (
      <ErrorHandler>
        <SafeAreaProvider>
          <PaperProvider theme={theme}>
            <UserProvider>
              <StatusBar style="auto" />
              <AppNavigator />
            </UserProvider>
          </PaperProvider>
        </SafeAreaProvider>
      </ErrorHandler>
    );
  } catch (error: any) {
    console.error('App initialization error:', error);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erro ao inicializar app: {error?.message}</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#C01C28',
    marginBottom: 10,
  },
  errorStack: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
});

export default App;


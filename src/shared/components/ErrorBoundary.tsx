import React, { ReactNode } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { tokens } from "@/design/tokens";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary para capturar crashes no controlados
 * Muestra fallback UI en lugar de app blanca
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
    // Aquí iría Sentry.captureException(error) en producción
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ScrollView
          style={[
            styles.container,
            { backgroundColor: tokens.colors.neutral[950] },
          ]}
          contentContainerStyle={styles.content}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
          </View>

          <Text style={[styles.title, { color: tokens.colors.error[500] }]}>
            Oops, algo salió mal
          </Text>

          <Text style={[styles.message, { color: tokens.colors.neutral[400] }]}>
            La aplicación encontró un error inesperado.
          </Text>

          {__DEV__ && this.state.error && (
            <View
              style={[
                styles.errorBox,
                { backgroundColor: tokens.colors.neutral[900] },
              ]}
            >
              <Text
                style={[styles.errorTitle, { color: tokens.colors.error[400] }]}
              >
                Detalles (solo dev):
              </Text>
              <Text
                style={[
                  styles.errorText,
                  { color: tokens.colors.neutral[300] },
                ]}
              >
                {this.state.error.message}
              </Text>
              <Text
                style={[
                  styles.errorStack,
                  { color: tokens.colors.neutral[500] },
                ]}
              >
                {this.state.error.stack}
              </Text>
            </View>
          )}

          <Pressable
            onPress={this.handleReset}
            style={[
              styles.button,
              { backgroundColor: tokens.colors.primary[500] },
            ]}
          >
            <Text style={styles.buttonText}>Reintentar</Text>
          </Pressable>
        </ScrollView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  errorIcon: {
    fontSize: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  errorBox: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
  },
  errorTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  errorText: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  errorStack: {
    fontSize: 12,
    fontFamily: "monospace",
    marginTop: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

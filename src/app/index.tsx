import { Link } from "expo-router";
import { ScrollView, Text, StyleSheet, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useThemeStore } from "@/shared/store";

export default function HomeScreen() {
  const { t } = useTranslation();
  const { theme } = useThemeStore();

  const isDark = theme === "dark";
  const bgColor = isDark ? "#1a1a1a" : "#ffffff";
  const textColor = isDark ? "#ffffff" : "#000000";
  const accentColor = isDark ? "#007aff" : "#0066cc";
  const sectionBg = isDark ? "#2a2a2a" : "#f5f5f5";

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: bgColor }]}
      edges={["left", "right", "bottom"]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>Welcome! 🚀</Text>
          <Text style={[styles.subtitle, { color: textColor }]}>
            {t("common.welcome")}
          </Text>
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Quick Links
          </Text>

          <Link href="/playground">
            <View
              style={StyleSheet.flatten([
                styles.card,
                {
                  backgroundColor: sectionBg,
                  borderColor: accentColor,
                },
              ])}
            >
              <Text style={[styles.cardTitle, { color: textColor }]}>
                🎮 Playground
              </Text>
              <Text style={[styles.cardDesc, { color: textColor }]}>
                Test all utilities and stores
              </Text>
            </View>
          </Link>
        </View>

        {/* Getting Started */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Getting Started
          </Text>

          <View
            style={[
              styles.infoBox,
              { backgroundColor: sectionBg, borderColor: accentColor },
            ]}
          >
            <Text style={[styles.infoText, { color: textColor }]}>
              ✅ <Text style={{ fontWeight: "600" }}>Project Setup:</Text>{" "}
              TypeScript strict, ESLint, i18n, Zustand, utilities configured
            </Text>
            <Text style={[styles.infoText, { color: textColor, marginTop: 8 }]}>
              📁 <Text style={{ fontWeight: "600" }}>Folder Structure:</Text>{" "}
              src/app, src/shared, src/config
            </Text>
            <Text style={[styles.infoText, { color: textColor, marginTop: 8 }]}>
              🔧 <Text style={{ fontWeight: "600" }}>Utils Ready:</Text> dates,
              currency, numbers, validation
            </Text>
            <Text style={[styles.infoText, { color: textColor, marginTop: 8 }]}>
              🎯 <Text style={{ fontWeight: "600" }}>Stores Ready:</Text> auth,
              theme, permissions
            </Text>
          </View>
        </View>

        {/* Tips */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Useful Commands
          </Text>

          <View style={[styles.tipBox, { backgroundColor: sectionBg }]}>
            <Text style={[styles.tipText, { color: textColor }]}>
              • <Text style={{ fontFamily: "monospace" }}>npm run lint</Text> -
              Check code quality
            </Text>
            <Text style={[styles.tipText, { color: textColor }]}>
              • <Text style={{ fontFamily: "monospace" }}>npm run android</Text>{" "}
              - Run on Android
            </Text>
            <Text style={[styles.tipText, { color: textColor }]}>
              • <Text style={{ fontFamily: "monospace" }}>npm run ios</Text> -
              Run on iOS
            </Text>
            <Text style={[styles.tipText, { color: textColor }]}>
              • <Text style={{ fontFamily: "monospace" }}>npm run web</Text> -
              Run on Web
            </Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={[styles.footer, { color: textColor }]}>
          Built with Expo SDK 57 • React 19 • React Native 0.86
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    opacity: 0.7,
  },
  infoBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
  },
  tipBox: {
    borderRadius: 12,
    padding: 12,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 4,
  },
  footer: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 32,
    opacity: 0.5,
  },
});

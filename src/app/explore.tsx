import { ScrollView, Text, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeStore } from "@/shared/store";

export default function ExploreScreen() {
  const { theme } = useThemeStore();

  const isDark = theme === "dark";
  const bgColor = isDark ? "#1a1a1a" : "#ffffff";
  const textColor = isDark ? "#ffffff" : "#000000";
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
          <Text style={[styles.title, { color: textColor }]}>
            Documentation 📚
          </Text>
          <Text style={[styles.subtitle, { color: textColor }]}>
            Learn about this template
          </Text>
        </View>

        {/* Section 1 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Project Structure
          </Text>
          <View style={[styles.card, { backgroundColor: sectionBg }]}>
            <Text style={[styles.cardText, { color: textColor }]}>
              📁 <Text style={{ fontWeight: "600" }}>src/app</Text> - Route
              pages (index.tsx, playground.tsx, explore.tsx)
            </Text>
            <Text style={[styles.cardText, { color: textColor, marginTop: 8 }]}>
              📁 <Text style={{ fontWeight: "600" }}>src/config</Text> - Setup
              (env, http-client, i18n)
            </Text>
            <Text style={[styles.cardText, { color: textColor, marginTop: 8 }]}>
              📁 <Text style={{ fontWeight: "600" }}>src/shared</Text> -
              Reusable code (services, hooks, utils, stores, types)
            </Text>
            <Text style={[styles.cardText, { color: textColor, marginTop: 8 }]}>
              📁 <Text style={{ fontWeight: "600" }}>src/locales</Text> - i18n
              translations (en, es)
            </Text>
          </View>
        </View>

        {/* Section 2 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Configured Features
          </Text>
          <View style={[styles.card, { backgroundColor: sectionBg }]}>
            <Text style={[styles.cardText, { color: textColor }]}>
              ✅ <Text style={{ fontWeight: "600" }}>TypeScript Strict</Text> -
              Full type safety
            </Text>
            <Text style={[styles.cardText, { color: textColor, marginTop: 8 }]}>
              ✅ <Text style={{ fontWeight: "600" }}>ESLint</Text> - Code
              quality & style
            </Text>
            <Text style={[styles.cardText, { color: textColor, marginTop: 8 }]}>
              ✅ <Text style={{ fontWeight: "600" }}>i18n</Text> - EN/ES
              translations
            </Text>
            <Text style={[styles.cardText, { color: textColor, marginTop: 8 }]}>
              ✅ <Text style={{ fontWeight: "600" }}>Zustand</Text> - Global
              state (auth, theme, permissions)
            </Text>
            <Text style={[styles.cardText, { color: textColor, marginTop: 8 }]}>
              ✅ <Text style={{ fontWeight: "600" }}>Axios</Text> - HTTP client
              with interceptors
            </Text>
            <Text style={[styles.cardText, { color: textColor, marginTop: 8 }]}>
              ✅ <Text style={{ fontWeight: "600" }}>Utilities</Text> - Date,
              currency, numbers, validation
            </Text>
          </View>
        </View>

        {/* Section 3 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Quick Start
          </Text>
          <View style={[styles.card, { backgroundColor: sectionBg }]}>
            <Text style={[styles.cardText, { color: textColor }]}>
              1️⃣ Visit{" "}
              <Text style={{ fontFamily: "monospace" }}>/playground</Text> to
              test utilities
            </Text>
            <Text style={[styles.cardText, { color: textColor, marginTop: 8 }]}>
              2️⃣ Import stores from{" "}
              <Text style={{ fontFamily: "monospace" }}>@/shared/store</Text>
            </Text>
            <Text style={[styles.cardText, { color: textColor, marginTop: 8 }]}>
              3️⃣ Import utils from{" "}
              <Text style={{ fontFamily: "monospace" }}>@/shared/utils</Text>
            </Text>
            <Text style={[styles.cardText, { color: textColor, marginTop: 8 }]}>
              4️⃣ Use translations with{" "}
              <Text style={{ fontFamily: "monospace" }}>useTranslation()</Text>
            </Text>
            <Text style={[styles.cardText, { color: textColor, marginTop: 8 }]}>
              5️⃣ Delete{" "}
              <Text style={{ fontFamily: "monospace" }}>
                src/app/playground.tsx
              </Text>{" "}
              before production
            </Text>
          </View>
        </View>

        {/* Section 4 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Development
          </Text>
          <View style={[styles.card, { backgroundColor: sectionBg }]}>
            <Text style={[styles.cardText, { color: textColor }]}>
              🚀 <Text style={{ fontFamily: "monospace" }}>npm start</Text> -
              Start development
            </Text>
            <Text style={[styles.cardText, { color: textColor, marginTop: 8 }]}>
              🔍 <Text style={{ fontFamily: "monospace" }}>npm run lint</Text> -
              Check code quality
            </Text>
            <Text style={[styles.cardText, { color: textColor, marginTop: 8 }]}>
              📱 <Text style={{ fontFamily: "monospace" }}>npm run ios</Text> -
              Run on iOS
            </Text>
            <Text style={[styles.cardText, { color: textColor, marginTop: 8 }]}>
              🤖{" "}
              <Text style={{ fontFamily: "monospace" }}>npm run android</Text> -
              Run on Android
            </Text>
            <Text style={[styles.cardText, { color: textColor, marginTop: 8 }]}>
              🌐 <Text style={{ fontFamily: "monospace" }}>npm run web</Text> -
              Run on Web
            </Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={[styles.footer, { color: textColor }]}>
          For more info, visit{"\n"}
          <Text style={{ textDecorationLine: "underline" }}>docs.expo.dev</Text>
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
    paddingBottom: 32,
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    padding: 12,
  },
  cardText: {
    fontSize: 13,
    lineHeight: 20,
  },
  footer: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 32,
    opacity: 0.5,
  },
});

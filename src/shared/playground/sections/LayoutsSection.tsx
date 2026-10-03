import { View, Text } from "react-native";
import {
  AppLayout,
  AuthLayout,
  PublicLayout,
  ModalLayout,
} from "@/shared/layouts";
import { tokens } from "@/design/tokens";
import { styles } from "../styles/playground.styles";
import { Section } from "../components";
import type { PlaygroundColors } from "../types/playground.types";

interface LayoutsSectionProps {
  expandedSection: string;
  setExpandedSection: (id: string) => void;
  colors: PlaygroundColors;
}

/**
 * Demostración de 4 layouts reutilizables
 * - AppLayout (pantallas con header/footer)
 * - AuthLayout (login/signup centrado)
 * - PublicLayout (info pages con header)
 * - ModalLayout (modals y sheets)
 */
export function LayoutsSection({
  expandedSection,
  setExpandedSection,
  colors,
}: LayoutsSectionProps) {
  return (
    <Section
      title="🎨 Layout System (4 tipos)"
      id="layouts"
      expandedSection={expandedSection}
      setExpandedSection={setExpandedSection}
      count={4}
      colors={colors}
    >
      {/* AppLayout Demo */}
      <View
        style={[styles.layoutDemoBox, { backgroundColor: colors.sectionBg }]}
      >
        <Text style={[styles.layoutTitle, { color: colors.textColor }]}>
          1️⃣ AppLayout
        </Text>
        <Text style={[styles.layoutDescription, { color: colors.textColor }]}>
          Pantallas autenticadas (header + content + footer)
        </Text>
        <View
          style={[
            styles.layoutPreview,
            {
              backgroundColor: tokens.colors.neutral[100],
            },
          ]}
        >
          <View
            style={[
              styles.layoutPart,
              {
                backgroundColor: tokens.colors.primary[500],
              },
            ]}
          >
            <Text style={styles.layoutPartText}>Header</Text>
          </View>
          <View
            style={[
              styles.layoutPart,
              {
                flex: 1,
                backgroundColor: tokens.colors.neutral[50],
              },
            ]}
          >
            <Text style={[styles.layoutPartText, { color: "#000" }]}>
              Content
            </Text>
          </View>
          <View
            style={[
              styles.layoutPart,
              {
                backgroundColor: tokens.colors.secondary[500],
              },
            ]}
          >
            <Text style={styles.layoutPartText}>Footer</Text>
          </View>
        </View>
        <Text style={[styles.layoutUse, { color: colors.accentColor }]}>
          Dashboard, Profile, Settings
        </Text>
      </View>

      {/* AuthLayout Demo */}
      <View
        style={[styles.layoutDemoBox, { backgroundColor: colors.sectionBg }]}
      >
        <Text style={[styles.layoutTitle, { color: colors.textColor }]}>
          2️⃣ AuthLayout
        </Text>
        <Text style={[styles.layoutDescription, { color: colors.textColor }]}>
          Pantallas de autenticación (centrado)
        </Text>
        <View
          style={[
            styles.layoutPreview,
            {
              backgroundColor: tokens.colors.neutral[100],
            },
          ]}
        >
          <View style={styles.layoutCentered}>
            <View
              style={[
                styles.formBox,
                {
                  backgroundColor: tokens.colors.success[500],
                },
              ]}
            >
              <Text style={styles.layoutPartText}>Form</Text>
            </View>
          </View>
        </View>
        <Text style={[styles.layoutUse, { color: colors.accentColor }]}>
          Login, Signup, Password Reset
        </Text>
      </View>

      {/* PublicLayout Demo */}
      <View
        style={[styles.layoutDemoBox, { backgroundColor: colors.sectionBg }]}
      >
        <Text style={[styles.layoutTitle, { color: colors.textColor }]}>
          3️⃣ PublicLayout
        </Text>
        <Text style={[styles.layoutDescription, { color: colors.textColor }]}>
          Pantallas públicas (header + content scrollable)
        </Text>
        <View
          style={[
            styles.layoutPreview,
            {
              backgroundColor: tokens.colors.neutral[100],
            },
          ]}
        >
          <View
            style={[
              styles.layoutPart,
              {
                backgroundColor: tokens.colors.warning[500],
              },
            ]}
          >
            <Text style={styles.layoutPartText}>Header</Text>
          </View>
          <View
            style={[
              styles.layoutPart,
              {
                flex: 1,
                backgroundColor: tokens.colors.neutral[50],
              },
            ]}
          >
            <Text style={[styles.layoutPartText, { color: "#000" }]}>
              Content
            </Text>
          </View>
        </View>
        <Text style={[styles.layoutUse, { color: colors.accentColor }]}>
          About, Docs, Legal Pages
        </Text>
      </View>

      {/* ModalLayout Demo */}
      <View
        style={[styles.layoutDemoBox, { backgroundColor: colors.sectionBg }]}
      >
        <Text style={[styles.layoutTitle, { color: colors.textColor }]}>
          4️⃣ ModalLayout
        </Text>
        <Text style={[styles.layoutDescription, { color: colors.textColor }]}>
          Modals y bottom sheets (dismiss button)
        </Text>
        <View
          style={[
            styles.layoutPreview,
            {
              backgroundColor: tokens.colors.neutral[100],
            },
          ]}
        >
          <View
            style={[
              styles.layoutPart,
              {
                backgroundColor: tokens.colors.error[500],
              },
            ]}
          >
            <Text style={styles.layoutPartText}>X</Text>
          </View>
          <View
            style={[
              styles.layoutPart,
              {
                flex: 1,
                backgroundColor: tokens.colors.neutral[50],
              },
            ]}
          >
            <Text style={[styles.layoutPartText, { color: "#000" }]}>
              Modal
            </Text>
          </View>
        </View>
        <Text style={[styles.layoutUse, { color: colors.accentColor }]}>
          Modals, Sheets, Dialogs
        </Text>
      </View>

      {/* Info */}
      <View
        style={[
          styles.infoBox,
          {
            backgroundColor: colors.sectionBg,
            borderLeftColor: colors.accentColor,
          },
        ]}
      >
        <Text style={[styles.infoText, { color: colors.textColor }]}>
          ℹ️ Todos los layouts usan SafeArea, design tokens y soportan dark
          mode. Importa desde @/shared/layouts
        </Text>
      </View>
    </Section>
  );
}

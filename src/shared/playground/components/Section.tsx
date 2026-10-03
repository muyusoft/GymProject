import { View, Text, Pressable } from "react-native";
import { styles } from "../styles/playground.styles";
import type { SectionProps } from "../types/playground.types";

export function Section({
  title,
  id,
  children,
  count,
  expandedSection,
  setExpandedSection,
  colors,
}: SectionProps) {
  const isExpanded = expandedSection === id;

  return (
    <View
      style={[
        styles.section,
        {
          backgroundColor: colors.sectionBg,
          borderColor: colors.borderColor,
        },
      ]}
    >
      <Pressable
        onPress={() => setExpandedSection(isExpanded ? "" : id)}
        style={styles.sectionHeader}
      >
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, { color: colors.textColor }]}>
            {title} {isExpanded ? "▼" : "▶"}
          </Text>
          {count !== undefined && (
            <Text style={[styles.sectionCount, { color: colors.accentColor }]}>
              {count}
            </Text>
          )}
        </View>
      </Pressable>
      {isExpanded && (
        <View
          style={[
            styles.sectionContent,
            { borderTopColor: colors.borderColor },
          ]}
        >
          {children}
        </View>
      )}
    </View>
  );
}

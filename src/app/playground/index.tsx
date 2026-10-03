import "@/config/i18n";
import { ScrollView, View, Text } from "react-native";
import { useAuthStore } from "@/shared/store";
import { tokens } from "@/design/tokens";
import {
  usePlaygroundState,
  usePlaygroundColors,
  useFilteredIcons,
} from "@/shared/playground/hooks";
import { ControlsBar } from "@/shared/playground/components";
import {
  IconsSection,
  DesignTokensSection,
  UtilsSection,
  AuthSection,
  LayoutsSection,
} from "@/shared/playground/sections";
import { styles } from "@/shared/playground/styles/playground.styles";

export default function PlaygroundScreen() {
  const { user } = useAuthStore();
  const playgroundState = usePlaygroundState();
  const colors = usePlaygroundColors();
  const filteredIcons = useFilteredIcons(playgroundState.searchIcons);
  const fiveMinutesAgo = new Date(Date.now() - 1000 * 60 * 5);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bgColor }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <Text
        style={[
          styles.title,
          {
            color: colors.textColor,
            fontSize: tokens.typography.fontSize["4xl"],
          },
        ]}
      >
        🎮 Playground
      </Text>
      <Text style={[styles.subtitle, { color: colors.textColor }]}>
        Design Tokens + 49 Icons + Utils
      </Text>

      {/* Controls */}
      <ControlsBar colors={colors} />

      {/* Sections */}
      <IconsSection
        expandedSection={playgroundState.expandedSection}
        setExpandedSection={playgroundState.setExpandedSection}
        colors={colors}
        filteredIcons={filteredIcons}
        iconSize={playgroundState.iconSize}
        searchIcons={playgroundState.searchIcons}
        onIconSizeChange={playgroundState.setIconSize}
        onSearchChange={playgroundState.setSearchIcons}
      />

      <DesignTokensSection
        expandedSection={playgroundState.expandedSection}
        setExpandedSection={playgroundState.setExpandedSection}
        colors={colors}
      />

      <UtilsSection
        expandedSection={playgroundState.expandedSection}
        setExpandedSection={playgroundState.setExpandedSection}
        colors={colors}
        fiveMinutesAgo={fiveMinutesAgo}
      />

      <LayoutsSection
        expandedSection={playgroundState.expandedSection}
        setExpandedSection={playgroundState.setExpandedSection}
        colors={colors}
      />

      <AuthSection
        expandedSection={playgroundState.expandedSection}
        setExpandedSection={playgroundState.setExpandedSection}
        colors={colors}
        user={user}
      />

      {/* Info */}
      <View
        style={[
          styles.info,
          {
            backgroundColor: colors.sectionBg,
            borderColor: colors.borderColor,
          },
        ]}
      >
        <Text style={[styles.infoText, { color: colors.textColor }]}>
          ℹ️ Este playground es solo para desarrollo. Elimina src/app/playground
          cuando clones la plantilla.
        </Text>
      </View>
    </ScrollView>
  );
}

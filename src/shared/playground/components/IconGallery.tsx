import { View, Text, TextInput } from "react-native";
import IconRenderer from "@/shared/icons/icon-renderer";
import { tokens } from "@/design/tokens";
import { styles } from "../styles/playground.styles";
import { SizeSlider } from "./SizeSlider";
import type { IconGalleryProps } from "../types/playground.types";
import type { IconName } from "@/shared/icons";

export function IconGallery({
  filteredIcons,
  iconSize,
  colors,
  onIconSizeChange,
  searchIcons,
  onSearchChange,
}: Readonly<IconGalleryProps>) {
  const isDark = colors.bgColor === tokens.colors.neutral[950];

  return (
    <View>
      <TextInput
        style={[
          styles.searchInput,
          {
            backgroundColor: colors.sectionBg,
            color: colors.textColor,
            borderColor: colors.borderColor,
          },
        ]}
        placeholder="Search icons..."
        placeholderTextColor={isDark ? "#888" : "#aaa"}
        value={searchIcons}
        onChangeText={onSearchChange}
      />

      <SizeSlider
        size={iconSize}
        onSizeChange={onIconSizeChange}
        colors={colors}
      />

      <View style={styles.iconsGallery}>
        {filteredIcons.map((iconName) => (
          <View key={iconName} style={styles.iconGridItem}>
            <View
              style={[
                styles.iconDisplayBox,
                {
                  backgroundColor: colors.sectionBg,
                  borderColor: colors.borderColor,
                },
              ]}
            >
              <IconRenderer
                name={iconName as IconName}
                size={iconSize}
                color={colors.textColor}
              />
            </View>
            <Text
              style={[
                styles.iconName,
                {
                  color: colors.textColor,
                  fontSize: tokens.typography.fontSize.xs,
                },
              ]}
              numberOfLines={2}
            >
              {iconName}
            </Text>
          </View>
        ))}
      </View>

      {filteredIcons.length === 0 && (
        <Text style={[styles.noResults, { color: colors.textColor }]}>
          No icons found for "{searchIcons}"
        </Text>
      )}
    </View>
  );
}

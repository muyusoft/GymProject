import { Text } from "react-native";
import { tokens } from "@/design/tokens";
import { Section, ColorPalette } from "../components";
import type { PlaygroundColors } from "../types/playground.types";

interface DesignTokensSectionProps {
  expandedSection: string;
  setExpandedSection: (id: string) => void;
  colors: PlaygroundColors;
}

export function DesignTokensSection({
  expandedSection,
  setExpandedSection,
  colors,
}: DesignTokensSectionProps) {
  return (
    <>
      <Section
        title="🎨 Design Tokens - Colors"
        id="colors"
        expandedSection={expandedSection}
        setExpandedSection={setExpandedSection}
        colors={colors}
      >
        <ColorPalette
          name="Primary"
          colors={tokens.colors.primary}
          textColor={colors.textColor}
        />
        <ColorPalette
          name="Secondary"
          colors={tokens.colors.secondary}
          textColor={colors.textColor}
        />
        <ColorPalette
          name="Success"
          colors={tokens.colors.success}
          textColor={colors.textColor}
        />
        <ColorPalette
          name="Error"
          colors={tokens.colors.error}
          textColor={colors.textColor}
        />
        <ColorPalette
          name="Warning"
          colors={tokens.colors.warning}
          textColor={colors.textColor}
        />
        <ColorPalette
          name="Neutral"
          colors={tokens.colors.neutral}
          textColor={colors.textColor}
        />
      </Section>

      <Section
        title="✍️ Design Tokens - Typography"
        id="typography"
        expandedSection={expandedSection}
        setExpandedSection={setExpandedSection}
        colors={colors}
      >
        {["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"].map(
          (size: any) => (
            <Text
              key={size}
              style={{
                color: colors.textColor,
                fontSize: (tokens.typography.fontSize as any)[size],
                marginBottom: tokens.spacing[2],
              }}
            >
              Font Size {size} ({(tokens.typography.fontSize as any)[size]}
              px)
            </Text>
          ),
        )}
      </Section>
    </>
  );
}

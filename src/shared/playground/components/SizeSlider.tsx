import { View, Text, Pressable } from "react-native";
import { styles } from "../styles/playground.styles";
import type { PlaygroundColors } from "../types/playground.types";

interface SizeSliderProps {
  size: number;
  onSizeChange: (size: number) => void;
  colors: PlaygroundColors;
  min?: number;
  max?: number;
  step?: number;
}

const DEFAULT_MIN = 16;
const DEFAULT_MAX = 64;
const DEFAULT_STEP = 4;

export function SizeSlider({
  size,
  onSizeChange,
  colors,
  min = DEFAULT_MIN,
  max = DEFAULT_MAX,
  step = DEFAULT_STEP,
}: SizeSliderProps) {
  const handleDecrease = () => {
    onSizeChange(Math.max(min, size - step));
  };

  const handleIncrease = () => {
    onSizeChange(Math.min(max, size + step));
  };

  const percentage = ((size - min) / (max - min)) * 100;

  return (
    <View
      style={[
        styles.sliderContainer,
        {
          backgroundColor: colors.sectionBg,
          borderColor: colors.borderColor,
        },
      ]}
    >
      <Text style={[styles.sliderLabel, { color: colors.textColor }]}>
        Icon Size: {size}px
      </Text>
      <View style={styles.sliderControls}>
        <Pressable
          onPress={handleDecrease}
          style={[styles.sliderButton, { backgroundColor: colors.accentColor }]}
        >
          <Text style={styles.sliderButtonText}>−</Text>
        </Pressable>

        <View
          style={[styles.sliderTrack, { backgroundColor: colors.borderColor }]}
        >
          <View
            style={[
              styles.sliderFill,
              {
                backgroundColor: colors.accentColor,
                width: `${percentage}%`,
              },
            ]}
          />
        </View>

        <Pressable
          onPress={handleIncrease}
          style={[styles.sliderButton, { backgroundColor: colors.accentColor }]}
        >
          <Text style={styles.sliderButtonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

import { StyleProp, ImageStyle } from "react-native";

interface IconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ImageStyle>;
}

/**
 * Hook para normalizar props de iconos
 * Uso en componentes: const iconProps = useIcon({ size: 24, color: 'red' })
 */
export const useIcon = ({
  size = 24,
  color = "currentColor",
  style,
}: IconProps = {}) => {
  return {
    width: size,
    height: size,
    color,
    style,
  };
};

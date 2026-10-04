import type { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";
import type { Tabs } from "expo-router";
import { tokens } from "@/design/tokens";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { getTabColors } from "@/shared/utils/tab-bar.utils";
import { TabBarItem } from "./TabBarItem";

const TAB_ICON_SIZE = 24;

export type TabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>["tabBar"]>
>[0];

type TabRoute = TabBarProps["state"]["routes"][number];

export function TabBar({ state, descriptors, navigation, insets }: TabBarProps) {
  const { c } = useOverloadTheme();

  const handlePress = (route: TabRoute, isFocused: boolean) => {
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name, route.params);
    }
  };

  const handleLongPress = (route: TabRoute) =>
    navigation.emit({ type: "tabLongPress", target: route.key });

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: c.surface,
          borderTopColor: c.border,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const options = descriptors[route.key]?.options;
        const isFocused = state.index === index;
        const colors = getTabColors(isFocused, c);
        return (
          <TabBarItem
            key={route.key}
            label={options?.title ?? route.name}
            icon={options?.tabBarIcon?.({
              focused: isFocused,
              color: colors.icon,
              size: TAB_ICON_SIZE,
            })}
            isFocused={isFocused}
            labelColor={colors.label}
            onPress={() => handlePress(route, isFocused)}
            onLongPress={() => handleLongPress(route)}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: tokens.spacing[1],
  },
});

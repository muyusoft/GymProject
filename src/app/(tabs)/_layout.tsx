import { Tabs } from "expo-router";
import type { ColorValue } from "react-native";
import { useTranslation } from "react-i18next";
import { TabBar, type TabBarProps } from "@/shared/components";
import type { IconName } from "@/shared/icons";
import IconRenderer from "@/shared/icons/icon-renderer";

const TAB_ROUTES = [
  { name: "index", labelKey: "tabs.today", icon: "dumbbell" },
  { name: "routines", labelKey: "tabs.routines", icon: "calendar" },
  { name: "progress", labelKey: "tabs.progress", icon: "bar-chart" },
  { name: "settings", labelKey: "tabs.profile", icon: "user" },
] as const satisfies readonly {
  name: string;
  labelKey: string;
  icon: IconName;
}[];

const renderTabIcon =
  (name: IconName) =>
  ({ color, size }: { color: ColorValue; size: number }) => (
    <IconRenderer
      name={name}
      size={size}
      {...(typeof color === "string" && { color })}
    />
  );

const renderTabBar = (props: TabBarProps) => <TabBar {...props} />;

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={renderTabBar}>
      {TAB_ROUTES.map(({ name, labelKey, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{ title: t(labelKey), tabBarIcon: renderTabIcon(icon) }}
        />
      ))}
    </Tabs>
  );
}

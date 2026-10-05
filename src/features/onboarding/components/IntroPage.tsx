import type { ComponentType } from "react";
import { ScrollView, StyleSheet, useWindowDimensions } from "react-native";
import { tokens } from "@/design/tokens";
import type { IntroStep } from "../types/intro.types";
import { IntroBodyArt } from "./IntroBodyArt";
import { IntroLogArt } from "./IntroLogArt";
import { IntroMusclesArt } from "./IntroMusclesArt";
import { IntroPlanArt } from "./IntroPlanArt";
import { IntroProgressArt } from "./IntroProgressArt";

const ART_BY_STEP: Record<IntroStep, ComponentType> = {
  plan: IntroPlanArt,
  log: IntroLogArt,
  progress: IntroProgressArt,
  muscles: IntroMusclesArt,
  body: IntroBodyArt,
};

interface IntroPageProps {
  step: IntroStep;
}

/** Una página de la introducción: su ilustración, centrada y con scroll propio si no cabe. */
export function IntroPage({ step }: Readonly<IntroPageProps>) {
  const { width } = useWindowDimensions();
  const Art = ART_BY_STEP[step];

  return (
    <ScrollView style={{ width }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Art />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: tokens.dimensions.screenGutter,
    paddingVertical: tokens.spacing[4],
  },
});

import { router } from "expo-router";
import { useCallback } from "react";
import { FlatList, StyleSheet, useWindowDimensions, View, type ListRenderItem } from "react-native";
import { useIntroPager } from "../hooks/use-intro-pager";
import { INTRO_STEPS, type IntroStep } from "../types/intro.types";
import { IntroPage } from "./IntroPage";
import { IntroPanel } from "./IntroPanel";
import { IntroTopBar } from "./IntroTopBar";

const keyOfStep = (step: IntroStep) => step;
const renderPage: ListRenderItem<IntroStep> = ({ item }) => <IntroPage step={item} />;

function finishIntro() {
  router.replace("/welcome");
}

/** Introducción para usuarios nuevos: cinco tarjetas deslizables que explican qué hace la app. */
export function IntroScreen() {
  const { width } = useWindowDimensions();
  const pager = useIntroPager(width);
  const getItemLayout = useCallback(
    (_data: unknown, index: number) => ({ length: width, offset: width * index, index }),
    [width],
  );

  return (
    <View style={styles.screen}>
      <IntroTopBar index={pager.index} onSkip={finishIntro} />
      <FlatList
        ref={pager.listRef}
        data={INTRO_STEPS}
        keyExtractor={keyOfStep}
        renderItem={renderPage}
        getItemLayout={getItemLayout}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={pager.handleScrollEnd}
        style={styles.pages}
      />
      <IntroPanel index={pager.index} onBack={pager.goBack} onNext={pager.isLast ? finishIntro : pager.goNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  pages: { flex: 1 },
});

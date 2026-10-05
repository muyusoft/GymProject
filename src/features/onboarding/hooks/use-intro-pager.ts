import { useCallback, useRef, useState, type RefObject } from "react";
import type { FlatList, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { INTRO_STEPS, type IntroStep } from "../types/intro.types";
import { clampStep, isLastStep, pageFromOffset } from "../utils/intro.utils";

const TOTAL = INTRO_STEPS.length;

interface IntroPager {
  listRef: RefObject<FlatList<IntroStep> | null>;
  index: number;
  isLast: boolean;
  goNext: () => void;
  goBack: () => void;
  handleScrollEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

/** Paso actual de la introducción, sincronizado entre el deslizamiento y los botones. */
export function useIntroPager(pageWidth: number): IntroPager {
  const listRef = useRef<FlatList<IntroStep>>(null);
  const [index, setIndex] = useState(0);

  const goTo = useCallback(
    (next: number) => {
      const target = clampStep(next, TOTAL);
      listRef.current?.scrollToOffset({ offset: target * pageWidth, animated: true });
      setIndex(target);
    },
    [pageWidth],
  );

  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      setIndex(pageFromOffset(event.nativeEvent.contentOffset.x, pageWidth, TOTAL));
    },
    [pageWidth],
  );

  return {
    listRef,
    index,
    isLast: isLastStep(index, TOTAL),
    goNext: () => goTo(index + 1),
    goBack: () => goTo(index - 1),
    handleScrollEnd,
  };
}

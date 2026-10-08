import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/** Si la persona pidió al sistema reducir el movimiento: las animaciones decorativas deben quedarse quietas. */
export function useReduceMotion(): boolean {
  const [isReduced, setIsReduced] = useState(false);

  useEffect(() => {
    let isMounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (isMounted) setIsReduced(value);
    });
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setIsReduced,
    );
    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  return isReduced;
}

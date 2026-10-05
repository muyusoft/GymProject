import { parseISO } from "date-fns";
import { useCallback, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { Button } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { IconRenderer } from "@/shared/icons/icon-renderer";
import { toIsoDate } from "@/shared/utils/week.utils";
import { useWeekHistory } from "../hooks/use-week-history";
import type { WeekStripDay } from "../types/workout.types";
import { weekIndexOf, type WeekPage } from "../utils/week-history.utils";
import { CalendarSheet } from "./CalendarSheet";
import { WeekStrip } from "./WeekStrip";

const ICON_SIZE = 24;
const keyOf = (page: WeekPage) => page.key;

interface WeekPagerProps {
  today: Date;
  currentWeek: readonly WeekStripDay[];
  /** Abre lo que se hizo ese día. */
  onSelectDay: (date: Date) => void;
}

/** La franja de la semana, deslizable hacia semanas pasadas, con salto a un día por calendario. */
export function WeekPager({ today, currentWeek, onSelectDay }: Readonly<WeekPagerProps>) {
  const { t, i18n } = useTranslation();
  const { c } = useOverloadTheme();
  const { pages, trainedDates } = useWeekHistory({ today, currentWeek });
  const list = useRef<FlatList<WeekPage>>(null);
  const [width, setWidth] = useState(0);
  // Se cuenta desde la semana actual para que no se mueva cuando aparecen semanas más viejas.
  const [weeksBack, setWeeksBack] = useState(0);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const lastIndex = pages.length - 1;
  const page = pages[Math.max(0, lastIndex - weeksBack)];

  const goTo = (index: number) => {
    setWeeksBack(lastIndex - index);
    list.current?.scrollToIndex({ index, animated: true });
  };
  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width > 0) setWeeksBack(lastIndex - Math.round(event.nativeEvent.contentOffset.x / width));
  };
  const handleCalendarSelect = (date: Date) => {
    setIsCalendarOpen(false);
    const index = weekIndexOf(pages, date);
    if (index !== null) goTo(index);
    if (trainedDates.has(toIsoDate(date))) onSelectDay(date);
  };
  const renderPage = useCallback(
    ({ item }: { item: WeekPage }) => (
      <View style={{ width }}>
        <WeekStrip days={item.days} onSelectDay={onSelectDay} />
      </View>
    ),
    [width, onSelectDay],
  );

  const formatDay = (date: Date | undefined) =>
    date ? new Intl.DateTimeFormat(i18n.language, { day: "numeric", month: "short" }).format(date) : "";

  return (
    <View style={styles.pager} onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)}>
      <View style={styles.header}>
        <Text style={[styles.range, { color: c.textSecondary }]}>
          {t("today.week.range", { from: formatDay(page?.days[0]?.date), to: formatDay(page?.days.at(-1)?.date) })}
        </Text>
        {weeksBack > 0 && <Button variant="ghost" label={t("today.week.backToToday")} onPress={() => goTo(lastIndex)} />}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("today.week.openCalendar")}
          onPress={() => setIsCalendarOpen(true)}
          style={styles.calendar}
        >
          <IconRenderer name="calendar" size={ICON_SIZE} color={c.text} />
        </Pressable>
      </View>
      {width > 0 && (
        <FlatList
          // Al cargar semanas más viejas la lista crece por delante: se vuelve a montar en la misma semana.
          key={pages.length}
          ref={list}
          data={pages}
          keyExtractor={keyOf}
          renderItem={renderPage}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={Math.max(0, lastIndex - weeksBack)}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          onMomentumScrollEnd={handleScrollEnd}
        />
      )}
      <CalendarSheet
        isVisible={isCalendarOpen}
        today={today}
        firstDate={parseISO(pages[0]?.key ?? toIsoDate(today))}
        trainedDates={trainedDates}
        onSelect={handleCalendarSelect}
        onClose={() => setIsCalendarOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pager: { gap: tokens.spacing[2] },
  header: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[2] },
  range: { ...getTextStyle("label"), flex: 1 },
  calendar: {
    width: tokens.dimensions.minTouch,
    height: tokens.dimensions.minTouch,
    alignItems: "center",
    justifyContent: "center",
  },
});

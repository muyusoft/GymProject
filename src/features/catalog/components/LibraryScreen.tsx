import { router } from "expo-router";
import { useCallback } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getTextStyle, tokens } from "@/design/tokens";
import { AsyncStateView, EmptyState, InlineError, ScreenHeader } from "@/shared/components";
import { useOverloadTheme } from "@/shared/hooks/use-overload-theme";
import { useLibrary } from "../hooks/use-library";
import type { LibraryRow } from "../types/catalog.types";
import { LibraryFilterBar } from "./LibraryFilterBar";
import { LibraryListRow } from "./LibraryListRow";
import { LibrarySearchField } from "./LibrarySearchField";

interface LibraryScreenProps {
  dayId?: string | undefined;
}

const keyOf = (row: LibraryRow) => (row.kind === "section" ? row.key : row.exercise.id);

export function LibraryScreen({ dayId }: LibraryScreenProps) {
  const { t } = useTranslation();
  const { c } = useOverloadTheme();
  const library = useLibrary(dayId);
  const { canAdd, addToDay, filters } = library;

  const renderItem = useCallback(
    ({ item }: { item: LibraryRow }) =>
      item.kind === "section" ? (
        <Text style={[styles.section, { color: c.textSecondary }]}>
          {t(`library.section.${item.key}`)}
        </Text>
      ) : (
        <LibraryListRow exercise={item.exercise} canAdd={canAdd} onAdd={(id) => void addToDay(id)} />
      ),
    [c.textSecondary, t, canAdd, addToDay],
  );

  const eyebrow =
    library.targetWeekday === null
      ? t("library.eyebrow")
      : t("library.eyebrowDay", { weekday: t(`weekday.long.${library.targetWeekday}`) });

  const header = (
    <View style={styles.header}>
      <ScreenHeader eyebrow={eyebrow} onBack={() => router.back()} />
      <Text style={[styles.title, { color: c.text }]}>{t("library.title")}</Text>
      <LibrarySearchField value={filters.query} onChange={library.setQuery} />
      <LibraryFilterBar
        filters={filters}
        onCategoryChange={library.setCategory}
        onEquipmentChange={library.setEquipment}
      />
      {library.hasError && <InlineError message={t("common.saveError")} />}
    </View>
  );

  return (
    <AsyncStateView status={library.status} onRetry={() => void library.reload()}>
      <FlatList
        data={library.rows}
        keyExtractor={keyOf}
        renderItem={renderItem}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <EmptyState title={t("library.empty")} />
        }
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      />
    </AsyncStateView>
  );
}

const styles = StyleSheet.create({
  content: { gap: tokens.spacing[2], padding: tokens.dimensions.screenGutter },
  header: { gap: tokens.spacing[3], paddingBottom: tokens.spacing[2] },
  title: getTextStyle("displayLg"),
  section: { ...getTextStyle("label"), marginTop: tokens.spacing[3] },
});

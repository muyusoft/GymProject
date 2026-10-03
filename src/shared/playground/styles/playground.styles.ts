import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.7,
  },
  controls: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
  },
  button: {
    paddingVertical: 8,
    borderRadius: 6,
    justifyContent: "center",
  },
  buttonText: {
    fontWeight: "500",
    textAlign: "center",
    color: "#fff",
  },

  // Section styles
  section: {
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  sectionHeader: {
    padding: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: "500",
  },
  sectionContent: {
    padding: 12,
    borderTopWidth: 1,
  },

  // Label styles
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  value: {
    fontSize: 13,
    fontWeight: "600",
  },

  // Palette styles
  paletteSection: {
    marginBottom: 12,
  },
  paletteName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  colorBox: {
    alignItems: "center",
    width: "48%",
  },
  colorSwatch: {
    width: "100%",
    height: 60,
    borderRadius: 8,
    marginBottom: 4,
  },
  colorLabel: {
    textAlign: "center",
  },

  // Search styles
  searchInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 16,
  },

  // Icon gallery styles
  iconsGallery: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  iconGridItem: {
    width: "32%",
    alignItems: "center",
  },
  iconDisplayBox: {
    width: "100%",
    aspectRatio: 1,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  iconName: {
    textAlign: "center",
  },
  noResults: {
    textAlign: "center",
    fontSize: 14,
    marginTop: 20,
  },

  // Slider styles
  sliderContainer: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 10,
  },
  sliderControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sliderButton: {
    width: 40,
    height: 40,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  sliderButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  sliderFill: {
    height: 6,
    borderRadius: 3,
  },

  // Layout section styles
  layoutDemoBox: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  layoutTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  layoutDescription: {
    fontSize: 12,
    marginBottom: 12,
    fontWeight: "400",
  },
  layoutPreview: {
    height: 120,
    borderRadius: 6,
    marginBottom: 8,
    overflow: "hidden",
    flexDirection: "column",
  },
  layoutPart: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  layoutPartText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  layoutCentered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  formBox: {
    width: 100,
    height: 60,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  layoutUse: {
    fontSize: 11,
    fontWeight: "500",
  },
  infoBox: {
    borderLeftWidth: 4,
    borderRadius: 6,
    padding: 12,
    marginTop: 12,
  },

  // Info styles
  info: {
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 12,
    fontStyle: "italic",
  },
});

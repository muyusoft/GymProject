import { Section, Label } from "../components";
import {
  dateUtils,
  currencyUtils,
  numberUtils,
  validationUtils,
} from "@/shared/utils";
import type { PlaygroundColors } from "../types/playground.types";

interface UtilsSectionProps {
  expandedSection: string;
  setExpandedSection: (id: string) => void;
  colors: PlaygroundColors;
  fiveMinutesAgo: Date;
}

export function UtilsSection({
  expandedSection,
  setExpandedSection,
  colors,
  fiveMinutesAgo,
}: Readonly<UtilsSectionProps>) {
  return (
    <>
      <Section
        title="📅 Utils - Dates"
        id="dates"
        expandedSection={expandedSection}
        setExpandedSection={setExpandedSection}
        colors={colors}
      >
        <Label
          label="Today"
          value={dateUtils.formatDate(new Date())}
          colors={colors}
        />
        <Label
          label="DateTime"
          value={dateUtils.formatDateTime(new Date())}
          colors={colors}
        />
        <Label
          label="Relative"
          value={dateUtils.formatRelative(fiveMinutesAgo)}
          colors={colors}
        />
        <Label
          label="Time"
          value={dateUtils.formatTime(new Date())}
          colors={colors}
        />
      </Section>

      <Section
        title="💵 Utils - Currency"
        id="currency"
        expandedSection={expandedSection}
        setExpandedSection={setExpandedSection}
        colors={colors}
      >
        <Label
          label="Format"
          value={currencyUtils.format(1234.56)}
          colors={colors}
        />
        <Label
          label="Parse"
          value={`${currencyUtils.parse("$1,234.56")}`}
          colors={colors}
        />
        <Label
          label="Precision"
          value={currencyUtils.formatPrecision(1.5, 4)}
          colors={colors}
        />
      </Section>

      <Section
        title="🔢 Utils - Numbers"
        id="numbers"
        expandedSection={expandedSection}
        setExpandedSection={setExpandedSection}
        colors={colors}
      >
        <Label
          label="Round(3.14159, 2)"
          value={`${numberUtils.round(3.14159, 2)}`}
          colors={colors}
        />
        <Label
          label="Percentage(25/100)"
          value={`${numberUtils.percentage(25, 100)}%`}
          colors={colors}
        />
        <Label
          label="Clamp(150, 0, 100)"
          value={`${numberUtils.clamp(150, 0, 100)}`}
          colors={colors}
        />
      </Section>

      <Section
        title="✅ Utils - Validation"
        id="validation"
        expandedSection={expandedSection}
        setExpandedSection={setExpandedSection}
        colors={colors}
      >
        <Label
          label="Valid Email"
          value={validationUtils.isValidEmail("test@example.com") ? "✓" : "✗"}
          colors={colors}
        />
        <Label
          label="Valid Phone"
          value={validationUtils.isValidPhone("+593999999999") ? "✓" : "✗"}
          colors={colors}
        />
        <Label
          label="Valid URL"
          value={validationUtils.isValidURL("https://example.com") ? "✓" : "✗"}
          colors={colors}
        />
      </Section>
    </>
  );
}

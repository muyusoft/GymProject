import { Section, Label } from "../components";
import type { PlaygroundColors } from "../types/playground.types";

interface AuthSectionProps {
  expandedSection: string;
  setExpandedSection: (id: string) => void;
  colors: PlaygroundColors;
  user: any;
}

export function AuthSection({
  expandedSection,
  setExpandedSection,
  colors,
  user,
}: AuthSectionProps) {
  return (
    <Section
      title="🔐 Auth Store"
      id="auth"
      expandedSection={expandedSection}
      setExpandedSection={setExpandedSection}
      colors={colors}
    >
      <Label
        label="Authenticated"
        value={user ? "Yes" : "No"}
        colors={colors}
      />
      {user && (
        <>
          <Label label="Email" value={user.email} colors={colors} />
          <Label label="Name" value={user.name} colors={colors} />
        </>
      )}
    </Section>
  );
}

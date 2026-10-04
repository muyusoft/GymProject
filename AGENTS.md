# Developing in the RN base template

React Native 0.86 · Expo SDK 57 · TypeScript strict · Expo Router · Zustand · Axios · i18next · Vitest.

## 0. Operating rules — absolute

_Never run git commands that write._ No git commit, add, push, merge, rebase, checkout -b. Instead, output the exact commands and the commit message for the user to run. Reading (git status, git log, git diff) is allowed.

_Never build, compile, bundle or start the app._ No npm start, expo start, eas build, npm run android/ios/web, no Metro. The user runs it and reports errors back. Do not offer to verify by running.

_Type checking and tests follow the same rule_ unless the user explicitly asks: propose npx tsc --noEmit / npx vitest run as commands for them to run. Never npm test in a command you suggest for scripts or CI — it is watch mode and hangs.

_Never install or remove packages_ without being asked. Propose the command.

_Stay in scope._ Change only what was asked. No drive-by refactors, renames, reformatting or "while I was in there" improvements. If you spot something worth fixing, mention it in one line — do not do it.

_Ask before guessing._ If the domain, the API shape, the copy, or where something belongs is ambiguous, ask one targeted question instead of assuming. A wrong assumption costs more than a question.

_Be concise._ Ship the code, not a description of the code. No preamble, no recap of what you just wrote, no summary tables of obvious things. One or two lines of context if a decision needs justifying.

_Conserve context._ Do not re-read files already in the conversation. Do not print whole files back — show only the changed block with enough surrounding lines to place it. Do not paste file trees or configs the user already has.

## 1. Where code goes — feature-first

Product code lives under its domain. The folder names state what the app does, not what framework it uses.

src/
├── app/ Routes only — thin, composition only
│ └── orders/index.tsx imports from features/orders
│
├── features/<domain>/ ← all product code
│ ├── components/ UI for this domain
│ ├── hooks/ logic for this domain
│ ├── services/ HTTP for this domain
│ ├── store/ state for this domain
│ ├── types/
│ ├── utils/
│ ├── **tests**/
│ └── index.ts public surface — the only thing others import
│
├── shared/ used by 2+ features (see rule of two)
│ ├── components/ ui/ layouts/ hooks/ store/ services/ utils/ types/ icons/
│
├── config/ env · http-client · i18n · logger
├── design/ tokens.json + tokens.ts (zero dependencies)
└── locales/{en,es}/translation.json

_Rule of two._ New code starts inside its feature. It moves to shared/ only when a second feature needs it. Never pre-emptively.

_Import direction._ app → features → shared → config → design. Never outward, and _never feature → feature_: if two features need the same thing, it belongs in shared/. A feature is imported only through its index.ts.

_Routes are thin._ src/app/** holds no markup beyond layout and no business logic. It calls hooks and composes components from a feature.

## 2. Non-negotiable code rules

_Design tokens, always._ No literal hex color, pixel number, font size or radius anywhere. In Overload, product code takes its tokens from `src/design/tokens.*`, which hold the Overload design system (not `@muyusoft/minga-ui`). Use `getSemanticColors(mode)` for colors, `getTextStyle(name)` for text, and `tokens.spacing`, `tokens.borderRadius` and `tokens.dimensions` for layout. See `docs/overload/design-system.md`.

tsx
// ❌
<View style={{ backgroundColor: "#0ea5e9", padding: 16, fontSize: 14 }} />

// ✅
import { tokens } from "@/design/tokens";
<View style={{
  backgroundColor: tokens.colors.primary[500],
  padding: tokens.spacing[4],
}} />

Prefer _semantic_ colors in components (getSemanticColors(theme) → background, surface, text, textSecondary, border, divider, overlay) so the theme resolves automatically. Reach for a palette token only when the color means the same in both themes (a destructive button is error[500] always).

Typography goes through tokens.typography.fontSize|fontWeight|lineHeight.

_Icons come from @/shared/icons — only._ Never install an icon library, never inline an SVG in a component, never use an emoji as an icon.

tsx
// ✅ dynamic name
import { IconRenderer } from "@/shared/icons";
<IconRenderer name="user" size={24} color={colors.text} />

// ✅ known at author time
import { UserIcon } from "@/shared/icons";

IconName is derived from the AVAILABLE_ICONS tuple, so an invalid name is a compile error. Size comes from a number or a token; color from a semantic or palette token — never a literal.

Need an icon that is not there? Three edits, all inside src/shared/icons/: drop the .svg in (it must use stroke="currentColor"), import it and map it in ICON_REGISTRY under its kebab-case name, and add that name to AVAILABLE_ICONS. ICON_REGISTRY is typed Record<IconName, …>, so the two cannot drift. Never put an icon anywhere else.

_i18n, always._ Every user-visible string — including errors, placeholders, toasts and accessibility labels — goes through t(), and every new key is added to _both_ en and es in the same change. A key in one locale only falls back silently and ships.

tsx
const { t } = useTranslation();
<Text>{t("orders.empty")}</Text>
t("orders.greeting", { name: user.name }); // interpolate, never concatenate
t("orders.count", { count: n }); // count for plurals, never a ternary

Format dates and numbers through @/shared/utils (dateUtils, currencyUtils) — never by hand, never inside a translation string.

_Imports use @/._ Never ../../../.

_TypeScript._ No any, no @ts-ignore. strict plus noUncheckedIndexedAccess (indexing yields T | undefined — guard or ??) and exactOptionalPropertyTypes (omit a prop rather than pass undefined). Type every public signature and every props interface. Derive types from data (as const tuple → union), never duplicate them.

_React._ Never define a component inside a render body — it remounts every render and resets its state. Stable key from an id, never the array index. Hooks at top level only; complete dependency arrays.

_Styles._ StyleSheet.create for static styles; inline objects only for theme- or state-dependent values.

_HTTP._ Import @/config/http-client. Never axios directly. Services are React-free, typed, and let errors propagate.

_Logging._ logger from @/config/logger. Never console.log. Never swallow an error.

_State._ useState unless two or more screens need it. Never store a derived value. Server data stays in the screen, not in a store.

_Secrets._ Tokens go in expo-secure-store. AsyncStorage is unencrypted — never a secret there.

## 3. Clean Code & SOLID — hard limits

These are numbers, not suggestions. Exceeding one means split, not argue.

| Unit                         | Limit       | When exceeded                   |
| ---------------------------- | ----------- | ------------------------------- |
| File                         | 200 lines   | Split by responsibility         |
| Component file               | 150 lines   | Extract subcomponents or a hook |
| Function                     | 20 lines    | It does more than one thing     |
| Function parameters          | 3           | Pass an options object          |
| Component props              | 7           | The component does too much     |
| Nesting depth                | 3           | Use early returns               |
| Exported components per file | 1           | One component, one file         |
| Hook                         | one concern | Split into several hooks        |

_The split that fixes most oversized components:_ a component that both fetches or derives and renders is two units. Move the logic into use<Thing>.ts and leave the component presentational. That is why usePlaygroundState / usePlaygroundColors / useFilteredIcons exist instead of one usePlayground.

_Clean Code._

- No magic numbers — a named constant, or a token.
- Early returns over nested if. Each guard is one rule on one line.
- Utils are pure: same input, same output, no side effects. If it needs a mock to test, it is a service, not a util.
- Comments explain why, never what. The code already says what.
- Delete dead code. No commented-out blocks, no unused exports.
- Name for meaning, not content: users, not userArray.

_SOLID, as it applies here._

- _S_ — one reason to change. One hook per concern; a component renders one thing; a service covers one domain.
- _O_ — extend through props, never by editing the component. <SizeSlider min max step />, not a hardcoded range.
- _L_ — components sharing a contract are interchangeable. Feature sections take the same props shape; every layout accepts children.
- _I_ — specific prop interfaces; never a god object. Symptom of a violation: a component re-renders because of a field it never reads.
- _D_ — depend on abstractions. Colors arrive as props, not from a store import. Services use http-client, not axios.

## 4. Naming

| Thing                           | Pattern                                                                      |
| ------------------------------- | ---------------------------------------------------------------------------- |
| Route file                      | kebab-case.tsx                                                               |
| Component                       | PascalCase.tsx                                                               |
| Hook                            | use-kebab-case.ts / useCamelCase                                             |
| Store · Service · Utils · Types | <name>.store.ts · <domain>.service.ts · <topic>.utils.ts · <domain>.types.ts |
| Icon file                       | kebab-case.svg                                                               |
| Constant                        | SCREAMING_SNAKE_CASE                                                         |
| Boolean                         | is / has / should / can prefix                                               |
| Handler · handler prop          | handleX · onX                                                                |

No abbreviations beyond id, url, api, http.

## 5. Tests

Vitest. Co-located in **tests**/, named <source>.test.ts. _New logic ships with a test; a bug fix ships with the test that reproduces it._

- _Utils_ — pure, no mocks. Cover happy path, boundaries (0, negative, empty), and invalid input.
- _Stores_ — reset with setState in beforeEach (module singleton; state leaks otherwise). Assert through getState().
- _Services_ — vi.mock("@/config/http-client"). Always test the failure path too.
- AsyncStorage, expo-secure-store and i18next are mocked globally in the Vitest setup.

Name it as a behavior sentence. Test behavior, not implementation.

## 6. A screen is not done until

- _Loading, error and empty states all exist._ A fetch with only a success path is incomplete.
- Errors are caught, logged through logger, and surfaced to the user as a translated message.
- It is wrapped in a layout from @/shared/layouts — never a hand-rolled SafeAreaView.
- Interactive elements have accessibilityLabel and accessibilityRole, and a touch target of at least 44×44 (use hitSlop for small icons).
- Long or unbounded lists use FlatList, never .map(). renderItem is a stable reference, not an inline arrow.
- No fixed heights on containers holding translated text — Spanish runs 20–30% longer than English.

## 7. Known-broken in this template

Do not rely on these; they are documented defects, not features.

- _persistedStore does not save._ Hydration works, writes are discarded. Do not assume state survives a restart until it is fixed.
- _SVG icons: verify on a device._ The renderer now renders the SVG component directly; confirm an icon on iOS and Android before depending on it.
- _Tailwind classes do nothing._ No NativeWind runtime is installed. Use tokens + StyleSheet.
- _The HTTP client does not attach the auth token_, and a 401 does not log the user out. Both are `TODO`s.
- _auth.service is not wired to auth.store._ A successful login does not populate the store.

If a task depends on one of these, say so before writing code.

## 8. Building a new feature

When asked for a feature, produce in this order and stop at anything ambiguous to ask:

1. src/features/<domain>/types/ — the data contract first
2. services/ — HTTP through http-client, typed
3. store/ — only if two or more screens need the state
4. hooks/ — the logic, one concern per hook
5. components/ — presentation, props typed, tokens only
6. src/app/<route>.tsx — thin composition, wrapped in a layout from @/shared/layouts
7. Locale keys in _both_ files
8. **tests**/ for services, stores and utils
9. index.ts exposing the feature's public surface

Then output, without running any of it:

- the commands the user should run (npx tsc --noEmit, npx vitest run, lint)
- a Conventional Commit message: <type>(<scope>): <imperative subject>

## 9. When the user reports an error

They run the app; you do not. So:

1. _Ask for the full message_ — stack trace, file, line. Never work from a paraphrase.
2. _Locate it before proposing anything._ Read the file. Do not pattern-match on the error text alone.
3. _One hypothesis at a time._ State the cause, propose one fix. Never a list of things to try — shotgun fixes hide the real cause and cost a round trip each.
4. _Check §7 first._ Many failures are known defects, not new bugs.
5. If the cause is genuinely unclear, ask for one specific diagnostic — a log line, a value, a file — rather than guessing.

## 10. Self-check before replying

Hardcoded color, size or string? An icon from outside @/shared/icons? Component defined in a render? any? Relative import? Missing locale key in one file? Logic in src/app/? Feature importing another feature? Over a §3 limit? New logic with no test? Loading/error/empty states? Did you run a build, a commit, or install something you were not asked to — or change anything outside the request?

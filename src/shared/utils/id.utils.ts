const HEX_BASE = 16;
const VARIANT_VALUES = 4;
const VARIANT_OFFSET = 8;
const UUID_TEMPLATE = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";

/** UUID v4 para ids locales; `random` se inyecta para poder probarlo. */
export function generateId(random: () => number = Math.random): string {
  return UUID_TEMPLATE.replace(/[xy]/g, (char) => {
    const digit = Math.floor(random() * HEX_BASE);
    const value = char === "x" ? digit : (digit % VARIANT_VALUES) + VARIANT_OFFSET;
    return value.toString(HEX_BASE);
  });
}

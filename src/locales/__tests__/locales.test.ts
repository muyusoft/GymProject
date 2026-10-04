import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import en from "../en/translation.json";
import es from "../es/translation.json";

type Tree = { [key: string]: string | Tree };

/** Hojas del JSON como "a.b.c"; las claves plurales conservan su sufijo (_one, _other). */
function flatten(tree: Tree, prefix = ""): Map<string, string> {
  const leaves = new Map<string, string>();
  for (const [key, value] of Object.entries(tree)) {
    if (typeof value === "string") leaves.set(`${prefix}${key}`, value);
    else for (const [nested, text] of flatten(value, `${prefix}${key}.`)) leaves.set(nested, text);
  }
  return leaves;
}

const english = flatten(en as Tree);
const spanish = flatten(es as Tree);

/** Claves que van sin texto a propósito (p. ej. "total" no lleva sufijo de carga). */
const INTENTIONALLY_EMPTY = /^plan\.load\.suffix\./;

const SRC = join(__dirname, "..", "..");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "__tests__" ? [] : sourceFiles(path);
    return /\.(ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

const sources = sourceFiles(SRC).map((path) => ({ path, text: readFileSync(path, "utf8") }));

const hasKey = (locale: Map<string, string>, key: string) =>
  locale.has(key) || locale.has(`${key}_one`) || locale.has(`${key}_other`);

describe("traducciones es y en", () => {
  it("tienen exactamente las mismas claves", () => {
    const onlyEnglish = [...english.keys()].filter((key) => !spanish.has(key));
    const onlySpanish = [...spanish.keys()].filter((key) => !english.has(key));
    expect({ onlyEnglish, onlySpanish }).toEqual({ onlyEnglish: [], onlySpanish: [] });
  });

  it("no dejan textos vacíos salvo los que lo son a propósito", () => {
    const empty = [...english, ...spanish].filter(([key, text]) => text.trim() === "" && !INTENTIONALLY_EMPTY.test(key));
    expect(empty).toEqual([]);
  });

  it("cada plural trae _one y _other", () => {
    const keys = [...english.keys()];
    const missing = keys.flatMap((key) => {
      const base = key.replace(/_(one|other)$/, "");
      return base === key ? [] : [`${base}_one`, `${base}_other`].filter((plural) => !english.has(plural));
    });
    expect(missing).toEqual([]);
  });

  it("conservan los mismos {{parámetros}} en los dos idiomas", () => {
    const params = (text: string) => [...text.matchAll(/\{\{(\w+)\}\}/g)].map((match) => match[1]).sort();
    const mismatched = [...english].filter(([key, text]) => JSON.stringify(params(text)) !== JSON.stringify(params(spanish.get(key) ?? "")));
    expect(mismatched.map(([key]) => key)).toEqual([]);
  });
});

describe("uso de traducciones en el código", () => {
  it("cada t(\"clave\") existe en español y en inglés", () => {
    const missing = sources.flatMap(({ path, text }) =>
      [...text.matchAll(/\bt\(\s*"([A-Za-z0-9_.]+)"/g)]
        .map((match) => match[1] ?? "")
        .filter((key) => !hasKey(english, key) || !hasKey(spanish, key))
        .map((key) => `${path.replace(SRC, "")}: ${key}`),
    );
    expect(missing).toEqual([]);
  });

  it("cada t(`prefijo.${valor}`) tiene al menos una traducción bajo ese prefijo", () => {
    const missing = sources.flatMap(({ path, text }) =>
      [...text.matchAll(/\bt\(\s*`([A-Za-z0-9_.]+)\.\$\{/g)]
        .map((match) => match[1] ?? "")
        .filter((prefix) => ![...english.keys()].some((key) => key.startsWith(`${prefix}.`)))
        .map((prefix) => `${path.replace(SRC, "")}: ${prefix}`),
    );
    expect(missing).toEqual([]);
  });
});

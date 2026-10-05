import { describe, expect, it } from "vitest";
import freeExerciseDb from "../data/free-exercise-db.json";
import instructionsEs from "../data/instructions-es.json";
import { exerciseImageUrls, pickSteps, splitSteps } from "../utils/exercise-info.utils";

describe("exerciseImageUrls", () => {
  it("arma las dos fotos (inicio y final) desde el id del catálogo abierto", () => {
    expect(exerciseImageUrls("Barbell_Curl")).toEqual([
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/0.jpg",
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/1.jpg",
    ]);
  });

  it("escapa los ids con caracteres especiales", () => {
    expect(exerciseImageUrls("3/4 Sit-Up")[0]).toContain("/exercises/3%2F4%20Sit-Up/0.jpg");
  });

  it("un ejercicio propio, sin id de catálogo, no tiene fotos", () => {
    expect(exerciseImageUrls(null)).toEqual([]);
    expect(exerciseImageUrls("")).toEqual([]);
  });
});

describe("splitSteps", () => {
  it("separa un paso por línea y descarta las vacías", () => {
    expect(splitSteps("Lie down.\n\n  Press.  \n")).toEqual(["Lie down.", "Press."]);
  });

  it("sin texto no hay pasos", () => {
    expect(splitSteps(null)).toEqual([]);
    expect(splitSteps("")).toEqual([]);
  });
});

describe("pickSteps", () => {
  const stepsEs = ["Acuéstate.", "Empuja."];
  const stepsEn = ["Lie down.", "Press."];

  it("en español usa la traducción", () => {
    expect(pickSteps({ language: "es", stepsEs, stepsEn })).toEqual({ steps: stepsEs, isUntranslated: false });
  });

  it("en español sin traducción muestra el inglés y lo avisa", () => {
    expect(pickSteps({ language: "es", stepsEs: [], stepsEn })).toEqual({ steps: stepsEn, isUntranslated: true });
  });

  it("en inglés siempre usa el inglés, sin aviso", () => {
    expect(pickSteps({ language: "en", stepsEs, stepsEn })).toEqual({ steps: stepsEn, isUntranslated: false });
  });

  it("sin pasos en ningún idioma no avisa de traducción: simplemente no hay", () => {
    expect(pickSteps({ language: "es", stepsEs: [], stepsEn: [] })).toEqual({ steps: [], isUntranslated: false });
  });
});

describe("instructions-es.json", () => {
  const byId = new Map(freeExerciseDb.map((exercise) => [exercise.id, exercise]));

  it("cada traducción apunta a un ejercicio del catálogo y tiene los mismos pasos que el original", () => {
    for (const [id, steps] of Object.entries(instructionsEs.steps)) {
      // Algunos originales traen un paso vacío; la ficha los descarta, así que no cuentan.
      expect(byId.get(id)?.instructions.filter((step) => step.trim() !== "").length, id).toBe(steps.length);
      expect(steps.every((step) => step.trim() !== ""), id).toBe(true);
    }
  });
});

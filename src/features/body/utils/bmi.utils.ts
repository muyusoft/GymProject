import type { BmiCategory, BmiResult } from "../types/body.types";

const CM_PER_M = 100;

/** Rangos de la OMS para adultos: cada categoría llega hasta su límite, sin incluirlo. */
const UPPER_LIMITS: readonly { below: number; category: BmiCategory }[] = [
  { below: 18.5, category: "underweight" },
  { below: 25, category: "normal" },
  { below: 30, category: "overweight" },
];

/** IMC = peso (kg) / estatura (m)². null si falta la estatura o el peso. */
export function bodyMassIndex(weightKg: number, heightCm: number): number | null {
  if (weightKg <= 0 || heightCm <= 0) return null;
  const meters = heightCm / CM_PER_M;
  return weightKg / (meters * meters);
}

export function bmiCategory(bmi: number): BmiCategory {
  return UPPER_LIMITS.find((limit) => bmi < limit.below)?.category ?? "obesity";
}

export function bmiResult(weightKg: number | null, heightCm: number): BmiResult | null {
  const value = weightKg === null ? null : bodyMassIndex(weightKg, heightCm);
  return value === null ? null : { value, category: bmiCategory(value) };
}

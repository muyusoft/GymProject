import type { MovementSource } from "../types/warmup.types";

/** Enlaces verificados de cada fuente (ver docs/overload/domain-rules.md). */
export const MOVEMENT_SOURCE_URLS: Record<MovementSource, string> = {
  fradkin2010: "https://pubmed.ncbi.nlm.nih.gov/19996770/",
  behm2016: "https://pure.northampton.ac.uk/en/publications/acute-effects-of-muscle-stretching-on-physical-performance-range-/",
  herbert2011: "https://cochranelibrary.com/cdsr/doi/10.1002/14651858.CD004577.pub3/information",
  garber2011: "https://doi.org/10.1249/MSS.0b013e318213fefb",
};

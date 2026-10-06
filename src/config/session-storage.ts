import * as SecureStore from "expo-secure-store";

/**
 * Guarda la sesión de Supabase cifrada en expo-secure-store. Cada valor de SecureStore tiene un límite
 * de tamaño que la sesión supera, así que se reparte en trozos: `clave.chunks` dice cuántos son y
 * `clave.0`, `clave.1`… los guardan.
 */
const CHUNK_SIZE = 1800;

const countKey = (key: string) => `${key}.chunks`;
const chunkKey = (key: string, index: number) => `${key}.${index}`;

export function splitIntoChunks(
  value: string,
  size: number = CHUNK_SIZE,
): string[] {
  const chunks: string[] = [];
  for (let start = 0; start < value.length; start += size)
    chunks.push(value.slice(start, start + size));
  return chunks;
}

async function readCount(key: string): Promise<number> {
  const count = Number(await SecureStore.getItemAsync(countKey(key)));
  return Number.isInteger(count) && count > 0 ? count : 0;
}

async function getItem(key: string): Promise<string | null> {
  const count = await readCount(key);
  if (count === 0) return null;
  const chunks = await Promise.all(
    Array.from({ length: count }, (_, index) =>
      SecureStore.getItemAsync(chunkKey(key, index)),
    ),
  );
  // Si falta un trozo la sesión está incompleta: mejor ninguna que una rota.
  return chunks.every((chunk): chunk is string => chunk !== null)
    ? chunks.join("")
    : null;
}

async function removeItem(key: string): Promise<void> {
  const count = await readCount(key);
  await Promise.all(
    Array.from({ length: count }, (_, index) =>
      SecureStore.deleteItemAsync(chunkKey(key, index)),
    ),
  );
  await SecureStore.deleteItemAsync(countKey(key));
}

async function setItem(key: string, value: string): Promise<void> {
  // Borra primero lo anterior: una sesión más corta dejaría trozos viejos al final.
  await removeItem(key);
  const chunks = splitIntoChunks(value);
  await Promise.all(
    chunks.map((chunk, index) =>
      SecureStore.setItemAsync(chunkKey(key, index), chunk),
    ),
  );
  await SecureStore.setItemAsync(countKey(key), String(chunks.length));
}

export const secureSessionStorage = { getItem, setItem, removeItem };

/**
 * Middleware de persistencia para Zustand
 * Guarda y restaura estado automáticamente en AsyncStorage
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { StateCreator } from "zustand";
import { logger } from "@/config/logger";

/**
 * Wrapper para crear stores con persistencia automática
 *
 * Uso:
 * const useAuthStore = create<State>(
 *   persistedStore('auth', (set) => ({ ... }))
 * );
 */
export function persistedStore<T>(
  name: string,
  initializer: StateCreator<T>,
): StateCreator<T> {
  return (set, get, api) => {
    const baseState = initializer(set, get, api);

    // Restaurar estado al crear el store
    AsyncStorage.getItem(`zustand:${name}`)
      .then((item) => {
        if (item) {
          try {
            const persisted = JSON.parse(item);
            set(persisted);
            logger.info(`Store "${name}" hydrated from AsyncStorage`, {
              keys: Object.keys(persisted),
            });
          } catch (error) {
            logger.error(`Failed to hydrate store "${name}"`, {
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }
      })
      .catch((error) => {
        logger.error(`Failed to read store "${name}" from AsyncStorage`, {
          error: error instanceof Error ? error.message : "Unknown error",
        });
      });

    // Interceptar cambios de estado para persistir
    const originalSet = set;
    const persistingSet = ((state: any) => {
      originalSet(state);

      // Guardar en AsyncStorage
      AsyncStorage.setItem(`zustand:${name}`, JSON.stringify(state))
        .then(() => {
          logger.debug(`Store "${name}" persisted to AsyncStorage`);
        })
        .catch((error) => {
          logger.error(`Failed to persist store "${name}"`, {
            error: error instanceof Error ? error.message : "Unknown error",
          });
        });
    }) as typeof set;

    return baseState;
  };
}

/**
 * Wrapper genérico que usa zustand/persist
 * Más simple pero menos flexible que persistedStore()
 *
 * Uso:
 * import { persist } from 'zustand/middleware';
 *
 * const useAuthStore = create<State>(
 *   persist(
 *     (set) => ({ ... }),
 *     { name: 'auth-storage' }
 *   )
 * );
 */
export const persistConfig = {
  storage: {
    getItem: async (name: string) => {
      try {
        const item = await AsyncStorage.getItem(`zustand:${name}`);
        return item ? JSON.parse(item) : null;
      } catch (error) {
        logger.error(`Failed to get item "${name}" from AsyncStorage`, {
          error: error instanceof Error ? error.message : "Unknown error",
        });
        return null;
      }
    },
    setItem: async (name: string, value: string) => {
      try {
        await AsyncStorage.setItem(`zustand:${name}`, value);
        logger.debug(`Item "${name}" persisted to AsyncStorage`);
      } catch (error) {
        logger.error(`Failed to set item "${name}" in AsyncStorage`, {
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
    removeItem: async (name: string) => {
      try {
        await AsyncStorage.removeItem(`zustand:${name}`);
        logger.debug(`Item "${name}" removed from AsyncStorage`);
      } catch (error) {
        logger.error(`Failed to remove item "${name}" from AsyncStorage`, {
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
  },
};

# Backend y base de datos

Estado al 4 de octubre de 2026. Explica dónde viven los datos de Overload, cómo se accede a ellos y qué falta. El detalle de cada tabla está en `data-model.md`; las reglas de cálculo, en `domain-rules.md`.

## Resumen

- **No hay backend.** Overload es offline primero: todo lo que se guarda vive en una base SQLite dentro del teléfono.
- **No hay cuentas ni sincronización.** Cambiar de teléfono o reinstalar la app pierde los datos, salvo que se exporte un respaldo.
- **Lo único que usa internet** son las fotos de la ficha del ejercicio, que se descargan una vez y quedan en caché.
- El cliente HTTP, los servicios de autenticación y `persistedStore` que trae el template existen en el repo, pero ningún feature de Overload los usa.

## Piezas

| Pieza            | Qué hace                                                       | Dónde                                              |
| ---------------- | -------------------------------------------------------------- | -------------------------------------------------- |
| expo-sqlite      | Motor SQLite en el dispositivo; la base se llama `overload.db` | `src/shared/db/client.ts`                          |
| drizzle-orm      | Esquema tipado y consultas en TypeScript                       | `src/shared/db/schema/`, `src/shared/db/queries/`  |
| drizzle-kit      | Genera las migraciones `.sql` a partir del esquema             | `drizzle.config.ts`, `src/shared/db/migrations/`   |
| Seed             | Carga el catálogo la primera vez que abre la app               | `src/shared/db/seed.ts`, `src/shared/db/seed/`     |
| Store de ajustes | Lee y escribe la tabla `settings`                              | `src/shared/store/settings.store.ts`               |
| Respaldo         | Exporta e importa los datos como JSON                          | `src/features/settings/services/backup.service.ts` |

## Tablas

Doce tablas, en cinco archivos de esquema.

| Archivo              | Tablas                                     | Para qué                                                    |
| -------------------- | ------------------------------------------ | ----------------------------------------------------------- |
| `schema/catalog.ts`  | `exercises`, `exercise_muscles`, `sources` | Catálogo, qué músculos trabaja cada ejercicio y las fuentes |
| `schema/plan.ts`     | `plans`, `plan_days`, `plan_exercises`     | El plan semanal                                             |
| `schema/training.ts` | `sessions`, `set_logs`, `exercise_swaps`   | Entrenos hechos, cada serie y las sustituciones de un día   |
| `schema/settings.ts` | `settings`, `equipment_increments`         | Ajustes (clave y valor) y saltos de peso por equipo         |
| `schema/body.ts`     | `body_weights`                             | Peso corporal, un registro por día                          |

Convenciones:

- Todas las tablas, salvo `settings` y `deleted_rows`, tienen `id` en texto. Las filas que crea el usuario usan un UUID; las que deben coincidir entre teléfonos usan un id estable (ver "Preparación para sincronizar"). Casi todas tienen `updated_at` en milisegundos.
- Las fechas de calendario se guardan como texto `yyyy-MM-dd` en hora local; los instantes, en milisegundos.
- Los pesos se guardan en la unidad en que se registraron (`lb` o `kg`) y solo se convierten al mostrar o comparar.

## Migraciones

Hay tres, y se aplican solas al arrancar la app.

| Migración                     | Crea                      |
| ----------------------------- | ------------------------- |
| `0000_fancy_the_order.sql`    | Las diez tablas iniciales |
| `0001_regular_pestilence.sql` | `body_weights`            |
| `0002_spotty_manta.sql`       | `exercise_swaps`          |

Para cambiar el esquema:

1. Edita el archivo en `src/shared/db/schema/`. Si es un archivo nuevo, agrégalo a `drizzle.config.ts` y a `schema/index.ts`.
2. Corre `npx drizzle-kit generate`. Crea el `.sql` y actualiza `migrations.js` y `meta/`.
3. Arranca la app: la migración se aplica en el siguiente inicio.

Los archivos de esquema usan imports relativos porque drizzle-kit corre fuera de Metro y no resuelve el alias `@/`. Los `.sql` entran al bundle como texto gracias a `babel-plugin-inline-import` (`babel.config.cjs`) y a la extensión `sql` en `metro.config.cjs`.

No edites a mano una migración ya generada ni los archivos de `meta/`.

## Arranque

`useAppBootstrap` (`src/shared/hooks/use-app-bootstrap.ts`) prepara todo antes de mostrar la app, en este orden:

1. **Migraciones**: `useMigrations` de Drizzle aplica las pendientes.
2. **Seed**: `runSeed` carga el catálogo si aún no se hizo.
3. **Ajustes**: el store lee la tabla `settings` y aplica idioma y tema.
4. **Recordatorios**: se configuran y reprograman las notificaciones locales.

Si falla la base de datos, la app muestra `BootError` y no continúa. Si fallan las fuentes, sigue con la tipografía del sistema.

## Seed

Corre una sola vez por instalación; deja la marca `seeded` en `settings`. Dentro de una transacción inserta:

- Las fuentes citables (`sources`).
- Los ejercicios: los 876 de free-exercise-db, con el nombre en español de los comunes (`common-exercises.json`), más los comunes que no existen en ese catálogo.
- Los músculos por ejercicio, generados desde `muscle-map.json`.
- Los saltos de peso por defecto.

El seed recibe sus datos por parámetro desde el layout raíz (`runSeed(db, catalogSeedData)`), porque `shared` no puede importar de un feature.

Límite a tener en cuenta: como corre una sola vez, **cambiar los JSON del catálogo no actualiza las instalaciones existentes**. Por eso las traducciones de las instrucciones no pasan por el seed: viven en `instructions-es.json` y se leen al mostrar la ficha.

## Cómo se accede a los datos

- **Los componentes nunca consultan la base.** Llaman a un hook, y el hook a un servicio.
- **Cada feature tiene sus servicios** en `src/features/<feature>/services/`. Ahí van las consultas propias de ese feature.
- **Las consultas que usan dos o más features** van en `src/shared/db/queries/` (ejercicios, plan, ejercicios del plan, sesiones, equipo, ajustes), porque un feature no puede importar de otro.
- **Las reglas de cálculo son funciones puras** en `utils/`, sin base de datos, y son las que tienen pruebas.

### Transacciones

El driver de expo-sqlite es **síncrono**. Dentro de `db.transaction` el callback no puede ser `async`, y cada sentencia termina en `.run()`, `.get()` o `.all()`:

```ts
db.transaction((tx) => {
  tx.insert(sessions).values(session).run();
  for (const part of chunk(rows, 50)) tx.insert(setLogs).values(part).run();
});
```

Con un callback `async`, la transacción se confirma antes de que corran las sentencias y deja de ser atómica. Fuera de una transacción, las consultas sí se pueden usar con `await`.

Los inserts grandes van en lotes de 50 filas, porque SQLite limita las variables por sentencia.

## Ajustes

La tabla `settings` guarda pares clave y valor, todo como texto. `useSettingsStore` la lee al arrancar y escribe cada cambio de inmediato. Guarda idioma, unidad de peso, tema, sugerencias de progresión, RPE, deload, los recordatorios de entreno y de pesaje, la estatura y la frecuencia de pesaje.

Un valor corrupto o desconocido no rompe la app: cae a su valor por defecto (`settings-values.utils.ts`).

Reemplaza a `persistedStore` del template, que no guarda.

## Respaldo

Es la única forma de sacar los datos del teléfono. Desde Ajustes se exporta un JSON a una carpeta que elige la persona y se importa de vuelta.

- **Incluye:** ajustes, saltos de peso, plan, días, ejercicios del plan, sesiones, series, peso corporal y los ejercicios a los que apuntan el plan y el historial.
- **No incluye:** el resto del catálogo (se vuelve a sembrar) ni las sustituciones de un día.
- **Importar reemplaza** el plan y el historial actuales, dentro de una transacción: o entra todo o no cambia nada.
- **Los ejercicios se vuelven a vincular** por su id de free-exercise-db o por nombre, porque los ids locales cambian entre instalaciones.
- El archivo se valida antes de tocar la base: versión, tipos de cada campo y que cada referencia apunte a algo que existe en el mismo archivo.

## Lo que no está hecho

- **Backend, cuentas y sincronización.** `updated_at` está en las tablas para eso, pero no hay nada construido.
- **Claves foráneas activadas.** `client.ts` ejecuta `PRAGMA foreign_keys = ON` al abrir la base, así que las cascadas y los `set null` del esquema se aplican. Las filas que quedaron sueltas mientras estaban apagadas las limpia la preparación para sincronizar.
- **Web.** El bundle web falla al cargar `wa-sqlite.wasm`; la app apunta a iOS y Android.
- **Actualizar el catálogo** en instalaciones existentes: no hay mecanismo, por el seed de una sola vez.
- **Cifrado.** La base no está cifrada. Hoy no guarda secretos; si llegara a guardarlos, deben ir en `expo-secure-store`.

## Preparación para sincronizar

Todavía no hay backend, pero la base local ya está lista para tenerlo (Supabase, sincronización en segundo plano). Tres piezas:

- **Ids estables** (`src/shared/utils/stable-id.utils.ts`). Dos teléfonos de la misma cuenta deben llamar igual a la misma fila:
  - ejercicio del catálogo: `fedb:<id de free-exercise-db>`; ejercicio propio del catálogo: `common:<nombre en minúsculas y con guiones>`;
  - salto de peso: `<equipo>:<unidad>`; peso corporal: la fecha; sustitución: `<fecha>:<id del ejercicio del plan>`.
  - Planes, días, ejercicios del plan, sesiones y series siguen con UUID, porque los crea el usuario.
- **Registro de borrados** (tabla `deleted_rows`, `src/shared/db/queries/deletion.queries.ts`). Los borrados siguen siendo definitivos en el teléfono; cada uno anota tabla, id y hora en la misma transacción, para poder avisar al servidor. Las filas hijas que caen por cascada no se anotan: el servidor aplicará la misma cascada. Una fila con id estable que se vuelve a crear borra su anotación.
- **Preparación de instalaciones existentes** (`src/shared/db/sync-prep.ts`). Corre una vez, después del seed y en una sola transacción: limpia filas sueltas y cambia los ids al azar por los estables, actualizando todo lo que apuntaba a ellos. La marca `syncPrep` en `settings` guarda la versión aplicada. Si falla, se registra y la app arranca con los datos como estaban.

## Supabase (copia en la nube)

Supabase guarda una copia de los datos de cada usuario; la app la mantiene al día con la sincronización descrita más abajo.

### Cómo se cambia la base

Todo cambio de Postgres es una migración SQL en `supabase/migrations/`, versionada en git. Nunca se crea ni se modifica nada desde el panel web, y una migración ya aplicada no se edita: se escribe otra.

```bash
npx supabase migration new <nombre>   # crea el archivo vacío con su marca de tiempo
npx supabase db push --dry-run        # muestra qué migraciones faltan en el proyecto
npx supabase db push                  # las aplica
npx supabase db diff                  # detecta cambios hechos a mano en el proyecto
```

Hay un solo proyecto de Supabase, así que `db push` escribe sobre los datos reales: revisa el `--dry-run` antes. Con Docker, `npx supabase start` y `npx supabase db reset` prueban las migraciones en una base local.

### Esquema (`20261006120000_initial_schema.sql`)

- **Tablas:** `plans`, `plan_days`, `plan_exercises`, `sessions`, `set_logs`, `exercise_swaps`, `body_weights`, `equipment_increments`, `user_settings` y `custom_exercises`. Las columnas se llaman igual que en SQLite.
- **El catálogo no está en el servidor.** Viene dentro de la app; solo se guardan los ejercicios que crea el usuario (`custom_exercises`). Por eso `exercise_id` es texto libre.
- **Clave `(user_id, id)`** en todas, porque los ids estables solo son únicos por usuario.
- **`updated_at`** (ms, lo pone el teléfono): gana la modificación más reciente; el trigger `sync_guard` descarta una escritura más vieja que la guardada.
- **`deleted_at`** (ms): borrado lógico. El teléfono borra de verdad y avisa con lo anotado en `deleted_rows`.
- **`synced_at`** (hora del servidor, la pone `sync_guard`): cursor para pedir "lo que cambió desde la última vez".
- **Sin claves foráneas entre tablas**, para que el orden de llegada no importe. Las cascadas de borrado de SQLite se repiten con triggers: plan → días → ejercicios del plan → sustituciones; sesión → series; al borrar un día, sus sesiones quedan sin día.
- **RLS** en todas: cada usuario con sesión solo ve y escribe sus filas; los visitantes anónimos no tienen permisos. Borrar la cuenta borra sus filas.

### Sincronización (`src/shared/services/sync/`)

La app sigue leyendo y escribiendo solo en SQLite. Con sesión iniciada, `requestSync()` corre en segundo plano:

1. **Sube** las filas con `updated_at` posterior a la última subida y avisa de los borrados anotados en `deleted_rows`.
2. **Baja** lo que cambió en el servidor desde la última bajada (cursor `synced_at`, con 10 s de margen) y lo aplica de padres a hijos.

- **Cuándo:** al iniciar sesión, al arrancar con sesión, al volver a primer plano, al terminar un entreno, tras restaurar un respaldo y con "Sincronizar ahora" en Perfil.
- **Conflictos:** gana la fila con el `updated_at` más reciente, en el teléfono (`decideRemoteChange`) y en el servidor (`sync_guard`).
- **Qué se sincroniza:** las tablas de `sync-tables.ts`. De `exercises` solo los ejercicios que no son del catálogo. Los ajustes todavía no.
- **Cursores:** en `settings` (`syncUserId`, `syncPushedAt`, `syncPulledAt`); no entran en los respaldos.
- **Primera vez con una cuenta:** si el teléfono y la cuenta tienen datos, se pregunta con cuáles quedarse. "Los de este teléfono" marca como borrado lo de la cuenta y sube lo local como lo más reciente; "Los de mi cuenta" borra los datos locales y baja lo de la cuenta. Si solo un lado tiene datos, se enlaza sin preguntar.
- **Fallos:** se registran y dejan `useSyncStore` en `error`; nunca bloquean ni rompen una pantalla.
- **Al aplicar filas bajadas** se usa `INSERT ... ON CONFLICT DO UPDATE`, nunca `REPLACE`, que borraría la fila y dispararía las cascadas sobre sus hijas.

### Funciones de servidor (`supabase/functions/`)

Código de Deno, versionado junto a las migraciones y fuera del `tsc` y el lint de la app. Se despliega con `npx supabase functions deploy <nombre>`.

- **`delete-account`**: elimina la cuenta de quien llama. Existe porque borrar un usuario necesita la clave `service_role`, que nunca va dentro de la app. Identifica al usuario por su token verificado y borra el usuario; sus filas caen por `ON DELETE CASCADE`. La app (`deleteAccount` en `session.service.ts`) borra después los datos del teléfono y cierra la sesión; si el servidor falla, no borra nada.

### Inicio de sesión con Google

OAuth de Supabase por el navegador, con PKCE. Configuración que vive en los paneles, no en el repositorio:

- **Google Cloud:** un cliente OAuth de tipo "Aplicación web" cuya URI de redirección autorizada es `https://<proyecto>.supabase.co/auth/v1/callback`.
- **Supabase → Authentication → Providers → Google:** el ID de cliente y el secreto de ese cliente.
- **Supabase → Authentication → URL Configuration → Redirect URLs:** `overset://**` (app instalada) y `exp://**` (Expo Go en desarrollo).

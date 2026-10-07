/** Lo que trae la dirección a la que vuelve el navegador tras iniciar sesión con un proveedor. */
export type OAuthCallback =
  { kind: "code"; code: string } | { kind: "denied" } | { kind: "empty" };

function queryOf(url: string): URLSearchParams {
  const afterPath = url.split("?")[1] ?? "";
  return new URLSearchParams(afterPath.split("#")[0]);
}

/**
 * Con éxito llega `?code=...`, que se canjea por la sesión. Si la persona no dio permiso llega `?error=...`.
 * Cualquier otra cosa no sirve para iniciar sesión.
 */
export function readOAuthCallback(url: string): OAuthCallback {
  const query = queryOf(url);
  const code = query.get("code");
  if (code) return { kind: "code", code };
  return query.has("error") ? { kind: "denied" } : { kind: "empty" };
}

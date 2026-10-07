// Elimina la cuenta de quien llama. Borrar un usuario necesita la clave service_role, que nunca va dentro
// de la app: por eso vive aquí, en el servidor. Las filas del usuario caen solas, porque todas las tablas
// referencian auth.users con ON DELETE CASCADE.
//
// Desplegar: npx supabase functions deploy delete-account
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function respond(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS")
    return new Response("ok", { headers: CORS_HEADERS });
  if (request.method !== "POST")
    return respond(405, { error: "method_not_allowed" });

  const token = request.headers
    .get("Authorization")
    ?.replace(/^Bearer\s+/i, "");
  if (!token) return respond(401, { error: "missing_token" });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );

  // La identidad sale del token verificado, nunca del cuerpo de la petición: nadie puede borrar a otro.
  const { data, error: userError } = await admin.auth.getUser(token);
  if (userError || !data.user) return respond(401, { error: "invalid_token" });

  const { error: deleteError } = await admin.auth.admin.deleteUser(
    data.user.id,
  );
  if (deleteError) {
    console.error("delete-account failed", deleteError.message);
    return respond(500, { error: "delete_failed" });
  }
  return respond(200, { deleted: true });
});

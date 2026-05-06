export async function onRequest(context) {
  const request = context.request;

  const ip =
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For") ||
    "Unknown";

  const city = request.cf?.city || "Unknown";
  const country = request.cf?.country || "Unknown";

  return new Response(
    JSON.stringify({
      ip,
      city,
      country
    }),
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}

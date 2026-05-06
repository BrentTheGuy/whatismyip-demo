export async function onRequest(context) {
  const request = context.request;

  const ip =
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For") ||
    "Unknown";

  const city = request.cf?.city || "Unknown";
  const country = request.cf?.country || "Unknown";
  const userAgent = request.headers.get("User-Agent") || "Unknown";
  const visitTimeUtc = new Date().toISOString();

  await context.env.DB.prepare(
    `INSERT INTO visits 
      (ip, country, city, user_agent, visit_time_utc)
     VALUES (?, ?, ?, ?, ?)`
  )
    .bind(ip, country, city, userAgent, visitTimeUtc)
    .run();

  return new Response(
    JSON.stringify({
      ip,
      city,
      country,
      visit_time_utc: visitTimeUtc
    }),
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}

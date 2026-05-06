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

  const message =
    `New website visit!\n\n` +
    `IP: ${ip}\n` +
    `Location: ${city}, ${country}\n` +
    `Time UTC: ${visitTimeUtc}\n` +
    `User-Agent: ${userAgent}`;

  if (context.env.TELEGRAM_BOT_TOKEN && context.env.TELEGRAM_CHAT_ID) {
    await fetch(
      `https://api.telegram.org/bot${context.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: context.env.TELEGRAM_CHAT_ID,
          text: message
        })
      }
    );
  }

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

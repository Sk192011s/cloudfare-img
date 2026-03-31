// GET /proxy?url=https://example.com/image.jpg
export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const targetUrl = url.searchParams.get("url");

  if (!targetUrl) {
    return new Response("Missing URL", { status: 400 });
  }

  try {
    const resp = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    return new Response(resp.body, {
      headers: {
        "Content-Type": resp.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (e) {
    return new Response("Proxy Error", { status: 500 });
  }
}

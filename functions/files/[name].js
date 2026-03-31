// GET /files/1234_photo.jpg → R2 ကနေ ပုံ serve
export async function onRequestGet(context) {
  const { MY_BUCKET } = context.env;
  const fileName = context.params.name;

  if (!fileName) {
    return new Response("Not Found", { status: 404 });
  }

  try {
    const object = await MY_BUCKET.get(fileName);

    if (!object) {
      return new Response("File Not Found", { status: 404 });
    }

    const headers = new Headers();
    headers.set("Content-Type", object.httpMetadata?.contentType || "image/jpeg");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    headers.set("Access-Control-Allow-Origin", "*");

    return new Response(object.body, { headers });
  } catch (e) {
    return new Response("Error retrieving file", { status: 500 });
  }
}

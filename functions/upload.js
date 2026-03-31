// POST /upload
export async function onRequestPost(context) {
  const { MY_BUCKET, HISTORY_KV } = context.env;

  try {
    const formData = await context.request.formData();
    const file = formData.get("file");

    if (!file) {
      return new Response(JSON.stringify({ error: "No file" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Unique filename ဖန်တီးခြင်း (UUID ထည့်ထားလို့ ဘယ်တော့မှ မထပ်နိုင်)
    const timestamp = Date.now();
    const uuid = crypto.randomUUID();
    const ext = getExtension(file.name, file.type);
    const fileName = `${timestamp}_${uuid}.${ext}`;

    // R2 သို့ Upload
    const arrayBuffer = await file.arrayBuffer();
    await MY_BUCKET.put(fileName, arrayBuffer, {
      httpMetadata: {
        contentType: file.type || "image/jpeg",
      },
    });

    // Public URL ဖန်တီးခြင်း
    const origin = new URL(context.request.url).origin;
    const publicUrl = `${origin}/files/${fileName}`;

    // History KV ထဲ သိမ်းခြင်း
    const id = `${timestamp}_${uuid}`;
    const historyItem = {
      id,
      public_url: publicUrl,
      file_name: file.name,
      r2_key: fileName,
      created_at: new Date().toISOString(),
    };
    await HISTORY_KV.put(`history:${id}`, JSON.stringify(historyItem));

    return new Response(JSON.stringify({ url: publicUrl }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

function getExtension(name, type) {
  const fromName = name.split(".").pop();
  if (fromName && fromName !== name) return fromName;
  const map = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };
  return map[type] || "jpg";
}

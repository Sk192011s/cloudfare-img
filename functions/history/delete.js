// POST /history/delete
export async function onRequestPost(context) {
  const { MY_BUCKET, HISTORY_KV } = context.env;

  try {
    const body = await context.request.json();
    const id = body.id;

    // KV ထဲက history data ဖတ်ပါ (R2 key ပါပါတယ်)
    const raw = await HISTORY_KV.get(`history:${id}`);
    if (raw) {
      const item = JSON.parse(raw);
      // R2 ထဲက ဖိုင်ကိုလည်း ဖျက်ပါ
      if (item.r2_key) {
        await MY_BUCKET.delete(item.r2_key);
      }
    }

    // KV ထဲကလည်း ဖျက်ပါ
    await HISTORY_KV.delete(`history:${id}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

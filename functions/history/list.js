// GET /history/list
export async function onRequestGet(context) {
  const { HISTORY_KV } = context.env;

  try {
    const list = await HISTORY_KV.list({ prefix: "history:", limit: 50 });
    const items = [];

    for (const key of list.keys) {
      const val = await HISTORY_KV.get(key.name);
      if (val) {
        items.push(JSON.parse(val));
      }
    }

    // Newest first
    items.sort((a, b) => b.created_at.localeCompare(a.created_at));

    return new Response(JSON.stringify({ items }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ items: [], error: e.message }), {
      headers: { "Content-Type": "application/json" },
    });
  }
}

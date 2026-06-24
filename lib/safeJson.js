export function safeJsonParse(text, fallback = null) {
  try {
    const source = String(text ?? "");
    if (!source.trim()) return { ok: false, value: fallback, error: new Error("JSON input is empty") };
    return { ok: true, value: JSON.parse(source), error: null };
  } catch (error) {
    return { ok: false, value: fallback, error };
  }
}

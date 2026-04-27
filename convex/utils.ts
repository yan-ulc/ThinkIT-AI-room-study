// convex/utils.ts

type AIMode = "summarize" | "quiz";

type CallAIOptions = {
  mode: AIMode;
  content: string;
  context?: {
    previousQuestions?: string[];
    title?: string;
    questionCount?: number;
  };
};

export async function callAI({ mode, content, context }: CallAIOptions) {
  const apiKey = process.env.DIGITALOCEAN_MODEL_ACCESS_KEY ?? process.env.DIGITALOCEAN_AI_KEY;
  if (!apiKey) throw new Error("Missing AI API Key");

  const previousQuestionsBlock =
    context?.previousQuestions && context.previousQuestions.length > 0
      ? `\nHINDARI pertanyaan yang mirip dengan soal-soal ini:\n${context.previousQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}\n`
      : "";

  const config = {
    summarize: {
      model: "llama3.3-70b-instruct",
      system:
        "You are a professional document analysis assistant. You MUST respond ONLY in raw JSON format — no explanations, no markdown, no extra text. Just the JSON object.",
      prompt: `Buatlah ringkasan eksekutif dari teks berikut dalam BAHASA INDONESIA.
Format output HARUS JSON persis seperti ini (tidak ada teks lain):
{ "summaryText": "paragraf ringkasan yang padat", "keyPoints": ["poin 1", "poin 2", "dst"] }

ISI DOKUMEN: ${content}`,
      maxTokens: 2000,
    },
    quiz: {
      // Use llama (non-reasoning) — DeepSeek R1 produces <think> blocks that break JSON parsing
      model: "llama3.3-70b-instruct",
      system:
        "You are an expert quiz creator. You MUST respond ONLY with a raw JSON array — no explanations, no markdown, no extra text. Just the JSON array.",
      prompt: `Berdasarkan ringkasan berikut, buatlah TEPAT ${context?.questionCount ?? 5} soal pilihan ganda dalam BAHASA INDONESIA.
Tiap soal harus memiliki TEPAT 4 opsi dan 1 jawaban yang benar.
${previousQuestionsBlock}
ATURAN FORMAT (WAJIB DIIKUTI):
- Output HANYA JSON array, tidak ada teks lain sebelum atau sesudahnya
- Format: [{ "question": "...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "answer": "A. ..." }]
- Field "answer" harus berupa teks PERSIS sama dengan salah satu opsi di "options"
- Pastikan array selalu ditutup dengan ] di akhir
- Buat TEPAT ${context?.questionCount ?? 5} soal, tidak lebih tidak kurang

RINGKASAN: ${content}`,
      maxTokens: Math.max(2000, (context?.questionCount ?? 5) * 400),
    },
  };

  const selected = config[mode];

  const url = "https://inference.do-ai.run/v1/chat/completions";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: selected.model,
      messages: [
        { role: "system", content: selected.system },
        { role: "user", content: selected.prompt },
      ],
      max_tokens: selected.maxTokens,
      temperature: 0.3,
    }),
  });

  if (!response.ok) throw new Error(`AI API Error ${response.status}`);

  const data = await response.json();
  let result: string = data?.choices?.[0]?.message?.content ?? "";

  // Step 1: Strip any <think>...</think> reasoning blocks (DeepSeek R1 style)
  result = result.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  // Step 2: Strip markdown code fences
  result = result.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

  // Step 3: Extract the outermost JSON object or array
  const arrayStart = result.indexOf("[");
  const arrayEnd = result.lastIndexOf("]");
  const objStart = result.indexOf("{");
  const objEnd = result.lastIndexOf("}");

  // Prefer whichever valid bracket pair appears first
  const hasArray = arrayStart !== -1 && arrayEnd > arrayStart;
  const hasObj = objStart !== -1 && objEnd > objStart;

  if (hasArray && hasObj) {
    result = arrayStart < objStart
      ? result.substring(arrayStart, arrayEnd + 1)
      : result.substring(objStart, objEnd + 1);
  } else if (hasArray) {
    result = result.substring(arrayStart, arrayEnd + 1);
  } else if (hasObj) {
    result = result.substring(objStart, objEnd + 1);
  }

  // Step 4: Validate before returning — throw a clear error if still broken
  try {
    JSON.parse(result);
  } catch {
    throw new Error(
      `AI returned invalid JSON. Snippet: ${result.slice(0, 300)}`
    );
  }

  return result;
}
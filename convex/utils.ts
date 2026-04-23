// convex/utils.ts

type AIMode = "summarize" | "quiz";

type CallAIOptions = {
  mode: AIMode;
  content: string;
};

export async function callAI({ mode, content }: CallAIOptions) {
  const apiKey = process.env.DIGITALOCEAN_MODEL_ACCESS_KEY ?? process.env.DIGITALOCEAN_AI_KEY;
  if (!apiKey) throw new Error("Missing AI API Key");

  const config = {
    summarize: {
      model: "llama3.3-70b-instruct"        ,
      system: "Kamu adalah asisten analisis dokumen profesional. Kamu harus merespons HANYA dalam format JSON mentah.",
      prompt: `Buatlah ringkasan eksekutif dari teks berikut dalam BAHASA INDONESIA.
      Format output harus JSON: { "summaryText": "paragraf ringkasan yang padat", "keyPoints": ["poin 1", "poin 2", "dst"] }. 
      
      ISI DOKUMEN: ${content}`,
      maxTokens: 2000,
    },
    quiz: {
      model: "deepseek-r1-distill-llama-70b",
      system: "Kamu adalah pakar pembuat konten edukasi. Kamu harus merespons HANYA dalam format JSON mentah.",
      prompt: `Berdasarkan ringkasan berikut, buatlah 5 soal pilihan ganda yang menantang dalam BAHASA INDONESIA.
      Tiap soal harus memiliki 4 opsi dan 1 jawaban yang benar.
      Format output harus JSON Array: [{ "question": "...", "options": ["...", "...", "...", "..."], "answer": "teks_jawaban_yang_benar" }].
      
      RINGKASAN: ${content}`,
      maxTokens: 3000,
    }
  };

  const selected = config[mode];

  const url = "https://inference.do-ai.run/v1/chat/completions";;
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
      temperature: 0.1,
    }),
  });

  if (!response.ok) throw new Error(`AI API Error ${response.status}`);

  const data = await response.json();
  let result = data?.choices?.[0]?.message?.content ?? "";

  // CLEANING LOGIC (Tetap pertahankan ini biar gak meledak)
  result = result.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  result = result.replace(/```json/gi, "").replace(/```/gi, "").trim();
  
  const start = result.search(/[\{\[]/);
  const end = Math.max(result.lastIndexOf("}"), result.lastIndexOf("]")) + 1;
  
  if (start !== -1 && end !== -1) {
    result = result.substring(start, end);
  }

  return result;
}
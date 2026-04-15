import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { action, internalMutation } from "./_generated/server";

function extractPrimaryText(data: any): string | null {
  // Support common OpenAI-compatible shapes.
  if (typeof data?.choices?.[0]?.message?.content === "string") {
    return data.choices[0].message.content;
  }
  if (typeof data?.choices?.[0]?.text === "string") {
    return data.choices[0].text;
  }
  return null;
}

export const chatWithAi = action({
  args: {
    roomId: v.id("rooms"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const chunks = await ctx.runAction(api.rag_node.searchRelevance, {
      roomId: args.roomId,
      query: args.message,
    });
    const context = chunks.join("\n\n");

    const systemPrompt = `You are ThinkIT AI. Use the context to answer. 
    Context: ${context}`;

    let responseText = "";
    const primaryUrl = process.env.DO_INFERENCE_URL;
    const doApiKey = process.env.DO_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    // --- 1. JALUR PRIMARY (DIGITALOCEAN) ---
    try {
      if (!primaryUrl || !doApiKey) {
        throw new Error("Missing DO_INFERENCE_URL or DO_API_KEY");
      }

      const response = await fetch(primaryUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${doApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3-70b",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: args.message },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const parsed = extractPrimaryText(data);
        if (!parsed) {
          throw new Error("Primary response schema unsupported");
        }
        responseText = parsed;
      } else {
        throw new Error(`DO API Error: ${response.status}`);
      }
    } catch (error) {
      console.error("Primary AI Failed, hitting Gemini Fallback...", error);

      // --- 2. JALUR FALLBACK (GEMINI) ---
      try {
        if (!geminiApiKey) {
          throw new Error("Missing GEMINI_API_KEY");
        }

        const geminiResp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: `${systemPrompt}\n\nUser: ${args.message}` }],
                },
              ],
            }),
          },
        );

        const data = await geminiResp.json();

        // VALIDASI RESPONSE GEMINI (Biar gak crash lagi di baris 57)
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
          responseText = data.candidates[0].content.parts[0].text;
        } else {
          console.error("Gemini Error Detail:", JSON.stringify(data));
          responseText = "Duh, AI-nya lagi pusing Ngab. Coba lagi bentar ya.";
        }
      } catch (geminiErr) {
        console.error("Gemini Critical Fail:", geminiErr);
        responseText = "Koneksi ke otak AI terputus. Cek internet/API Key lu.";
      }
    }

    // 4. Save AI Response
    await ctx.runMutation(internal.ai.storeAiMessage, {
      roomId: args.roomId,
      content: responseText,
    });
  },
});

export const storeAiMessage = internalMutation({
  args: { roomId: v.id("rooms"), content: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      roomId: args.roomId,
      senderId: null,
      content: args.content,
      type: "ai",
      mentionedUsers: [],
    });
  },
});

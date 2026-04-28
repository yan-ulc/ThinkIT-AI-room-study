# ThinkIT

AI-powered collaborative learning platform that turns group chats and shared documents into an active learning loop: discuss, retrieve context, summarize, generate quizzes, and measure understanding.

---

## 1. 📌 Project Overview

ThinkIT is a real-time, room-based learning platform where people collaborate around study materials. It merges chat, document intelligence, and assessment into a single workflow:

- **Collaboration**: Rooms function like virtual classrooms with members, roles, and live messaging.
- **AI-enhanced learning**: Users can mention `@ai` in chat, reference highlighted document sections, and get context-aware responses.
- **Learning loop**: Upload → summarize → generate quizzes → share in chat → attempt → score.

The product solves a common gap in study tools: isolated AI chatbots that ignore shared context, and static quizzes that are disconnected from the learning conversation. ThinkIT closes the loop with a shared AI layer grounded in the room’s documents.

---

## 2. 🚀 Core Features (Detailed)

### Chat System

- **Real-time messaging** via Convex queries/mutations.
- **AI mention system (`@ai`)**: When a message includes `@ai`, an internal action is triggered to generate an AI response. The AI reply is saved as a system-owned message and pushed back into the chat.
- **Replies and quoted context**: Messages can be sent as replies; the AI prompt includes reply context so it can answer follow-up questions correctly.

### Document System

- **Upload & storage**: Documents are uploaded through Convex Storage and saved in the `documents` table.
- **Parsing**: PDF files are parsed server-side using `pdf-parse` inside a Convex Node action.
- **Chunking**: Extracted text is split into fixed-size segments (1000 chars) for embedding and retrieval.
- **Embedding**: Each chunk is embedded with Gemini embedding models and stored with a vector index for semantic search.

### Highlight → Ask AI

- Users highlight text inside the document preview.
- The selection is stored in `documentSelections` and embedded in the chat message in a structured format.
- When `@ai` is used, the selected passage is injected as **primary context**, ensuring AI responses remain grounded in the exact highlight.

### Summarization System

- **Cache-first**: Summaries are stored in `summaries` and returned instantly if available.
- **Map-reduce style**: Document text is combined and trimmed to a model-safe size before summarization.
- **Structured output**: Summaries are returned as a strict JSON payload with `summaryText` and `keyPoints`.

### Quiz System (Very Important)

- **Generation from summary**: Quizzes are derived from the cached summary to ensure consistency and speed.
- **Multiple quizzes per document**: Quizzes are stored independently in `quizzes`, allowing multiple quiz sessions to exist for a single document.
- **Quiz independence**: Quizzes persist even if the underlying document is deleted from the UI, preserving learning artifacts.
- **Anti-duplicate strategy**: Recent quiz questions are extracted and injected as constraints to reduce repetition.
- **Attempt tracking**: Each attempt is stored with `score`, `answers`, and a timestamp in `attempts`.
- **Scoring**: Best-score logic is computed per user to show mastery over time.

### Broadcast System

- When a quiz is generated, the system posts a **quiz broadcast message** into the room chat.
- Broadcast messages are clickable, linking users directly to the quiz in the UI.
- This turns quiz creation into a shared event rather than a hidden action.

---

## 3. 🧠 System Architecture

ThinkIT follows a **Next.js + Convex** architecture with AI requests orchestrated from Convex actions.

### Frontend ↔ Backend

- Next.js App Router handles UI, routing, and layout.
- Convex provides real-time data, mutations, and server-side actions.
- Clerk supplies auth identity mapped into Convex `users` records.

### AI Request Flow

1. User sends a chat message with `@ai`.
2. Convex mutation stores the message and schedules an internal AI action.
3. The AI action gathers:
   - selected document text (if any)
   - room context (recent messages)
   - RAG context (top vector hits)
4. AI response is stored as an `ai` message and broadcast in real time.

### Text Flow Diagram

Document → Chunk → Embed → Retrieve → AI Response
Document → Summary → Quiz → Attempt

---

## 4. 🔄 Data Flow

### Upload → Processing → Storage

1. Client requests a signed upload URL from Convex.
2. File is uploaded to Convex Storage.
3. A `documents` record is created with metadata and `storageId`.
4. A background action parses the PDF, chunks text, and stores embeddings in `documentChunks`.

### Ask AI → Retrieval → Response

1. User writes a message with `@ai` (optionally with a highlighted selection).
2. Chat mutation stores message and schedules AI action.
3. RAG search runs vector similarity in `documentChunks`.
4. AI prompt includes selection + retrieved chunks + reply context.
5. AI response is saved to `messages` as `type: "ai"`.

### Generate Quiz → Save → Broadcast

1. Quiz action checks for an existing summary.
2. If missing, a summary is generated and cached.
3. AI creates quiz questions with anti-duplicate hints.
4. Quiz is saved to `quizzes`.
5. A broadcast message is posted to chat (type: `quiz`).

---

## 5. 🧱 Database Schema (Very Detailed)

Below is the Convex schema as implemented in `convex/schema.ts`.

### Users

- `clerkId`: string (Clerk subject)
- `username`: string
- `displayName`: string
- `imageUrl`: string | null
- Indexes:
  - `by_clerkId`
  - `by_username`

### Rooms

- `name`: string
- `description`: string | null
- `isPrivate`: boolean
- `createdBy`: Id<"users">

### RoomMembers (bridge table)

- `roomId`: Id<"rooms">
- `userId`: Id<"users">
- `role`: "admin" | "member"
- `unreadCount`: number | null
- `mentionCount`: number | null
- `lastReadAt`: number | null (epoch ms)
- Indexes:
  - `by_roomId`
  - `by_userId`
  - `by_room_and_user`

### Messages

- `roomId`: Id<"rooms">
- `senderId`: Id<"users"> | "ai" | "system" | null
- `senderName`: string | null
- `senderImage`: string | null
- `content`: string
- `type`: "text" | "ai" | "system" | "quiz"
- `replyToId`: Id<"messages"> | null
- `selectionId`: Id<"documentSelections"> | null
- `mentionedUsers`: string[] (user IDs or "ai")
- `metadata` (optional object):
  - `model`: string | null
  - `tokens`: number | null
  - `sources`: string[] | null
  - `quizId`: Id<"quizzes"> | null
  - `quizTitle`: string | null
- Indexes:
  - `by_roomId`
  - `by_replyTo`
  - `by_selectionId`

### Documents

- `roomId`: Id<"rooms">
- `name`: string
- `fileUrl`: string (public storage URL)
- `storageId`: Id<"\_storage">
- `uploadedBy`: Id<"users">
- Indexes:
  - `by_roomId`

### DocumentSelections

- `roomId`: Id<"rooms">
- `documentId`: Id<"documents">
- `selectedBy`: Id<"users">
- `selectedText`: string
- `status`: "active" | "canceled"
- Indexes:
  - `by_roomId`
  - `by_documentId`
  - `by_room_and_user`

### DocumentChunks

- `documentId`: Id<"documents">
- `roomId`: Id<"rooms">
- `content`: string
- `embedding`: number[] (length 768)
- Indexes:
  - `by_documentId`
  - `by_roomId`
  - Vector index `by_embedding` (filterable by `roomId`)

### Summaries

- `documentId`: Id<"documents">
- `summaryText`: string
- `keyPoints`: string[]
- `userId`: string (Clerk subject)
- Indexes:
  - `by_documentId`

### Quizzes

- `roomId`: Id<"rooms">
- `documentId`: Id<"documents">
- `title`: string
- `questions`: { question, options[], answer }[]
- `userId`: string (creator Clerk subject)
- `createdAt`: number (epoch ms)
- Indexes:
  - `by_roomId`

### Attempts

- `quizId`: Id<"quizzes">
- `userId`: string (Clerk subject)
- `score`: number
- `answers`: string[]
- `createdAt`: number (epoch ms)
- Indexes:
  - `by_quizId`
  - `by_userId`

---

## 6. 🤖 AI System Design

ThinkIT uses a **multi-model AI architecture** optimized for speed, cost, and quality.

### Model Roles

- **DigitalOcean Inference** (`llama3.3-70b-instruct`)
  - Used for **summarization** and **quiz generation**.
  - Ensures structured JSON outputs and predictable formatting.

- **Groq** (`llama-3.3-70b-versatile`)
  - Primary model for real-time chat responses.
  - Optimized for low latency in interactive chat.

- **Gemini**
  - **Embedding model** (`gemini-embedding-001`) for RAG.
  - **Fallback generation** (`gemini-1.5-flash`) if Groq fails.

### Fallback Strategy

1. Attempt Groq chat completion.
2. If Groq fails, use Gemini 1.5 Flash with the same prompt.
3. For summarization/quiz, DigitalOcean retries before failing.

### Prompt Design Philosophy

- Strict JSON responses for summarization and quizzes to guarantee parseability.
- Context injection priority:
  1.  **Highlighted selection** (explicit user focus)
  2.  **RAG retrieved chunks** (semantic context)
  3.  **Recent chat history** (conversation continuity)

### RAG System

- PDF text → chunk → embed → vector index.
- Queries embed the user question and perform vector search.
- Top hits are injected as secondary context into the AI prompt.

---

## 7. 🧪 Quiz System Deep Dive

### Generation Flow

1. User triggers quiz generation from a document.
2. System fetches summary (or generates one).
3. Previous quiz questions are extracted for anti-duplication.
4. AI generates a new set of questions with strict JSON formatting.
5. Quiz is persisted and broadcast to the room chat.

### Anti-Duplicate Strategy

- Pulls up to 5 recent quizzes per room.
- Extracts up to 3 questions per quiz.
- Normalizes keywords and injects them as "avoid" constraints.

### Multiple Quiz Handling

- Quizzes are independent records tied to a document and room.
- No unique constraint on document ID, enabling multiple quiz versions.
- New quizzes do not overwrite older ones.

### Broadcast Integration

- Quiz creation sends a system message of type `quiz`.
- The message contains metadata (`quizId`, `quizTitle`) for UI linking.

### UI Flow

1. User clicks **Generate Quiz** in the document panel.
2. A dialog requests title and question count.
3. Upon success, the quiz appears in the room’s quiz list and chat feed.
4. Users open the quiz, submit answers, and see scores.

---

## 8. 🎨 Frontend Architecture

### Page Structure (App Router)

- `/` (landing / main entry)
- `/dashboard` (room list + navigation)
- `/room/[roomId]` (chat + documents + quizzes)

### Key UI Components

- Chat:
  - message list, input, reply preview, typing indicator
- Document panel:
  - PDF preview, highlight selection, Ask AI, quiz generation dialog
- Right panel:
  - documents tab, members tab, upload button
- Quiz:
  - quiz cards, quiz modal, attempt submission

### State Management (High Level)

- Convex hooks provide reactive data for rooms, messages, documents, and quizzes.
- Client hooks (`useChatLogic`, `useRoomData`, `useAiStreaming`) coordinate UI state.

---

## 9. 🎯 UI/UX Design System

- **Tailwind CSS** for utility-first styling.
- **shadcn/ui** for consistent primitives (buttons, dialogs, inputs, scroll areas).
- **Theme-first colors**: UI uses semantic tokens (`bg-background`, `text-foreground`) rather than hardcoded colors.
- **Dark mode support**: theme provider supplies light/dark variants.
- **Interaction patterns**: selection-based AI, quiz dialog flows, contextual badges.

---

## 10. 📁 Project Structure

```
app/                      # Next.js App Router pages and layouts
	(dashboard)/            # Authenticated experience
	layout.tsx              # Root layout and providers
components/               # Shared UI and feature components
	quiz/                   # Quiz UI components
	document/               # Document UI blocks
	layout/                 # Sidebar, top navigation, theme toggle
	ui/                     # shadcn/ui primitives
convex/                   # Convex backend (schema, queries, actions)
	_generated/             # Convex generated API types
lib/                      # Utility helpers
providers/                # App-level providers
public/                   # Static assets
```

---

## 11. ⚡ Key Technical Decisions

- **Quiz independence**: Quizzes are stored separately so learning artifacts persist and multiple quiz variants can exist per document.
- **Summary caching**: Summaries are saved to avoid repeated AI costs and ensure deterministic quiz generation.
- **Multi-model AI**: Different models are used for different tasks to balance latency (Groq), cost (DigitalOcean), and reliability (Gemini fallback).
- **RAG with vector search**: Ensures responses stay grounded in user-provided documents rather than generic answers.

---

## 12. 🚧 Future Improvements

- Learning analytics dashboard (per-user progress, quiz accuracy, time on task).
- Adaptive quiz generation based on weak areas.
- Leaderboards and streaks for group motivation.
- Smarter RAG (hierarchical chunking, document-level metadata filters).
- Collaborative annotations and inline discussion threads.

---

## 13. 🛠️ Setup & Installation

### Prerequisites

- Node.js 18+
- Convex CLI (`npm i -g convex` or `npx convex`)
- Clerk account (for authentication)
- API keys for DigitalOcean, Groq, and Gemini

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create `.env.local` with the following (adjust as needed):

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...

# Convex
NEXT_PUBLIC_CONVEX_URL=...

# AI Providers
DIGITALOCEAN_MODEL_ACCESS_KEY=...   # or DIGITALOCEAN_AI_KEY
GROQ_API_KEY=...
GEMINI_API_KEY=...

# Optional override
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
```

> Convex environment variables for actions can be set via `npx convex env set`.

### 3) Run Convex locally

```bash
npx convex dev
```

### 4) Run Next.js dev server

```bash
npm run dev
```

Open `http://localhost:3000` and sign in to start creating rooms, uploading documents, and generating quizzes.

---

## Tech Stack Summary

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend & DB**: Convex
- **Auth**: Clerk
- **AI Models**:
  - DigitalOcean (summarization & quiz generation)
  - Gemini (embeddings + fallback generation)
  - Groq (primary real-time chat)

---

## License

This project is currently unlicensed. Add a license before open-source release.

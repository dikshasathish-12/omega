import { API_URL } from "../config";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bot,
  Loader2,
  Send,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type StudentProfile = {
  name: string;
  grade: string;
  subjects: string[];
  selectedSubject: string;
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

/*
==================================================
CLEAN OMEGA AI RESPONSE
==================================================
*/

function cleanOmegaResponse(text: string) {
  if (!text) return "";

  let cleaned = text;

  // Remove code blocks
  cleaned = cleaned.replace(/```[\s\S]*?```/g, "");

  // Remove bold Markdown
  cleaned = cleaned.replace(/\*\*/g, "");

  // Remove headings
  cleaned = cleaned.replace(/^#{1,6}\s*/gm, "");

  // Remove inline code backticks
  cleaned = cleaned.replace(/`/g, "");

  // Remove bullet symbols at the beginning of lines
  cleaned = cleaned.replace(
    /^\s*[-*•▪◦●]\s+/gm,
    ""
  );

  // Remove numbered list formatting
  cleaned = cleaned.replace(
    /^\s*\d+[.)]\s+/gm,
    ""
  );

  // Remove blockquote symbols
  cleaned = cleaned.replace(
    /^\s*>\s?/gm,
    ""
  );

  // Remove horizontal lines
  cleaned = cleaned.replace(
    /^\s*[-_*]{3,}\s*$/gm,
    ""
  );

  // Remove decorative symbols
  cleaned = cleaned.replace(
    /[★☆✓✔️🔹🔸➡️👉✨⭐️]/g,
    ""
  );

  // Remove remaining Markdown formatting characters
  cleaned = cleaned.replace(/\*/g, "");
  cleaned = cleaned.replace(/_/g, "");
  cleaned = cleaned.replace(/~+/g, "");
  cleaned = cleaned.replace(/\^+/g, "");

  // Remove excessive spaces
  cleaned = cleaned.replace(/[ \t]{2,}/g, " ");

  // Remove spaces at the beginning of lines
  cleaned = cleaned.replace(/^[ \t]+/gm, "");

  // Remove excessive empty lines
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  return cleaned.trim();
}

/*
==================================================
ASK OMEGA
==================================================
*/

function Ask() {
  const navigate = useNavigate();

  const [profile, setProfile] =
    useState<StudentProfile | null>(null);

  const [topic, setTopic] =
    useState("");

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [question, setQuestion] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
  ================================================
  LOAD PROFILE, TOPIC AND SAVED CHAT
  ================================================
  */

  useEffect(() => {
    const savedProfile =
      localStorage.getItem("studentProfile");

    if (savedProfile) {
      try {
        const parsedProfile =
          JSON.parse(savedProfile);

        setProfile(parsedProfile);
      } catch (err) {
        console.error(
          "Failed to load student profile:",
          err
        );
      }
    }

    const savedTopic =
      localStorage.getItem(
        "selectedLearningTopic"
      );

    if (savedTopic) {
      setTopic(savedTopic);
    }

    const savedConversation =
      localStorage.getItem(
        "omegaConversation"
      );

    if (savedConversation) {
      try {
        const parsedConversation =
          JSON.parse(savedConversation);

        if (Array.isArray(parsedConversation)) {
          const cleanedConversation =
            parsedConversation.map(
              (message: Message) => ({
                ...message,

                content:
                  message.role === "assistant"
                    ? cleanOmegaResponse(
                        message.content
                      )
                    : message.content,
              })
            );

          setMessages(
            cleanedConversation
          );
        }
      } catch (err) {
        console.error(
          "Failed to load conversation:",
          err
        );
      }
    }
  }, []);

  /*
  ================================================
  SAVE CHAT
  ================================================
  */

  useEffect(() => {
    localStorage.setItem(
      "omegaConversation",
      JSON.stringify(messages)
    );
  }, [messages]);

  /*
  ================================================
  ASK OMEGA
  ================================================
  */

  const askOmega = async () => {
    const trimmedQuestion =
      question.trim();

    if (!trimmedQuestion || loading) {
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: trimmedQuestion,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setQuestion("");
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/ask`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            question: trimmedQuestion,

            grade:
              profile?.grade ||
              "School student",

            subject:
              profile?.selectedSubject ||
              "General",

            topic:
              topic ||
              "General Learning",

            conversation: messages,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "OMEGA could not answer your question."
        );
      }

      const rawAnswer =
        data.answer ||
        data.response ||
        data.message ||
        "";

      const cleanAnswer =
        cleanOmegaResponse(rawAnswer);

      if (!cleanAnswer) {
        throw new Error(
          "OMEGA returned an empty response."
        );
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: cleanAnswer,
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);
    } catch (err) {
      console.error(
        "Ask OMEGA error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to OMEGA."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  ================================================
  ENTER KEY
  ================================================
  */

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      askOmega();
    }
  };

  /*
  ================================================
  CLEAR CHAT
  ================================================
  */

  const clearConversation = () => {
    setMessages([]);

    localStorage.removeItem(
      "omegaConversation"
    );
  };

  /*
  ================================================
  UI
  ================================================
  */

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">

      {/* Header */}

      <header className="border-b border-white/10 bg-slate-950/95">

        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition"
          >
            <ArrowLeft size={20} />
            Dashboard
          </button>

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-indigo-500/20 flex items-center justify-center">

              <Bot
                size={24}
                className="text-indigo-400"
              />

            </div>

            <div>

              <h1 className="text-xl font-bold">
                OMEGA AI Tutor
              </h1>

              <p className="text-sm text-slate-400">
                Ask questions about what you are learning
              </p>

            </div>

          </div>

          <button
            onClick={clearConversation}
            className="text-sm text-slate-400 hover:text-white transition"
          >
            Clear Chat
          </button>

        </div>

      </header>

      {/* Chat */}

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-8">

        {topic && (
          <div className="mb-5 text-center">

            <p className="text-sm text-slate-400">
              Learning topic
            </p>

            <p className="text-indigo-400 font-semibold mt-1">
              {topic}
            </p>

          </div>
        )}

        <div className="space-y-6">

          {/* Welcome */}

          {messages.length === 0 && (
            <div className="flex gap-4">

              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">

                <Bot
                  size={22}
                  className="text-indigo-400"
                />

              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 max-w-3xl">

                <p className="text-slate-200 leading-7">
                  Hello! I am OMEGA, your AI learning tutor.
                </p>

                <p className="text-slate-400 mt-3 leading-7">
                  Ask me anything about your current topic and I will explain it in a simple way.
                </p>

              </div>

            </div>
          )}

          {/* Messages */}

          {messages.map(
            (message, index) => (
              <div
                key={index}
                className={`flex gap-4 ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                {message.role ===
                  "assistant" && (
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">

                    <Bot
                      size={22}
                      className="text-indigo-400"
                    />

                  </div>
                )}

                <div
                  className={`max-w-3xl rounded-2xl p-5 ${
                    message.role === "user"
                      ? "bg-indigo-500 text-white"
                      : "bg-white/5 border border-white/10 text-slate-200"
                  }`}
                >

                  <div className="whitespace-pre-line leading-7">

                    {cleanOmegaResponse(
                      message.content
                    )}

                  </div>

                </div>

                {message.role ===
                  "user" && (
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">

                    <User
                      size={20}
                      className="text-slate-300"
                    />

                  </div>
                )}

              </div>
            )
          )}

          {/* Loading */}

          {loading && (
            <div className="flex gap-4">

              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">

                <Bot
                  size={22}
                  className="text-indigo-400"
                />

              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">

                <div className="flex items-center gap-3 text-slate-400">

                  <Loader2
                    size={20}
                    className="animate-spin"
                  />

                  <span>
                    OMEGA is thinking...
                  </span>

                </div>

              </div>

            </div>
          )}

          {/* Error */}

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
              {error}
            </div>
          )}

        </div>

      </main>

      {/* Input */}

      <div className="border-t border-white/10 bg-slate-950">

        <div className="max-w-5xl mx-auto px-6 py-5">

          <div className="flex gap-3 items-end">

            <textarea
              value={question}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Ask OMEGA a question..."
              rows={2}
              disabled={loading}
              className="flex-1 resize-none rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 transition"
            />

            <button
              onClick={askOmega}
              disabled={
                loading ||
                !question.trim()
              }
              className="h-12 px-5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 font-semibold"
            >

              {loading ? (
                <Loader2
                  size={20}
                  className="animate-spin"
                />
              ) : (
                <Send size={20} />
              )}

              Ask

            </button>

          </div>

          <p className="text-xs text-slate-500 mt-2">
            Press Enter to ask. Press Shift + Enter for a new line.
          </p>

        </div>

      </div>

    </div>
  );
}

export default Ask;
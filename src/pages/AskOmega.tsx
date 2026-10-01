import { API_URL } from "../config";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bot,
  Loader2,
  Send,
  Sparkles,
  User,
  Trash2,
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

function AskOmega() {
  const navigate = useNavigate();

  const [profile, setProfile] =
    useState<StudentProfile | null>(null);

  const [topic, setTopic] =
    useState("");

  const [question, setQuestion] =
    useState("");

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    const savedProfile =
      localStorage.getItem("studentProfile");

    if (savedProfile) {
      try {
        const parsedProfile =
          JSON.parse(savedProfile);

        setProfile(parsedProfile);
      } catch (error) {
        console.error(
          "Error loading student profile:",
          error
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

    const savedMessages =
      localStorage.getItem(
        "omegaConversation"
      );

    if (savedMessages) {
      try {
        setMessages(
          JSON.parse(savedMessages)
        );
      } catch (error) {
        console.error(
          "Error loading conversation:",
          error
        );
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "omegaConversation",
      JSON.stringify(messages)
    );
  }, [messages]);

  const askOmega = async () => {
    const trimmedQuestion =
      question.trim();

    if (
      !trimmedQuestion ||
      loading
    ) {
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

    try {
      const response = await fetch(
        `${API_URL}/api/ask`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            question:
              trimmedQuestion,

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

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to get response from OMEGA."
        );
      }

      const assistantMessage: Message = {
        role: "assistant",
        content:
          data.answer ||
          "I couldn't generate an answer right now.",
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);
    } catch (error) {
      console.error(
        "Ask OMEGA error:",
        error
      );

      const errorMessage: Message = {
        role: "assistant",
        content:
          "Sorry, I couldn't connect to OMEGA right now. Please try again.",
      };

      setMessages((previous) => [
        ...previous,
        errorMessage,
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);

    localStorage.removeItem(
      "omegaConversation"
    );
  };

  const useExampleQuestion = (
    example: string
  ) => {
    setQuestion(example);
  };

  const exampleQuestions = [
    "Explain this topic in simple words.",
    "Give me a real-world example.",
    "What are the important points I should remember?",
    "I don't understand this. Can you explain it differently?",
  ];

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">

        <div className="text-center max-w-md">

          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-5">
            <Bot
              size={34}
              className="text-indigo-400"
            />
          </div>

          <h1 className="text-2xl font-bold">
            Student Profile Required
          </h1>

          <p className="text-slate-400 mt-3">
            Please create your student
            profile before using Ask OMEGA.
          </p>

          <button
            onClick={() =>
              navigate("/profile")
            }
            className="mt-6 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 font-semibold transition"
          >
            Create Profile
          </button>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 md:px-6 py-6 md:py-10">

      <div className="max-w-5xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Bot size={26} />
            </div>

            <div>

              <h1 className="text-3xl font-bold">
                Ask OMEGA
              </h1>

              <p className="text-slate-400 mt-1">
                Your personal AI learning assistant
              </p>

            </div>

          </div>

          <div className="flex gap-3">

            {messages.length > 0 && (
              <button
                onClick={
                  clearConversation
                }
                className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 flex items-center gap-2 transition"
              >
                <Trash2 size={17} />
                Clear
              </button>
            )}

            <button
              onClick={() =>
                navigate("/")
              }
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 flex items-center gap-2 transition"
            >
              <ArrowLeft size={18} />
              Dashboard
            </button>

          </div>

        </div>

        {/* STUDENT CONTEXT */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">

            <p className="text-sm text-slate-400">
              Student
            </p>

            <p className="text-lg font-semibold mt-1">
              {profile.name || "Student"}
            </p>

          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">

            <p className="text-sm text-slate-400">
              Grade
            </p>

            <p className="text-lg font-semibold text-indigo-400 mt-1">
              {profile.grade}
            </p>

          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">

            <p className="text-sm text-slate-400">
              Subject
            </p>

            <p className="text-lg font-semibold text-emerald-400 mt-1">
              {profile.selectedSubject}
            </p>

          </div>

        </div>

        {/* CURRENT TOPIC */}

        <div className="mb-6 p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">

          <div className="flex items-center gap-3">

            <Sparkles
              size={21}
              className="text-indigo-400"
            />

            <div>

              <p className="text-sm text-slate-400">
                Current Learning Topic
              </p>

              <p className="font-semibold text-indigo-300 mt-1">
                {topic ||
                  "General Learning"}
              </p>

            </div>

          </div>

        </div>

        {/* CHAT */}

        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">

          <div className="p-5 border-b border-white/10">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">

                <Bot
                  size={21}
                  className="text-indigo-400"
                />

              </div>

              <div>

                <h2 className="font-semibold">
                  OMEGA AI Tutor
                </h2>

                <p className="text-xs text-slate-500">
                  Ask questions about what
                  you are learning
                </p>

              </div>

            </div>

          </div>

          <div className="min-h-[350px] max-h-[550px] overflow-y-auto p-5 space-y-5">

            {messages.length === 0 ? (

              <div className="flex flex-col items-center justify-center min-h-[320px] text-center">

                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-5">

                  <Bot
                    size={32}
                    className="text-indigo-400"
                  />

                </div>

                <h2 className="text-xl font-semibold">
                  Hi! I'm OMEGA
                </h2>

                <p className="text-slate-400 max-w-md mt-2">
                  Ask me anything about your
                  subject, lesson, homework,
                  or concept you are struggling
                  with.
                </p>

              </div>

            ) : (

              messages.map(
                (message, index) => (

                  <div
                    key={index}
                    className={`flex gap-3 ${
                      message.role ===
                      "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >

                    {message.role ===
                      "assistant" && (

                      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center">

                        <Bot
                          size={18}
                          className="text-indigo-400"
                        />

                      </div>

                    )}

                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role ===
                        "user"
                          ? "bg-indigo-500 text-white rounded-br-sm"
                          : "bg-slate-900 border border-white/10 text-slate-300 rounded-bl-sm"
                      }`}
                    >

                      <p className="whitespace-pre-line leading-7">
                        {message.content}
                      </p>

                    </div>

                    {message.role ===
                      "user" && (

                      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center">

                        <User
                          size={18}
                          className="text-slate-300"
                        />

                      </div>

                    )}

                  </div>

                )
              )

            )}

            {loading && (

              <div className="flex gap-3">

                <div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center">

                  <Bot
                    size={18}
                    className="text-indigo-400"
                  />

                </div>

                <div className="bg-slate-900 border border-white/10 rounded-2xl rounded-bl-sm px-5 py-4">

                  <div className="flex items-center gap-2 text-slate-400">

                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    <span>
                      OMEGA is thinking...
                    </span>

                  </div>

                </div>

              </div>

            )}

          </div>

          {/* EXAMPLES */}

          {messages.length === 0 && (

            <div className="px-5 pb-5">

              <p className="text-sm text-slate-500 mb-3">
                Try asking:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                {exampleQuestions.map(
                  (example) => (

                    <button
                      key={example}
                      onClick={() =>
                        useExampleQuestion(
                          example
                        )
                      }
                      className="text-left p-3 rounded-xl bg-slate-900 border border-white/10 hover:border-indigo-500/50 text-sm text-slate-300 transition"
                    >
                      {example}
                    </button>

                  )
                )}

              </div>

            </div>

          )}

          {/* INPUT */}

          <div className="p-5 border-t border-white/10">

            <div className="flex flex-col md:flex-row gap-3">

              <textarea
                value={question}
                onChange={(event) =>
                  setQuestion(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {

                  if (
                    event.key ===
                      "Enter" &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();
                    askOmega();
                  }

                }}
                placeholder="Ask OMEGA a question..."
                rows={3}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 resize-none"
              />

              <button
                onClick={askOmega}
                disabled={
                  loading ||
                  !question.trim()
                }
                className="md:w-32 py-3 px-5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 transition"
              >

                {loading ? (
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={20} />
                )}

                {loading
                  ? "Thinking"
                  : "Send"}

              </button>

            </div>

            <p className="text-xs text-slate-600 mt-3">
              Press Enter to send • Shift +
              Enter for a new line
            </p>

          </div>

        </div>

        {/* RETURN TO LESSON */}

        {topic && (

          <button
            onClick={() =>
              navigate("/lesson")
            }
            className="w-full mt-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-semibold transition"
          >
            ← Return to {topic}
          </button>

        )}

      </div>

    </div>
  );
}

export default AskOmega;
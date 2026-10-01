import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bot,
  Loader2,
  Send,
  Sparkles,
  User,
  Trash2,
  BookOpen,
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

type LessonContext = {
  title?: string;
  introduction?: string;
  explanation?: string;
  keyPoints?: string[];
  realWorldExample?: string;
  workedExample?: string;
  commonMistakes?: string[];
  summary?: string;
  checkQuestions?: string[];
};
function cleanOmegaResponse(text: string) {
  let cleaned = text;

  // Remove code fences
  cleaned = cleaned.replace(/```[\s\S]*?```/g, (match) => {
    return match
      .replace(/```[a-zA-Z0-9_-]*/g, "")
      .replace(/```/g, "")
      .trim();
  });

  // Remove Markdown formatting
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/gs, "$1");
  cleaned = cleaned.replace(/__(.*?)__/gs, "$1");
  cleaned = cleaned.replace(/(?<!\w)\*(.*?)\*(?!\w)/gs, "$1");
  cleaned = cleaned.replace(/(?<!\w)_(.*?)_(?!\w)/gs, "$1");
  cleaned = cleaned.replace(/`([^`]*)`/g, "$1");

  // Remove headings
  cleaned = cleaned.replace(/^[ \t]*#{1,6}[ \t]*/gm, "");

  // Remove bullets
  cleaned = cleaned.replace(/^[ \t]*[-*•▪◦●][ \t]+/gm, "");

  // Remove decorative characters
  cleaned = cleaned.replace(/[★☆✓✔️🔹🔸➡️👉✨⭐️]/g, "");

  // Remove repeated punctuation
  cleaned = cleaned.replace(/~+/g, "");
  cleaned = cleaned.replace(/\^+/g, "");

  // Remove extra spaces but preserve new lines
  cleaned = cleaned.replace(/[ \t]{2,}/g, " ");

  // Preserve paragraphs
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  return cleaned.trim();
}

function AskOmega() {
  const navigate = useNavigate();

  const [profile, setProfile] =
    useState<StudentProfile | null>(null);

  const [topic, setTopic] = useState("");

  const [subject, setSubject] = useState("");

  const [lessonContext, setLessonContext] =
    useState<LessonContext | null>(null);

  const [question, setQuestion] = useState("");

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [loading, setLoading] = useState(false);

  /*
  ==================================================
  LOAD STUDENT + LESSON + CONVERSATION
  ==================================================
  */

  useEffect(() => {
    // Load student profile
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

    // Load selected topic
    const savedTopic =
      localStorage.getItem(
        "selectedLearningTopic"
      );

    if (savedTopic) {
      setTopic(savedTopic);
    }

    // Load selected subject
    const savedSubject =
      localStorage.getItem(
        "selectedLearningSubject"
      );

    if (savedSubject) {
      setSubject(savedSubject);
    }

    /*
     * IMPORTANT:
     *
     * Load the complete lesson generated
     * by OMEGA.
     */
    const savedLesson =
      localStorage.getItem(
        "currentLessonContext"
      );

    if (savedLesson) {
      try {
        const parsedLesson =
          JSON.parse(savedLesson);

        setLessonContext(parsedLesson);
      } catch (error) {
        console.error(
          "Error loading lesson context:",
          error
        );
      }
    }

    // Load previous conversation
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

  /*
  ==================================================
  SAVE CONVERSATION
  ==================================================
  */

  useEffect(() => {
    localStorage.setItem(
      "omegaConversation",
      JSON.stringify(messages)
    );
  }, [messages]);

  /*
  ==================================================
  ASK OMEGA
  ==================================================
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

    /*
     * IMPORTANT:
     *
     * Include the NEW question immediately.
     *
     * Previously your code was sending
     * "messages", which did not contain the
     * question the student had just typed.
     */
    const nextMessages = [
      ...messages,
      userMessage,
    ];

    setMessages(nextMessages);

    setQuestion("");

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3001/api/ask",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            question: trimmedQuestion,

            grade:
              profile?.grade ||
              "School student",

            subject:
              subject ||
              profile?.selectedSubject ||
              "General",

            /*
             * Topic is only supporting information.
             *
             * OMEGA primarily uses the complete
             * lesson context.
             */
            topic:
              topic ||
              lessonContext?.title ||
              "Current Lesson",

            /*
             * MAIN FIX:
             *
             * Send the complete generated lesson.
             */
            lessonContext:
              lessonContext,

            /*
             * Send the complete recent
             * conversation including the
             * latest question.
             */
            conversation:
              nextMessages,
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
  content: cleanOmegaResponse(
    data.answer ||
      "I couldn't generate an answer right now."
  ),
};

      setMessages(previous => [
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
          "Sorry, I couldn't connect to OMEGA right now. Please make sure the OMEGA AI server is running on port 3001.",
      };

      setMessages(previous => [
        ...previous,
        errorMessage,
      ]);
    } finally {
      setLoading(false);
    }
  };

  /*
  ==================================================
  CLEAR CONVERSATION
  ==================================================
  */

  const clearConversation = () => {
    setMessages([]);

    localStorage.removeItem(
      "omegaConversation"
    );
  };

  /*
  ==================================================
  EXAMPLE QUESTION
  ==================================================
  */

  const useExampleQuestion = (
    example: string
  ) => {
    setQuestion(example);
  };

  const exampleQuestions = [
    "Explain this in simple words.",
    "Why does this work?",
    "Give me another example.",
    "I don't understand. Explain it differently.",
  ];

  /*
  ==================================================
  PROFILE CHECK
  ==================================================
  */

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
            Please create your student profile
            before using Ask OMEGA.
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

  /*
  ==================================================
  MAIN UI
  ==================================================
  */

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* HEADER */}

      <nav className="border-b border-white/10 px-6 py-5">

        <div className="max-w-5xl mx-auto flex items-center justify-between">

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <div className="flex items-center gap-2">

            <Bot
              size={23}
              className="text-indigo-400"
            />

            <span className="font-bold text-xl">
              OMEGA
            </span>

          </div>

          <button
            onClick={clearConversation}
            className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition"
          >
            <Trash2 size={18} />

            <span className="hidden sm:block">
              Clear
            </span>
          </button>

        </div>

      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">

        {/* TITLE */}

        <div className="mb-8">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">

              <Sparkles
                size={26}
                className="text-indigo-400"
              />

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
              {subject ||
                profile.selectedSubject ||
                "General"}
            </p>

          </div>

        </div>

        {/* CURRENT LESSON */}

        <div className="mb-6 p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">

          <div className="flex items-start gap-3">

            <BookOpen
              size={22}
              className="text-indigo-400 mt-1"
            />

            <div>

              <p className="text-sm text-slate-400">
                Current Learning Lesson
              </p>

              <p className="font-semibold text-indigo-300 mt-1">
                {lessonContext?.title ||
                  topic ||
                  "Current Lesson"}
              </p>

              <p className="text-sm text-slate-500 mt-2">
                OMEGA has the lesson context.
                You can ask follow-up questions
                without repeating the topic.
              </p>

            </div>

          </div>

        </div>

        {/* CHAT AREA */}

        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">

          {/* CHAT HEADER */}

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
                  Context-aware learning assistant
                </p>

              </div>

            </div>

          </div>

          {/* MESSAGES */}

          <div className="min-h-[400px] max-h-[600px] overflow-y-auto p-5 space-y-5">

            {messages.length === 0 ? (

              <div className="flex flex-col items-center justify-center min-h-[350px] text-center">

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
                  I already know what you're
                  learning. Ask me a question
                  directly.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6 w-full max-w-xl">

                  {exampleQuestions.map(
                    example => (
                      <button
                        key={example}
                        onClick={() =>
                          useExampleQuestion(
                            example
                          )
                        }
                        className="text-left p-4 rounded-xl bg-slate-900 border border-white/10 hover:border-indigo-500/50 text-sm text-slate-300 transition"
                      >
                        {example}
                      </button>
                    )
                  )}

                </div>

              </div>

            ) : (

              messages.map(
                (message, index) => (

                  <div
                    key={index}
                    className={`flex gap-3 ${
                      message.role === "user"
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
                        message.role === "user"
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

          {/* INPUT */}

          <div className="p-5 border-t border-white/10">

            <div className="flex flex-col md:flex-row gap-3">

              <textarea
                value={question}
                onChange={event =>
                  setQuestion(
                    event.target.value
                  )
                }
                onKeyDown={event => {

                  if (
                    event.key === "Enter" &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();

                    askOmega();
                  }

                }}
                placeholder="Ask your question..."
                rows={3}
                disabled={loading}
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
              You can ask follow-up questions
              naturally. You don't need to repeat
              the topic.
            </p>

          </div>

        </div>

        {/* RETURN */}

        <button
          onClick={() =>
            navigate("/lesson")
          }
          className="w-full mt-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-semibold transition"
        >
          ← Return to Lesson
        </button>

      </main>

    </div>
  );
}

export default AskOmega;
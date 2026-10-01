import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Loader2,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { addLearningActivity } from "../utils/learningHistory";
type StudentProfile = {
  name: string;
  grade: string;
  subjects: string[];
  selectedSubject: string;
};

type LessonData = {
  title: string;
  introduction: string;
  explanation: string;
  keyPoints: string[];
  realWorldExample: string;
  workedExample: string;
  commonMistakes: string[];
  summary: string;
  checkQuestions: string[];
};

function Lesson() {
  const navigate = useNavigate();

  const [profile, setProfile] =
    useState<StudentProfile | null>(null);

  const [subject, setSubject] =
    useState("");

  const [topic, setTopic] =
    useState("");

  const [lesson, setLesson] =
    useState<LessonData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [completed, setCompleted] =
    useState(false);

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
          "Error loading student profile:",
          err
        );
      }
    }

    const savedSubject =
      localStorage.getItem(
        "selectedLearningSubject"
      );

    const savedTopic =
      localStorage.getItem(
        "selectedLearningTopic"
      );

    if (savedSubject) {
      setSubject(savedSubject);
    }

    if (savedTopic) {
      setTopic(savedTopic);
    }

    if (savedTopic) {
      const completedKey =
        `lessonCompleted_${savedTopic}`;

      const isCompleted =
        localStorage.getItem(completedKey) ===
        "true";

      setCompleted(isCompleted);
    }
  }, []);

  useEffect(() => {
    if (!profile || !topic) {
      return;
    }

    generateLesson();
  }, [profile, topic]);

  const generateLesson = async () => {
    try {
      setLoading(true);
      setError("");

      const previousScore =
        localStorage.getItem(
          `previousScore_${topic}`
        );

      const response = await fetch(
        "http://localhost:3001/api/generate-lesson",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            grade:
              profile?.grade ||
              "School student",

            subject:
              subject ||
              profile?.selectedSubject ||
              "General",

            topic,

            previousScore:
              previousScore || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to generate lesson."
        );
      }

      const generatedLesson =
        data.lesson || data;

      setLesson(generatedLesson);

      /*
       * IMPORTANT:
       * Store the complete generated lesson.
       *
       * Ask OMEGA will use this information
       * to understand exactly what the student
       * is currently studying.
       */
      localStorage.setItem(
        "currentLessonContext",
        JSON.stringify(generatedLesson)
      );
    } catch (err) {
      console.error(
        "Lesson generation error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate lesson."
      );
    } finally {
      setLoading(false);
    }
  };

  const openAskOmega = () => {
    localStorage.setItem(
      "selectedLearningSubject",
      subject ||
        profile?.selectedSubject ||
        "General"
    );

    localStorage.setItem(
      "selectedLearningTopic",
      topic
    );

    if (lesson) {
      localStorage.setItem(
        "currentLessonContext",
        JSON.stringify(lesson)
      );
    }

    navigate("/ask");
  };

  const markComplete = () => {
  const completedKey =
    `lessonCompleted_${topic}`;

  localStorage.setItem(
    completedKey,
    "true"
  );

  addLearningActivity({
    type: "lesson",
    subject:
      subject ||
      profile?.selectedSubject ||
      "General",
    topic,
    title: lesson?.title || topic,
  });

  setCompleted(true);
};
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2
            size={42}
            className="animate-spin text-indigo-400 mx-auto"
          />

          <h2 className="text-xl font-semibold mt-5">
            OMEGA is creating your lesson...
          </h2>

          <p className="text-slate-400 mt-2">
            Generating content specifically for
            your subject and level.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold">
            Unable to load lesson
          </h1>

          <p className="text-red-400 mt-4">
            {error}
          </p>

          <button
            onClick={() => navigate("/learn")}
            className="mt-6 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 transition font-semibold"
          >
            Back to Lessons
          </button>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            No lesson available
          </h1>

          <button
            onClick={() => navigate("/learn")}
            className="mt-5 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600"
          >
            Back to Lessons
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Navigation */}
      <nav className="border-b border-white/10 px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">

          <button
            onClick={() => navigate("/learn")}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition"
          >
            <ArrowLeft size={20} />
            Back to Lessons
          </button>

          <div className="flex items-center gap-2">
            <BookOpen
              size={22}
              className="text-indigo-400"
            />

            <span className="font-bold">
              OMEGA
            </span>
          </div>

        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* Topic information */}
        <div className="mb-8">

          <p className="text-indigo-400 font-medium">
            {subject || "Learning"}
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mt-2">
            {lesson.title || topic}
          </h1>

          <p className="text-slate-400 mt-3">
            Current topic: {topic}
          </p>

        </div>

        {/* Ask OMEGA */}
        <button
          onClick={openAskOmega}
          className="mb-8 w-full py-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 transition flex items-center justify-center gap-3 font-semibold shadow-lg shadow-indigo-500/10"
        >
          <MessageCircle size={22} />

          Ask OMEGA about this topic

          <Sparkles size={19} />
        </button>

        {/* Introduction */}
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">

          <h2 className="text-2xl font-semibold flex items-center gap-3">
            <BookOpen
              size={24}
              className="text-indigo-400"
            />

            Introduction
          </h2>

          <p className="text-slate-300 mt-4 leading-8">
            {lesson.introduction}
          </p>

        </section>

        {/* Explanation */}
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">

          <h2 className="text-2xl font-semibold">
            Explanation
          </h2>

          <div className="text-slate-300 mt-4 leading-8 whitespace-pre-line">
            {lesson.explanation}
          </div>

        </section>

        {/* Key Points */}
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">

          <h2 className="text-2xl font-semibold">
            Key Points
          </h2>

          <div className="mt-5 space-y-3">

            {lesson.keyPoints?.map(
              (point, index) => (
                <div
                  key={index}
                  className="flex gap-3"
                >
                  <CheckCircle
                    size={21}
                    className="text-indigo-400 mt-1 shrink-0"
                  />

                  <p className="text-slate-300">
                    {point}
                  </p>
                </div>
              )
            )}

          </div>

        </section>

        {/* Real World Example */}
        <section className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 mb-6">

          <h2 className="text-2xl font-semibold">
            Real-World Example
          </h2>

          <p className="text-slate-300 mt-4 leading-8">
            {lesson.realWorldExample}
          </p>

        </section>

        {/* Worked Example */}
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">

          <h2 className="text-2xl font-semibold">
            Worked Example
          </h2>

          <div className="text-slate-300 mt-4 leading-8 whitespace-pre-line">
            {lesson.workedExample}
          </div>

        </section>

        {/* Common Mistakes */}
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">

          <h2 className="text-2xl font-semibold">
            Common Mistakes
          </h2>

          <div className="mt-5 space-y-3">

            {lesson.commonMistakes?.map(
              (mistake, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/10"
                >
                  <p className="text-slate-300">
                    {mistake}
                  </p>
                </div>
              )
            )}

          </div>

        </section>

        {/* Summary */}
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">

          <h2 className="text-2xl font-semibold">
            Summary
          </h2>

          <p className="text-slate-300 mt-4 leading-8">
            {lesson.summary}
          </p>

        </section>

        {/* Check Questions */}
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">

          <h2 className="text-2xl font-semibold">
            Check Your Understanding
          </h2>

          <p className="text-slate-400 mt-2">
            Think about these questions before
            moving to practice.
          </p>

          <div className="mt-5 space-y-4">

            {lesson.checkQuestions?.map(
              (question, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-slate-900 border border-white/10"
                >
                  <p className="text-slate-200">
                    {index + 1}. {question}
                  </p>
                </div>
              )
            )}

          </div>

        </section>

        {/* Ask OMEGA again */}
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 mb-8">

          <div className="flex items-center gap-3">

            <MessageCircle
              size={25}
              className="text-indigo-400"
            />

            <h2 className="text-xl font-semibold">
              Still have a question?
            </h2>

          </div>

          <p className="text-slate-400 mt-2">
            OMEGA already knows this lesson, so
            you can ask your doubt without
            explaining the topic again.
          </p>

          <button
            onClick={openAskOmega}
            className="mt-5 px-5 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 transition font-semibold flex items-center gap-2"
          >
            <MessageCircle size={19} />
            Ask OMEGA
          </button>

        </div>

        {/* Completion */}
        <div className="text-center">

          {!completed ? (
            <button
              onClick={markComplete}
              className="px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 transition font-semibold"
            >
              Mark Lesson Complete
            </button>
          ) : (
            <div className="flex flex-col items-center">

              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle size={22} />
                Lesson Completed
              </div>

              <button
                onClick={() =>
                  navigate("/ai-practice")
                }
                className="mt-5 px-7 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 transition font-semibold"
              >
                Practice This Topic
              </button>

            </div>
          )}

        </div>

      </main>
    </div>
  );
}

export default Lesson;
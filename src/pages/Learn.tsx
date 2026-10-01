import { API_URL } from "../config";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type StudentProfile = {
  name: string;
  grade: string;
  subjects: string[];
  selectedSubject: string;
};

type Lesson = {
  title: string;
  difficulty: string;
  estimatedMinutes: number;
  description: string;
};

function Learn() {
  const navigate = useNavigate();

  const [profile, setProfile] =
    useState<StudentProfile | null>(null);

  const [lessons, setLessons] =
    useState<Lesson[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const saved =
      localStorage.getItem("studentProfile");

    if (!saved) {
      return;
    }

    try {
      const data = JSON.parse(saved);
      setProfile(data);
    } catch (error) {
      console.error(
        "Profile loading error:",
        error
      );
    }
  }, []);

  const generateLessons = async () => {
    if (!profile) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/generate-lessons`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            grade: profile.grade,
            subject: profile.selectedSubject,
            previousTopics: [],
            completedTopics: [],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to generate lessons"
        );
      }

      if (
        !data.lessons ||
        !Array.isArray(data.lessons)
      ) {
        throw new Error(
          "No lessons were generated."
        );
      }

      setLessons(data.lessons);
    } catch (error) {
      console.error(
        "Generate lessons error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "OMEGA could not generate lessons."
      );
    } finally {
      setLoading(false);
    }
  };

  const openLesson = (lesson: Lesson) => {
    localStorage.setItem(
      "selectedLearningSubject",
      profile?.selectedSubject || ""
    );

    localStorage.setItem(
      "selectedLearningTopic",
      lesson.title
    );

    navigate("/lesson");
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <BookOpen
            size={60}
            className="mx-auto text-indigo-400 mb-5"
          />

          <h1 className="text-2xl font-bold">
            Profile Required
          </h1>

          <p className="text-slate-400 mt-2">
            Select your grade and subject first.
          </p>

          <button
            onClick={() =>
              navigate("/profile")
            }
            className="mt-6 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600"
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center">
              <BookOpen size={26} />
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                Learn
              </h1>

              <p className="text-slate-400">
                AI-powered personalized learning
              </p>
            </div>

          </div>

          <button
            onClick={() =>
              navigate("/")
            }
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Dashboard
          </button>

        </div>

        {/* PROFILE CONTEXT */}

        <div className="grid md:grid-cols-2 gap-4 mb-8">

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">

            <p className="text-sm text-slate-400">
              Your Grade
            </p>

            <p className="text-2xl font-bold text-indigo-400 mt-1">
              {profile.grade}
            </p>

          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">

            <p className="text-sm text-slate-400">
              Selected Subject
            </p>

            <p className="text-2xl font-bold text-emerald-400 mt-1">
              {profile.selectedSubject}
            </p>

          </div>

        </div>

        {/* AI GENERATION */}

        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 mb-8">

          <div className="flex items-start gap-4">

            <Sparkles
              size={28}
              className="text-indigo-400 shrink-0"
            />

            <div className="flex-1">

              <h2 className="text-xl font-semibold">
                OMEGA AI Learning Roadmap
              </h2>

              <p className="text-slate-400 mt-2">
                OMEGA will analyze your grade and
                subject and create a personalized
                set of lessons for you.
              </p>

              <button
                onClick={generateLessons}
                disabled={loading}
                className="mt-5 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 font-semibold flex items-center gap-2"
              >

                {loading ? (
                  <>
                    <Loader2
                      size={20}
                      className="animate-spin"
                    />
                    OMEGA is creating lessons...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate My Lessons
                  </>
                )}

              </button>

            </div>

          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}

        {/* LESSONS */}

        {lessons.length > 0 && (
          <div>

            <div className="flex items-center justify-between mb-5">

              <div>

                <h2 className="text-2xl font-bold">
                  Your AI-Generated Lessons
                </h2>

                <p className="text-slate-400 mt-1">
                  Created specifically for{" "}
                  {profile.grade}{" "}
                  {profile.selectedSubject}
                </p>

              </div>

            </div>

            <div className="space-y-4">

              {lessons.map(
                (lesson, index) => (
                  <div
                    key={`${lesson.title}-${index}`}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-indigo-500/50 transition"
                  >

                    <div className="flex flex-col md:flex-row md:items-center gap-5">

                      <div className="w-14 h-14 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">

                        <span className="text-xl font-bold text-indigo-400">
                          {index + 1}
                        </span>

                      </div>

                      <div className="flex-1">

                        <h3 className="text-xl font-semibold">
                          {lesson.title}
                        </h3>

                        <p className="text-slate-400 mt-2">
                          {lesson.description}
                        </p>

                        <div className="flex flex-wrap gap-4 mt-3">

                          <span className="text-sm text-indigo-400">
                            {lesson.difficulty}
                          </span>

                          <span className="text-sm text-slate-500 flex items-center gap-1">
                            <Clock size={15} />
                            {lesson.estimatedMinutes} min
                          </span>

                        </div>

                      </div>

                      <button
                        onClick={() =>
                          openLesson(lesson)
                        }
                        className="px-5 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 font-semibold"
                      >
                        Start Lesson
                      </button>

                    </div>

                  </div>
                )
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default Learn;
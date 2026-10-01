
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Brain,
  BookOpen,
  CheckCircle,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getLearningHistory } from "../utils/learningHistory";

type LearningActivity = {
  id: string;
  type: "lesson" | "practice" | "quiz" | "ask";
  subject: string;
  topic: string;
  title: string;
  score?: number;
  questions?: number;
  correct?: number;
  timestamp: string;
  duration?: number;
};

function LearningHistory() {
  const navigate = useNavigate();

  const [activities, setActivities] =
    useState<LearningActivity[]>([]);

  useEffect(() => {
    const loadHistory = () => {
      setActivities(
        getLearningHistory() as LearningActivity[]
      );
    };

    loadHistory();

    window.addEventListener(
      "omegaHistoryUpdated",
      loadHistory
    );

    window.addEventListener(
      "focus",
      loadHistory
    );

    return () => {
      window.removeEventListener(
        "omegaHistoryUpdated",
        loadHistory
      );

      window.removeEventListener(
        "focus",
        loadHistory
      );
    };
  }, []);

  /*
   * All scored learning activities.
   */
  const scoredActivities =
    activities.filter(
      (activity) =>
        (activity.type === "quiz" ||
          activity.type === "practice") &&
        activity.score !== undefined
    );

  /*
   * Completed lessons.
   */
  const lessonActivities =
    activities.filter(
      (activity) =>
        activity.type === "lesson"
    );

  /*
   * Average score.
   */
  const averageScore =
    scoredActivities.length > 0
      ? Math.round(
          scoredActivities.reduce(
            (total, activity) =>
              total + (activity.score || 0),
            0
          ) /
            scoredActivities.length
        )
      : 0;

  /*
   * Best score.
   */
  const bestScore =
    scoredActivities.length > 0
      ? Math.max(
          ...scoredActivities.map(
            (activity) =>
              activity.score || 0
          )
        )
      : 0;

  /*
   * Total questions and correct answers.
   */
  const totalQuestions =
    scoredActivities.reduce(
      (total, activity) =>
        total + (activity.questions || 0),
      0
    );

  const totalCorrect =
    scoredActivities.reduce(
      (total, activity) =>
        total + (activity.correct || 0),
      0
    );

  /*
   * Clear all OMEGA learning history.
   */
  const clearHistory = () => {
    const confirmed =
      window.confirm(
        "Are you sure you want to clear your learning history?"
      );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem(
      "omegaLearningHistory"
    );

    window.dispatchEvent(
      new Event("omegaHistoryUpdated")
    );

    setActivities([]);
  };

  /*
   * Format timestamp into readable date/time.
   */
  const formatDate = (
    timestamp: string
  ) => {
    try {
      return new Date(
        timestamp
      ).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  /*
   * Activity label.
   */
  const getActivityLabel = (
    type: LearningActivity["type"]
  ) => {
    switch (type) {
      case "lesson":
        return "Lesson";

      case "practice":
        return "AI Practice";

      case "quiz":
        return "Quiz";

      case "ask":
        return "Ask OMEGA";

      default:
        return "Learning Activity";
    }
  };

  /*
   * Empty state.
   */
  if (activities.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-white px-6 py-10">

        <div className="max-w-5xl mx-auto">

          <div className="flex items-center justify-between mb-8">

            <div className="flex items-center gap-3">

              <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center">
                <Brain size={26} />
              </div>

              <div>

                <h1 className="text-3xl font-bold">
                  Learning History
                </h1>

                <p className="text-slate-400">
                  Track your learning progress over time
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

          <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">

            <Brain
              size={50}
              className="mx-auto text-indigo-400 mb-5"
            />

            <h2 className="text-2xl font-bold">
              No Learning History Yet
            </h2>

            <p className="text-slate-400 mt-3">
              Start a lesson or AI practice activity to begin building your learning history.
            </p>

            <button
              onClick={() =>
                navigate("/learn")
              }
              className="mt-6 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 font-semibold"
            >
              Start Learning
            </button>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-10">

      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center">
              <Brain size={26} />
            </div>

            <div>

              <h1 className="text-3xl font-bold">
                Learning History
              </h1>

              <p className="text-slate-400">
                Track your learning progress over time
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={clearHistory}
              className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 flex items-center gap-2"
            >
              <Trash2 size={18} />
              Clear History
            </button>

            <button
              onClick={() =>
                navigate("/")
              }
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} />
              Dashboard
            </button>

          </div>

        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-5 mb-8">

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

            <BookOpen
              size={26}
              className="text-indigo-400"
            />

            <p className="text-slate-400 mt-4">
              Lessons
            </p>

            <p className="text-3xl font-bold mt-1">
              {lessonActivities.length}
            </p>

          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

            <BarChart3
              size={26}
              className="text-indigo-400"
            />

            <p className="text-slate-400 mt-4">
              Practice
            </p>

            <p className="text-3xl font-bold mt-1">
              {scoredActivities.length}
            </p>

          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

            <TrendingUp
              size={26}
              className="text-indigo-400"
            />

            <p className="text-slate-400 mt-4">
              Average Score
            </p>

            <p className="text-3xl font-bold mt-1">
              {averageScore}%
            </p>

          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

            <CheckCircle
              size={26}
              className="text-indigo-400"
            />

            <p className="text-slate-400 mt-4">
              Best Score
            </p>

            <p className="text-3xl font-bold mt-1">
              {bestScore}%
            </p>

          </div>

        </div>

        {/* Question Summary */}
        {totalQuestions > 0 && (

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">

            <h2 className="text-xl font-semibold">
              Overall Question Performance
            </h2>

            <div className="grid grid-cols-3 gap-6 mt-5">

              <div className="text-center">

                <p className="text-3xl font-bold text-emerald-400">
                  {totalCorrect}
                </p>

                <p className="text-slate-400 text-sm">
                  Correct
                </p>

              </div>

              <div className="text-center">

                <p className="text-3xl font-bold text-slate-300">
                  {Math.max(
                    totalQuestions -
                      totalCorrect,
                    0
                  )}
                </p>

                <p className="text-slate-400 text-sm">
                  Incorrect
                </p>

              </div>

              <div className="text-center">

                <p className="text-3xl font-bold text-indigo-400">
                  {totalQuestions}
                </p>

                <p className="text-slate-400 text-sm">
                  Total
                </p>

              </div>

            </div>

          </div>

        )}

        {/* Activity History */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

          <div className="flex items-center gap-3 mb-6">

            <BarChart3
              size={24}
              className="text-indigo-400"
            />

            <h2 className="text-xl font-semibold">
              Learning Activities
            </h2>

          </div>

          <div className="space-y-4">

            {activities.map(
              (activity) => (

                <div
                  key={activity.id}
                  className="bg-slate-900 border border-white/10 rounded-xl p-5"
                >

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    <div>

                      <div className="flex items-center gap-3">

                        <span className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-semibold">
                          {getActivityLabel(
                            activity.type
                          )}
                        </span>

                        <span className="text-sm text-slate-500">
                          {formatDate(
                            activity.timestamp
                          )}
                        </span>

                      </div>

                      <p className="text-lg font-semibold mt-3">
                        {activity.title}
                      </p>

                      <p className="text-slate-400 mt-1">
                        {activity.subject}
                        {" • "}
                        {activity.topic}
                      </p>

                      {activity.duration !==
                        undefined && (
                        <p className="text-sm text-slate-500 mt-2">
                          Duration:{" "}
                          {activity.duration} minutes
                        </p>
                      )}

                    </div>

                    <div className="flex items-center gap-4">

                      {activity.score !==
                        undefined ? (

                        <div
                          className={`px-4 py-2 rounded-xl font-bold ${
                            activity.score >=
                            80
                              ? "bg-emerald-500/20 text-emerald-400"
                              : activity.score >=
                                60
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {activity.score}%
                        </div>

                      ) : (

                        <div className="px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-400 font-semibold">
                          Completed
                        </div>

                      )}

                    </div>

                  </div>

                  {activity.questions !==
                    undefined &&
                    activity.correct !==
                      undefined && (

                    <div className="flex gap-5 mt-4 pt-4 border-t border-white/10 text-sm">

                      <span className="text-emerald-400">
                        Correct:{" "}
                        {activity.correct}
                      </span>

                      <span className="text-slate-400">
                        Questions:{" "}
                        {activity.questions}
                      </span>

                    </div>

                  )}

                </div>

              )
            )}

          </div>

        </div>

        {/* Bottom Navigation */}
        <div className="grid md:grid-cols-2 gap-4 mt-8">

          <button
            onClick={() =>
              navigate("/ai-practice")
            }
            className="py-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 font-semibold flex items-center justify-center gap-2"
          >
            <Brain size={20} />
            Practice Again
          </button>

          <button
            onClick={() =>
              navigate("/analyze")
            }
            className="py-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 font-semibold flex items-center justify-center gap-2"
          >
            <TrendingUp size={20} />
            View Analysis
          </button>

        </div>

      </div>

    </div>
  );
}

export default LearningHistory;


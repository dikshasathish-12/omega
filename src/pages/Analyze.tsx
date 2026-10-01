import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Brain,
  BookOpen,
  RotateCcw,
  Target,
  TrendingUp,
  Award,
  BarChart3,
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

function Analyze() {
  const navigate = useNavigate();

  const [history, setHistory] =
    useState<LearningActivity[]>([]);

  useEffect(() => {
    const loadHistory = () => {
      setHistory(
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
   * Get all quiz and practice activities
   * that contain a score.
   */
  const scoredActivities =
    history.filter(
      (activity) =>
        (activity.type === "quiz" ||
          activity.type === "practice") &&
        activity.score !== undefined
    );

  /*
   * Get all completed lessons.
   */
  const lessonActivities =
    history.filter(
      (activity) =>
        activity.type === "lesson"
    );

  /*
   * Latest learning activity.
   */
  const latestActivity =
    history.length > 0
      ? history[0]
      : null;

  /*
   * Latest scored activity.
   */
  const latestQuiz =
    scoredActivities.length > 0
      ? scoredActivities[0]
      : null;

  /*
   * Average score across all quizzes/practice.
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
   * Compare the latest score with the
   * previous scored activity.
   */
  const previousQuiz =
    scoredActivities.length > 1
      ? scoredActivities[1]
      : null;

  let trendText =
    "Complete another practice activity to see your learning trend.";

  if (latestQuiz && previousQuiz) {
    const difference =
      (latestQuiz.score || 0) -
      (previousQuiz.score || 0);

    if (difference > 0) {
      trendText =
        `Your latest score improved by ${difference} percentage points.`;
    } else if (difference < 0) {
      trendText =
        `Your latest score decreased by ${Math.abs(
          difference
        )} percentage points.`;
    } else {
      trendText =
        "Your latest score is consistent with your previous performance.";
    }
  }

  /*
   * Dynamic performance classification.
   */
  const score =
    latestQuiz?.score ?? averageScore;

  const performance =
    !latestQuiz
      ? "No Quiz Data"
      : score >= 80
      ? "Strong Understanding"
      : score >= 60
      ? "Developing Understanding"
      : "Needs More Practice";

  /*
   * Dynamic recommendation.
   */
  let recommendation =
    "Start learning and complete an AI-generated practice activity so OMEGA can analyze your performance.";

  let nextAction =
    "Start an AI learning session";

  if (latestQuiz) {
    if (score >= 80) {
      recommendation =
        `You are performing strongly in ${latestQuiz.topic}. OMEGA can increase the difficulty and introduce more challenging practice.`;

      nextAction =
        "Try advanced practice questions";
    } else if (score >= 60) {
      recommendation =
        `You have a developing understanding of ${latestQuiz.topic}. OMEGA recommends more practice before moving to a higher difficulty.`;

      nextAction =
        "Continue intermediate practice";
    } else {
      recommendation =
        `Your recent performance in ${latestQuiz.topic} shows that more practice would be useful. OMEGA recommends reviewing the concept and practicing the fundamentals again.`;

      nextAction =
        "Review the lesson and practice fundamentals";
    }
  }

  /*
   * Question statistics.
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

  const totalIncorrect =
    Math.max(
      totalQuestions - totalCorrect,
      0
    );

  /*
   * Empty state.
   */
  if (history.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">

        <div className="text-center">

          <Brain
            size={50}
            className="mx-auto text-indigo-400 mb-5"
          />

          <h1 className="text-3xl font-bold">
            No Learning Data Yet
          </h1>

          <p className="text-slate-400 mt-3">
            Start learning with OMEGA to generate your personalized analysis.
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
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-10">

      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center">
              <Brain size={26} />
            </div>

            <div>

              <h1 className="text-3xl font-bold">
                Learning Analysis
              </h1>

              <p className="text-slate-400">
                OMEGA analyzes your learning activity and performance
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

        {/* Latest Activity */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">

          <Award
            size={36}
            className="mx-auto text-indigo-400"
          />

          <p className="text-slate-400 mt-4">
            Latest Learning Activity
          </p>

          <h2 className="text-3xl font-bold mt-3">
            {latestActivity?.title}
          </h2>

          <p className="text-slate-400 mt-3">
            {latestActivity?.subject}
            {" • "}
            {latestActivity?.topic}
          </p>

          {latestQuiz ? (
            <>
              <p className="text-slate-400 mt-6">
                Latest Score
              </p>

              <h2 className="text-6xl font-bold text-indigo-400 mt-2">
                {latestQuiz.score}%
              </h2>
            </>
          ) : (
            <p className="text-slate-400 mt-6">
              No scored practice activity yet.
            </p>
          )}

        </div>

        {/* Metrics */}
        <div className="grid md:grid-cols-4 gap-5 mt-6">

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

            <BookOpen
              size={26}
              className="text-indigo-400"
            />

            <p className="text-slate-400 mt-4">
              Lessons
            </p>

            <p className="text-2xl font-bold mt-1">
              {lessonActivities.length}
            </p>

          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

            <Target
              size={26}
              className="text-indigo-400"
            />

            <p className="text-slate-400 mt-4">
              Quiz Activities
            </p>

            <p className="text-2xl font-bold mt-1">
              {scoredActivities.length}
            </p>

          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

            <BarChart3
              size={26}
              className="text-indigo-400"
            />

            <p className="text-slate-400 mt-4">
              Average Score
            </p>

            <p className="text-2xl font-bold text-indigo-400 mt-1">
              {averageScore}%
            </p>

          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

            <TrendingUp
              size={26}
              className="text-indigo-400"
            />

            <p className="text-slate-400 mt-4">
              Performance
            </p>

            <p className="text-lg font-bold mt-1">
              {performance}
            </p>

          </div>

        </div>

        {/* Question Performance */}
        {totalQuestions > 0 && (

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mt-6">

            <h2 className="text-xl font-semibold">
              Question Performance
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
                  {totalIncorrect}
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

        {/* Learning Trend */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mt-6">

          <div className="flex items-center gap-3">

            <TrendingUp
              size={26}
              className="text-indigo-400"
            />

            <h2 className="text-xl font-semibold">
              Learning Trend
            </h2>

          </div>

          <p className="text-slate-300 mt-4">
            {trendText}
          </p>

          <p className="text-slate-500 text-sm mt-2">
            Based on your recorded OMEGA learning activities.
          </p>

        </div>

        {/* Recommendation */}
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 mt-6">

          <div className="flex items-center gap-3">

            <Brain
              size={26}
              className="text-indigo-400"
            />

            <h2 className="text-xl font-semibold">
              OMEGA Personalized Recommendation
            </h2>

          </div>

          <p className="text-slate-300 mt-4 leading-relaxed">
            {recommendation}
          </p>

          <div className="mt-5 p-4 bg-slate-950/50 rounded-xl">

            <p className="text-sm text-slate-400">
              Next recommended action
            </p>

            <p className="text-lg font-semibold mt-1">
              {nextAction}
            </p>

          </div>

        </div>

        {/* Buttons */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">

          <button
            onClick={() =>
              navigate("/lesson")
            }
            className="py-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 font-semibold flex items-center justify-center gap-2"
          >
            <BookOpen size={20} />
            Review Lesson
          </button>

          <button
            onClick={() =>
              navigate("/ai-practice")
            }
            className="py-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 font-semibold flex items-center justify-center gap-2"
          >
            <RotateCcw size={20} />
            Practice Again
          </button>

          <button
            onClick={() =>
              navigate("/history")
            }
            className="py-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 font-semibold flex items-center justify-center gap-2"
          >
            <TrendingUp size={20} />
            Learning History
          </button>

        </div>

      </div>

    </div>
  );
}

export default Analyze;


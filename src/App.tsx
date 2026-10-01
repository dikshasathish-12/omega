import { useEffect, useState, type ReactNode } from "react";
import { getLearningHistory } from "./utils/learningHistory";

import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

import {
  Brain,
  BookOpen,
  Target,
  TrendingUp,
  ArrowRight,
  BarChart3,
  User,
} from "lucide-react";

import Learn from "./pages/Learn";
import Lesson from "./pages/Lesson";
import Practice from "./pages/Practice";
import Analyze from "./pages/Analyze";
import AskOmega from "./pages/AskOmega";
import AIPractice from "./pages/AIPractice";
import LearningHistory from "./pages/LearningHistory";
import Profile from "./pages/Profile";

type QuizResult = {
  topic: string;
  score: number;
};

type QuizAttempt = {
  topic: string;
  score: number;
  date: string;
};

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

function StatCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
          {icon}
        </div>

        <div>
          <p className="text-slate-400 text-sm">
            {title}
          </p>

          <p className="text-2xl font-bold mt-1">
            {value}
          </p>
        </div>
      </div>

      <p className="text-slate-500 text-sm mt-4">
        {subtitle}
      </p>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();

  const [quizResult, setQuizResult] =
    useState<QuizResult | null>(null);

  const [attempts, setAttempts] =
    useState<QuizAttempt[]>([]);

  const [studentName, setStudentName] =
    useState("Student");

  const [learningHistory, setLearningHistory] =
    useState<LearningActivity[]>(() =>
      getLearningHistory() as LearningActivity[]
    );

  useEffect(() => {
    const loadDashboardData = () => {
      // Load latest quiz result
      const savedResult =
        localStorage.getItem("lastQuizResult");

      if (savedResult) {
        try {
          const data = JSON.parse(savedResult);

          if (
            data &&
            typeof data.topic === "string" &&
            typeof data.score === "number"
          ) {
            setQuizResult({
              topic: data.topic,
              score: data.score,
            });
          }
        } catch (error) {
          console.error(
            "Could not load quiz result:",
            error
          );
        }
      }

      // Load quiz attempts
      const savedAttempts =
        localStorage.getItem("quizAttempts");

      if (savedAttempts) {
        try {
          const data = JSON.parse(savedAttempts);

          if (Array.isArray(data)) {
            setAttempts(data);
          }
        } catch (error) {
          console.error(
            "Could not load quiz attempts:",
            error
          );
        }
      }

      // Load student profile
      const savedProfile =
        localStorage.getItem("studentProfile");

      if (savedProfile) {
        try {
          const profile =
            JSON.parse(savedProfile);

          if (profile?.name) {
            setStudentName(profile.name);
          }
        } catch (error) {
          console.error(
            "Could not load student profile:",
            error
          );
        }
      }

      // Load dynamic learning history
      setLearningHistory(
        getLearningHistory() as LearningActivity[]
      );
    };

    loadDashboardData();

    window.addEventListener(
      "omegaHistoryUpdated",
      loadDashboardData
    );

    window.addEventListener(
      "focus",
      loadDashboardData
    );

    return () => {
      window.removeEventListener(
        "omegaHistoryUpdated",
        loadDashboardData
      );

      window.removeEventListener(
        "focus",
        loadDashboardData
      );
    };
  }, []);

  /*
   * Dynamic lesson count.
   *
   * OMEGA does NOT use a fixed topic such as
   * "Quadratic Equations".
   *
   * Every completed lesson is read from
   * omegaLearningHistory.
   */
  const completedLessons =
    learningHistory.filter(
      (activity) =>
        activity.type === "lesson"
    ).length;

  /*
   * Each completed lesson contributes 25%
   * until the lesson progress reaches 100%.
   */
  const lessonProgress =
    completedLessons > 0
      ? Math.min(
          completedLessons * 25,
          100
        )
      : 0;

  /*
   * Overall progress combines lesson progress
   * and the latest quiz score.
   */
  const overallProgress =
    quizResult
      ? Math.round(
          (lessonProgress +
            quizResult.score) /
            2
        )
      : lessonProgress;

  /*
   * Find the most recent learning activity.
   */
  const latestActivity =
    learningHistory.length > 0
      ? learningHistory[0]
      : null;

  /*
   * Learning trend.
   */
  const improvementText =
    attempts.length >= 2
      ? attempts[
          attempts.length - 1
        ].score >
        attempts[
          attempts.length - 2
        ].score
        ? "Your score is improving."
        : attempts[
            attempts.length - 1
          ].score <
          attempts[
            attempts.length - 2
          ].score
        ? "Your recent score has decreased. More practice may help."
        : "Your recent scores are consistent."
      : "Complete another quiz to see your learning trend.";

  /*
   * Adaptive practice button.
   */
  const practiceButtonText =
    quizResult &&
    quizResult.score < 60
      ? "Review & Practice"
      : quizResult &&
        quizResult.score >= 80
      ? "Try Harder Practice"
      : "Practice Now";

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">
            <Brain size={22} />
          </div>

          <span className="text-2xl font-bold">
            OMEGA
          </span>

        </div>

        <div className="flex items-center gap-4">

          <span className="hidden md:block text-slate-300">
            Welcome, {studentName}
          </span>

          <button
            onClick={() =>
              navigate("/profile")
            }
            className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold hover:bg-indigo-600"
          >
            {studentName
              .charAt(0)
              .toUpperCase()}
          </button>

        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-10">

        {/* Welcome */}
        <div className="mb-10">

          <p className="text-indigo-400 font-medium">
            Your adaptive learning journey
          </p>

          <h1 className="text-4xl font-bold mt-2">
            What do you want to learn today?
          </h1>

          <p className="text-slate-400 mt-3">
            OMEGA learns from your performance and adapts your learning path.
          </p>

        </div>

        {/* Stats */}
        <section className="grid md:grid-cols-4 gap-5 mb-10">

          <StatCard
            icon={<BookOpen size={22} />}
            title="Lessons"
            value={completedLessons.toString()}
            subtitle="Completed"
          />

          <StatCard
            icon={<Target size={22} />}
            title="Practice"
            value={
              quizResult
                ? `${quizResult.score}%`
                : "0%"
            }
            subtitle="Latest accuracy"
          />

          <StatCard
            icon={<TrendingUp size={22} />}
            title="Progress"
            value={`${overallProgress}%`}
            subtitle="Overall"
          />

          <StatCard
            icon={<Brain size={22} />}
            title="Learning Mode"
            value={
              !quizResult
                ? "Start"
                : quizResult.score >= 80
                ? "Advanced"
                : quizResult.score >= 60
                ? "Practice"
                : "Review"
            }
            subtitle="Adaptive"
          />

        </section>

        {/* Latest Learning Activity */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">

          <h2 className="text-xl font-semibold">
            Latest Learning Activity
          </h2>

          {latestActivity ? (

            <div className="mt-4">

              <p className="text-slate-400">
                Subject
              </p>

              <p className="text-lg font-semibold mt-1">
                {latestActivity.subject}
              </p>

              <p className="text-slate-400 mt-4">
                Topic
              </p>

              <p className="text-lg font-semibold mt-1">
                {latestActivity.topic}
              </p>

              <p className="text-slate-400 mt-4">
                Activity
              </p>

              <p className="text-indigo-400 font-semibold mt-1">
                {latestActivity.title}
              </p>

              {latestActivity.score !== undefined && (
                <>
                  <p className="text-slate-400 mt-4">
                    Score
                  </p>

                  <p className="text-4xl font-bold text-indigo-400 mt-1">
                    {latestActivity.score}%
                  </p>
                </>
              )}

            </div>

          ) : quizResult ? (

            <div className="mt-4">

              <p className="text-slate-400">
                Topic
              </p>

              <p className="text-lg font-semibold mt-1">
                {quizResult.topic}
              </p>

              <p className="text-slate-400 mt-4">
                Latest Score
              </p>

              <p className="text-4xl font-bold text-indigo-400 mt-1">
                {quizResult.score}%
              </p>

            </div>

          ) : (

            <p className="text-slate-400 mt-4">
              Start learning with OMEGA to see your learning activity here.
            </p>

          )}

        </div>

        {/* Learning Trend */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">

          <div className="flex items-center gap-3">

            <TrendingUp
              size={24}
              className="text-indigo-400"
            />

            <h2 className="text-xl font-semibold">
              Learning Trend
            </h2>

          </div>

          <p className="text-slate-300 mt-3">
            {improvementText}
          </p>

          <p className="text-slate-500 text-sm mt-2">
            {attempts.length} quiz attempt
            {attempts.length === 1
              ? ""
              : "s"} recorded
          </p>

        </div>

        {/* Recommendation */}
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 mb-10">

          <div className="flex items-center gap-3">

            <Brain
              size={24}
              className="text-indigo-400"
            />

            <h2 className="text-xl font-semibold">
              OMEGA Recommendation
            </h2>

          </div>

          <p className="text-slate-300 mt-3 leading-relaxed">

            {!quizResult
              ? latestActivity
                ? `OMEGA is ready to continue your learning journey from ${latestActivity.topic}.`
                : "Complete your first AI practice quiz and OMEGA will personalize your learning path."
              : quizResult.score >= 80
              ? `Excellent progress in ${quizResult.topic}. OMEGA recommends challenging practice.`
              : quizResult.score >= 60
              ? `You have a good foundation in ${quizResult.topic}. OMEGA recommends intermediate practice.`
              : `Your ${quizResult.topic} score shows that you need more practice. OMEGA recommends reviewing the lesson.`}

          </p>

          {quizResult && (

            <button
              onClick={() =>
                navigate(
                  quizResult.score < 60
                    ? "/lesson"
                    : "/ai-practice"
                )
              }
              className="mt-5 px-5 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 transition font-semibold flex items-center gap-2"
            >

              {quizResult.score < 60
                ? "Review Lesson"
                : "Practice Again"}

              <ArrowRight size={18} />

            </button>

          )}

        </div>

        {/* Learn + Practice */}
        <div className="grid md:grid-cols-2 gap-6">

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">

              <BookOpen size={25} />

            </div>

            <h2 className="text-2xl font-semibold mt-5">
              Learn
            </h2>

            <p className="text-slate-400 mt-2">
              Explore lessons and understand concepts with simple explanations.
            </p>

            <button
              onClick={() =>
                navigate("/learn")
              }
              className="mt-6 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 transition flex items-center gap-2 font-semibold"
            >

              Start Learning

              <ArrowRight size={18} />

            </button>

          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">

              <Target size={25} />

            </div>

            <h2 className="text-2xl font-semibold mt-5">
              Practice
            </h2>

            <p className="text-slate-400 mt-2">
              Practice with AI-generated questions that adapt to your performance.
            </p>

            <button
              onClick={() =>
                navigate("/ai-practice")
              }
              className="mt-6 px-5 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 transition flex items-center gap-2 font-semibold"
            >

              {practiceButtonText}

              <ArrowRight size={18} />

            </button>

          </div>

        </div>

        {/* Navigation buttons */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">

          <button
            onClick={() =>
              navigate("/profile")
            }
            className="py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-semibold flex items-center justify-center gap-2"
          >
            <User size={20} />
            My Profile
          </button>

          <button
            onClick={() =>
              navigate("/analyze")
            }
            className="py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-semibold flex items-center justify-center gap-2"
          >
            <TrendingUp size={20} />
            Learning Analysis
          </button>

          <button
            onClick={() =>
              navigate("/history")
            }
            className="py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-semibold flex items-center justify-center gap-2"
          >
            <BarChart3 size={20} />
            Learning History
          </button>

        </div>

        {/* Ask OMEGA */}
        <button
          onClick={() =>
            navigate("/ask")
          }
          className="w-full mt-4 py-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 font-semibold flex items-center justify-center gap-2"
        >

          <Brain size={20} />

          Ask OMEGA

          <ArrowRight size={18} />

        </button>

      </main>

    </div>
  );
}

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/learn"
          element={<Learn />}
        />

        <Route
          path="/lesson"
          element={<Lesson />}
        />

        <Route
          path="/practice"
          element={<Practice />}
        />

        <Route
          path="/analyze"
          element={<Analyze />}
        />

        <Route
          path="/ask"
          element={<AskOmega />}
        />

        <Route
          path="/ai-practice"
          element={<AIPractice />}
        />

        <Route
          path="/history"
          element={<LearningHistory />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;
import { API_URL } from "../config";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Brain,
  CheckCircle,
  Loader2,
  RotateCcw,
  Trophy,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { addLearningActivity } from "../utils/learningHistory";

type StudentProfile = {
  name: string;
  grade: string;
  subjects: string[];
  selectedSubject: string;
};

type Question = {
  question: string;
  options: string[];
  answer: string;
};

function AIPractice() {
  const navigate = useNavigate();

  const [profile, setProfile] =
    useState<StudentProfile | null>(null);

  const [topic, setTopic] =
    useState("");

  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState("");

  const [answers, setAnswers] =
    useState<string[]>([]);

  const [score, setScore] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const savedProfile =
      localStorage.getItem("studentProfile");

    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error(
          "Error loading profile:",
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
  }, []);

  const generateQuiz = async () => {
    if (!profile) {
      setError(
        "Student profile could not be loaded."
      );
      return;
    }

    if (!topic.trim()) {
      setError(
        "Please enter a topic to generate the quiz."
      );
      return;
    }

    setLoading(true);
    setError("");
    setQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setAnswers([]);
    setScore(null);

    try {
      const previousScore =
        localStorage.getItem(
          `previousScore_${topic}`
        );

      const response = await fetch(
        `${API_URL}/api/generate-quiz`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            grade: profile.grade,
            subject:
              profile.selectedSubject ||
              "General",
            topic: topic.trim(),
            level: "Beginner",
            previousScore:
              previousScore || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to generate quiz."
        );
      }

      if (
        !data.quiz ||
        !Array.isArray(data.quiz) ||
        data.quiz.length === 0
      ) {
        throw new Error(
          data.error ||
            "No questions were generated."
        );
      }

      const validQuestions =
        data.quiz.filter(
          (question: Question) =>
            question &&
            typeof question.question ===
              "string" &&
            Array.isArray(question.options) &&
            question.options.length >= 2 &&
            typeof question.answer ===
              "string"
        );

      if (validQuestions.length === 0) {
        throw new Error(
          "The AI returned invalid quiz questions."
        );
      }

      setQuestions(validQuestions);
    } catch (error) {
      console.error(
        "Generate quiz error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to generate quiz."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (
    answer: string
  ) => {
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    if (!selectedAnswer) {
      return;
    }

    const updatedAnswers = [
      ...answers,
      selectedAnswer,
    ];

    setAnswers(updatedAnswers);

    if (
      currentQuestion <
      questions.length - 1
    ) {
      setCurrentQuestion(
        currentQuestion + 1
      );
      setSelectedAnswer("");
    } else {
      finishQuiz(updatedAnswers);
    }
  };

  const finishQuiz = (
    finalAnswers: string[]
  ) => {
    let correct = 0;

    questions.forEach(
      (question, index) => {
        if (
          finalAnswers[index] ===
          question.answer
        ) {
          correct++;
        }
      }
    );

    const finalScore = Math.round(
      (correct / questions.length) * 100
    );

    setScore(finalScore);

    localStorage.setItem(
      `previousScore_${topic}`,
      finalScore.toString()
    );

    localStorage.setItem(
      "lastQuizResult",
      JSON.stringify({
        topic,
        score: finalScore,
        correct,
        total: questions.length,
      })
    );

    const savedAttempts =
      localStorage.getItem(
        "quizAttempts"
      );

    let attempts = [];

    if (savedAttempts) {
      try {
        attempts =
          JSON.parse(savedAttempts);
      } catch {
        attempts = [];
      }
    }

    attempts.push({
      topic,
      score: finalScore,
      correct,
      total: questions.length,
      timestamp:
        new Date().toISOString(),
    });

    localStorage.setItem(
      "quizAttempts",
      JSON.stringify(attempts)
    );

    addLearningActivity({
      type: "quiz",
      subject:
        profile?.selectedSubject ||
        "General",
      topic,
      title: `AI Quiz: ${topic}`,
      score: finalScore,
      questions: questions.length,
      correct,
    });
  };

  const restartQuiz = () => {
    setQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setAnswers([]);
    setScore(null);
    setError("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="text-center">

          <Loader2
            size={46}
            className="animate-spin text-indigo-400 mx-auto"
          />

          <h1 className="text-2xl font-bold mt-6">
            OMEGA is generating your AI quiz...
          </h1>

          <p className="text-slate-400 mt-3">
            Creating questions for {topic}.
          </p>

        </div>
      </div>
    );
  }

  if (score !== null) {
    const correct =
      answers.filter(
        (answer, index) =>
          answer ===
          questions[index]?.answer
      ).length;

    return (
      <div className="min-h-screen bg-slate-950 text-white">

        <nav className="border-b border-white/10 px-6 py-5">
          <div className="max-w-5xl mx-auto flex items-center justify-between">

            <button
              onClick={() =>
                navigate("/dashboard")
              }
              className="flex items-center gap-2 text-slate-300 hover:text-white transition"
            >
              <ArrowLeft size={20} />
              Dashboard
            </button>

            <div className="flex items-center gap-2">
              <Brain
                size={23}
                className="text-indigo-400"
              />

              <span className="font-bold">
                OMEGA
              </span>
            </div>

          </div>
        </nav>

        <main className="max-w-3xl mx-auto px-6 py-12">

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center">

            <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto">
              <Trophy
                size={40}
                className="text-indigo-400"
              />
            </div>

            <h1 className="text-3xl font-bold mt-6">
              Quiz Completed
            </h1>

            <p className="text-slate-400 mt-2">
              {topic}
            </p>

            <div className="text-6xl font-bold text-indigo-400 mt-8">
              {score}%
            </div>

            <p className="text-slate-300 mt-4">
              You answered {correct} out of{" "}
              {questions.length} questions
              correctly.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">

              <div className="bg-white/5 rounded-2xl p-5">
                <p className="text-slate-400">
                  Correct
                </p>

                <p className="text-3xl font-bold text-emerald-400 mt-2">
                  {correct}
                </p>
              </div>

              <div className="bg-white/5 rounded-2xl p-5">
                <p className="text-slate-400">
                  Total
                </p>

                <p className="text-3xl font-bold mt-2">
                  {questions.length}
                </p>
              </div>

            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">

              <button
                onClick={restartQuiz}
                className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 transition font-semibold flex items-center justify-center gap-2"
              >
                <RotateCcw size={19} />
                Try Again
              </button>

              <button
                onClick={() =>
                  navigate("/dashboard")
                }
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 transition font-semibold"
              >
                Back to Dashboard
              </button>

            </div>

          </div>

        </main>
      </div>
    );
  }

  if (questions.length > 0) {
    const question =
      questions[currentQuestion];

    const progress =
      ((currentQuestion + 1) /
        questions.length) *
      100;

    return (
      <div className="min-h-screen bg-slate-950 text-white">

        <nav className="border-b border-white/10 px-6 py-5">
          <div className="max-w-4xl mx-auto flex items-center justify-between">

            <button
              onClick={() =>
                navigate("/dashboard")
              }
              className="flex items-center gap-2 text-slate-300 hover:text-white transition"
            >
              <ArrowLeft size={20} />
              Exit Quiz
            </button>

            <div className="flex items-center gap-2">
              <Brain
                size={22}
                className="text-indigo-400"
              />

              <span className="font-bold">
                OMEGA
              </span>
            </div>

          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-6 py-10">

          <div className="flex items-center justify-between mb-4">

            <div>
              <p className="text-indigo-400 font-medium">
                AI Practice
              </p>

              <h1 className="text-2xl font-bold mt-1">
                {topic}
              </h1>
            </div>

            <p className="text-slate-400">
              Question{" "}
              {currentQuestion + 1} of{" "}
              {questions.length}
            </p>

          </div>

          <div className="w-full h-2 bg-white/10 rounded-full mb-8 overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-7 md:p-9">

            <div className="flex items-center gap-3 mb-6">

              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <Brain
                  size={21}
                  className="text-indigo-400"
                />
              </div>

              <span className="text-slate-400">
                AI Generated Question
              </span>

            </div>

            <h2 className="text-2xl md:text-3xl font-semibold leading-relaxed">
              {question.question}
            </h2>

            <div className="mt-8 space-y-4">

              {question.options.map(
                (option, index) => {

                  const isSelected =
                    selectedAnswer ===
                    option;

                  return (
                    <button
                      key={index}
                      onClick={() =>
                        handleAnswer(
                          option
                        )
                      }
                      className={`w-full text-left p-5 rounded-2xl border transition flex items-center gap-4 ${
                        isSelected
                          ? "bg-indigo-500/20 border-indigo-400"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >

                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-semibold ${
                          isSelected
                            ? "bg-indigo-500 text-white"
                            : "bg-white/10 text-slate-300"
                        }`}
                      >
                        {String.fromCharCode(
                          65 + index
                        )}
                      </div>

                      <span className="text-slate-200">
                        {option}
                      </span>

                      {isSelected && (
                        <CheckCircle
                          size={21}
                          className="ml-auto text-indigo-400"
                        />
                      )}

                    </button>
                  );
                }
              )}

            </div>

            <button
              onClick={handleNext}
              disabled={!selectedAnswer}
              className={`w-full mt-8 py-4 rounded-xl font-semibold transition ${
                selectedAnswer
                  ? "bg-indigo-500 hover:bg-indigo-600"
                  : "bg-white/10 text-slate-500 cursor-not-allowed"
              }`}
            >
              {currentQuestion ===
              questions.length - 1
                ? "Finish Quiz"
                : "Next Question"}
            </button>

          </div>

        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <nav className="border-b border-white/10 px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="flex items-center gap-2 text-slate-300 hover:text-white transition"
          >
            <ArrowLeft size={20} />
            Dashboard
          </button>

          <div className="flex items-center gap-2">
            <Brain
              size={23}
              className="text-indigo-400"
            />

            <span className="font-bold">
              OMEGA
            </span>
          </div>

        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">

        <div className="text-center mb-10">

          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mx-auto">
            <Brain
              size={32}
              className="text-indigo-400"
            />
          </div>

          <h1 className="text-4xl font-bold mt-6">
            AI Practice
          </h1>

          <p className="text-slate-400 mt-3">
            OMEGA will generate a quiz dynamically
            based on your topic and level.
          </p>

        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-7">

          <label className="block text-sm font-medium text-slate-300 mb-3">
            Topic
          </label>

          <input
            type="text"
            value={topic}
            onChange={(event) =>
              setTopic(event.target.value)
            }
            placeholder="Enter a topic, for example: Linked Lists"
            className="w-full px-5 py-4 rounded-xl bg-slate-900 border border-white/10 text-white placeholder:text-slate-600 outline-none focus:border-indigo-500"
          />

          {profile && (
            <div className="mt-5 p-4 rounded-xl bg-white/5 border border-white/10">

              <p className="text-slate-400 text-sm">
                Subject
              </p>

              <p className="text-white font-medium mt-1">
                {profile.selectedSubject ||
                  "General"}
              </p>

              <p className="text-slate-400 text-sm mt-3">
                Grade
              </p>

              <p className="text-white font-medium mt-1">
                {profile.grade}
              </p>

            </div>
          )}

          {error && (
            <div className="mt-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20">

              <p className="text-red-400">
                {error}
              </p>

            </div>
          )}

          <button
            onClick={generateQuiz}
            disabled={!topic.trim()}
            className={`w-full mt-6 py-4 rounded-xl font-semibold transition ${
              topic.trim()
                ? "bg-indigo-500 hover:bg-indigo-600"
                : "bg-white/10 text-slate-500 cursor-not-allowed"
            }`}
          >
            Generate AI Quiz
          </button>

        </div>

      </main>
    </div>
  );
}

export default AIPractice;
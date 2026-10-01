import { ArrowLeft, Brain, CheckCircle, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Practice() {
  const navigate = useNavigate();

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const correctAnswer = "2";

  const submitAnswer = () => {
    if (!selectedAnswer) return;

    setSubmitted(true);

    const isCorrect = selectedAnswer === correctAnswer;

    localStorage.setItem(
      "lastQuizResult",
      JSON.stringify({
        topic: "Quadratic Equations",
        correct: isCorrect,
        score: isCorrect ? 100 : 0,
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <nav className="flex items-center gap-4 px-8 py-5 border-b border-white/10">
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-lg hover:bg-white/10"
        >
          <ArrowLeft size={22} />
        </button>

        <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">
          <Brain size={22} />
        </div>

        <span className="text-2xl font-bold">OMEGA Practice</span>
      </nav>

      <main className="max-w-3xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <Target className="mx-auto text-indigo-400" size={38} />

          <p className="text-indigo-400 font-medium mt-4">
            PRACTICE
          </p>

          <h1 className="text-4xl font-bold mt-2">
            Quadratic Equations
          </h1>

          <p className="text-slate-400 mt-3">
            Let's check what you understand.
          </p>
        </div>

        {/* Question */}
        <section className="p-8 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-sm text-slate-400 mb-3">
            Question 1 of 1
          </p>

          <h2 className="text-2xl font-semibold leading-relaxed">
            What is the highest power of the variable in a quadratic equation?
          </h2>

          <div className="mt-7 space-y-3">
            {[
              { value: "1", text: "1" },
              { value: "2", text: "2" },
              { value: "3", text: "3" },
              { value: "4", text: "4" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => !submitted && setSelectedAnswer(option.value)}
                className={`w-full p-4 rounded-xl border text-left transition ${
                  selectedAnswer === option.value
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-white/10 bg-slate-900 hover:border-indigo-500/40"
                }`}
              >
                <span className="font-medium">{option.text}</span>
              </button>
            ))}
          </div>

          {!submitted ? (
            <button
              onClick={submitAnswer}
              disabled={!selectedAnswer}
              className="w-full mt-7 py-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition"
            >
              Submit Answer
            </button>
          ) : (
            <div className="mt-7">
              {selectedAnswer === correctAnswer ? (
                <div className="p-5 rounded-xl bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-3 text-green-400">
                    <CheckCircle size={23} />
                    <span className="font-bold">
                      Correct! 🎉
                    </span>
                  </div>

                  <p className="text-slate-300 mt-3">
                    A quadratic equation has a highest variable power of 2.
                  </p>
                </div>
              ) : (
                <div className="p-5 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-red-400 font-bold">
                    Not quite.
                  </p>

                  <p className="text-slate-300 mt-3">
                    The correct answer is 2 because a quadratic equation
                    contains x² as its highest power.
                  </p>
                </div>
              )}

              <button
                onClick={() => navigate("/")}
                className="w-full mt-5 py-4 rounded-xl bg-white/10 hover:bg-white/15 font-semibold transition"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Practice;
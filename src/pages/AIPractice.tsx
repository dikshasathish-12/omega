import { API_URL } from "../config";
import { useEffect, useState } from "react";
import { ArrowLeft, Brain, Loader2 } from "lucide-react";
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

  const [topic, setTopic] = useState("");

  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [quizStarted, setQuizStarted] =
    useState(false);

  const [score, setScore] =
    useState(0);

  const [finished, setFinished] =
    useState(false);

  // LOAD PROFILE
  useEffect(() => {
    const savedProfile =
      localStorage.getItem("studentProfile");

    if (savedProfile) {
      try {
        const data = JSON.parse(savedProfile);

        setProfile(data);
      } catch (error) {
        console.error(
          "Unable to load profile:",
          error
        );
      }
    }
  }, []);

  // GENERATE QUIZ
  const generateQuiz = async () => {
    if (!profile) {
      alert(
        "Please select your Grade and Subject in Profile first."
      );

      navigate("/profile");

      return;
    }

    if (!profile.selectedSubject) {
      alert(
        "Please select a subject in Profile first."
      );

      navigate("/profile");

      return;
    }

    if (!topic.trim()) {
      alert("Please enter a topic.");

      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/generate-quiz`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            grade: profile.grade,

            subject:
              profile.selectedSubject,

            topic: topic.trim(),

            level: "Beginner",

            previousScore: undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to generate quiz"
        );
      }

      if (
        !data.questions ||
        !Array.isArray(data.questions) ||
        data.questions.length === 0
      ) {
        throw new Error(
          "No questions were generated."
        );
      }

      setQuestions(data.questions);

      setCurrentQuestion(0);

      setSelectedAnswer("");

      setScore(0);

      setQuizStarted(true);

      setFinished(false);
    } catch (error) {
      console.error(error);

      alert(
        "Could not generate quiz. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // SELECT ANSWER
  const selectAnswer = (
    answer: string
  ) => {
    setSelectedAnswer(answer);
  };

  // NEXT QUESTION
  const nextQuestion = () => {
    if (!selectedAnswer) {
      alert("Please select an answer.");

      return;
    }

    const isCorrect =
      selectedAnswer ===
      questions[currentQuestion].answer;

    const newScore =
      score + (isCorrect ? 1 : 0);

    setScore(newScore);

    // MORE QUESTIONS
    if (
      currentQuestion <
      questions.length - 1
    ) {
      setCurrentQuestion(
        (previous) => previous + 1
      );

      setSelectedAnswer("");

      return;
    }

    // QUIZ FINISHED
    const finalScore = Math.round(
      (newScore / questions.length) *
        100
    );

    // SAVE TO OMEGA LEARNING HISTORY
    addLearningActivity({
      type: "quiz",

      subject:
        profile?.selectedSubject ||
        "General",

      topic:
        topic.trim() ||
        "General Learning",

      title:
        `AI Practice: ${
          topic.trim() ||
          "General Learning"
        }`,

      score: finalScore,

      questions:
        questions.length,

      correct: newScore,
    });

    // SAVE LAST QUIZ RESULT
    localStorage.setItem(
      "lastQuizResult",
      JSON.stringify({
        topic:
          topic.trim() ||
          "General Learning",

        score: finalScore,

        correct: newScore,

        total: questions.length,

        date: new Date().toISOString(),
      })
    );

    setFinished(true);
  };

  // PROFILE NOT FOUND
  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="text-center">

          <Brain
            size={60}
            className="mx-auto text-indigo-400 mb-5"
          />

          <h1 className="text-2xl font-bold">
            Profile Required
          </h1>

          <p className="text-slate-400 mt-2">
            Please select your Grade and Subject.
          </p>

          <button
            onClick={() =>
              navigate("/profile")
            }
            className="mt-6 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 font-semibold"
          >
            Go to Profile
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-10">

      <div className="max-w-4xl mx-auto">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-8">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center">
              <Brain size={26} />
            </div>

            <div>

              <h1 className="text-3xl font-bold">
                AI Practice
              </h1>

              <p className="text-slate-400">
                Personalized practice with OMEGA AI
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

        {/* GRADE AND SUBJECT */}

        {!quizStarted &&
          !finished && (

            <div className="grid md:grid-cols-2 gap-4 mb-6">

              {/* GRADE */}

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

                <p className="text-sm text-slate-400">
                  Your Grade
                </p>

                <p className="text-2xl font-bold text-indigo-400 mt-2">
                  {profile.grade}
                </p>

              </div>

              {/* SUBJECT */}

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

                <p className="text-sm text-slate-400">
                  Your Selected Subject
                </p>

                <p className="text-2xl font-bold text-emerald-400 mt-2">
                  {profile.selectedSubject}
                </p>

              </div>

            </div>

          )}

        {/* TOPIC INPUT */}

        {!quizStarted &&
          !finished && (

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

              <h2 className="text-xl font-semibold">
                Choose a Topic
              </h2>

              <p className="text-slate-400 mt-2">
                OMEGA will create questions for your selected subject.
              </p>

              <input
                type="text"
                value={topic}
                onChange={(event) =>
                  setTopic(
                    event.target.value
                  )
                }
                placeholder={`Enter a ${profile.selectedSubject} topic`}
                className="w-full mt-6 px-4 py-4 rounded-xl bg-slate-900 border border-white/10 text-white outline-none focus:border-indigo-500"
              />

              <button
                onClick={generateQuiz}
                disabled={loading}
                className="w-full mt-5 py-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
              >

                {loading ? (
                  <>
                    <Loader2
                      size={20}
                      className="animate-spin"
                    />

                    Generating Quiz...
                  </>
                ) : (
                  <>
                    <Brain size={20} />

                    Generate AI Quiz
                  </>
                )}

              </button>

              <button
                onClick={() =>
                  navigate("/profile")
                }
                className="w-full mt-3 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
              >
                Change Grade or Subject
              </button>

            </div>

          )}

        {/* QUIZ */}

        {quizStarted &&
          !finished &&
          questions.length > 0 && (

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

              <div className="mb-6">

                <p className="text-indigo-400 font-medium">
                  {profile.grade} •{" "}
                  {profile.selectedSubject}
                </p>

                <p className="text-slate-400 mt-1">
                  Question{" "}
                  {currentQuestion + 1}{" "}
                  of{" "}
                  {questions.length}
                </p>

              </div>

              <h2 className="text-2xl font-semibold">
                {
                  questions[
                    currentQuestion
                  ].question
                }
              </h2>

              <div className="space-y-3 mt-6">

                {questions[
                  currentQuestion
                ].options.map(
                  (option) => (

                    <button
                      key={option}
                      onClick={() =>
                        selectAnswer(
                          option
                        )
                      }
                      className={`w-full text-left p-4 rounded-xl border ${
                        selectedAnswer ===
                        option
                          ? "bg-indigo-500/20 border-indigo-500"
                          : "bg-slate-900 border-white/10 hover:border-indigo-400"
                      }`}
                    >
                      {option}
                    </button>

                  )
                )}

              </div>

              <button
                onClick={nextQuestion}
                className="w-full mt-6 py-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 font-semibold"
              >
                {currentQuestion ===
                questions.length - 1
                  ? "Finish Quiz"
                  : "Next Question"}
              </button>

            </div>

          )}

        {/* RESULT */}

        {finished && (

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">

            <h2 className="text-3xl font-bold">
              Quiz Completed!
            </h2>

            <p className="text-slate-400 mt-3">
              {profile.grade} •{" "}
              {profile.selectedSubject}
            </p>

            <div className="text-6xl font-bold text-indigo-400 mt-8">
              {Math.round(
                (score /
                  questions.length) *
                  100
              )}
              %
            </div>

            <p className="text-slate-400 mt-4">
              {score} of{" "}
              {questions.length} questions correct
            </p>

            <button
              onClick={() => {
                setQuizStarted(false);
                setFinished(false);
                setQuestions([]);
                setCurrentQuestion(0);
                setSelectedAnswer("");
                setScore(0);
              }}
              className="mt-8 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 font-semibold"
            >
              Practice Again
            </button>

          </div>

        )}

      </div>

    </div>
  );
}

export default AIPractice;
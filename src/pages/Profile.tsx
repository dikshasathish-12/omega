import { useEffect, useState } from "react";
import {
  ArrowLeft,
  User,
  GraduationCap,
  Save,
  Check,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const gradeSubjects: Record<string, string[]> = {
  "Grade 6": [
    "Mathematics",
    "Science",
    "English",
    "Social Science",
    "Computer Science",
    "Hindi",
  ],

  "Grade 7": [
    "Mathematics",
    "Science",
    "English",
    "Social Science",
    "Computer Science",
    "Hindi",
  ],

  "Grade 8": [
    "Mathematics",
    "Science",
    "English",
    "Social Science",
    "Computer Science",
    "Hindi",
  ],

  "Grade 9": [
    "Mathematics",
    "Science",
    "English",
    "Social Science",
    "Computer Applications",
    "Hindi",
  ],

  "Grade 10": [
    "Mathematics",
    "Science",
    "English",
    "Social Science",
    "Computer Applications",
    "Hindi",
  ],

  "Grade 11": [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "English",
    "Economics",
    "Accountancy",
    "Business Studies",
  ],

  "Grade 12": [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "English",
    "Economics",
    "Accountancy",
    "Business Studies",
  ],
};

type StudentProfile = {
  name: string;
  grade: string;
  subjects: string[];
  selectedSubject: string;
};

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<StudentProfile>({
    name: "",
    grade: "Grade 6",
    subjects: gradeSubjects["Grade 6"],
    selectedSubject: "Mathematics",
  });

  const [saved, setSaved] = useState(false);

  // Load saved profile
  useEffect(() => {
    const savedProfile = localStorage.getItem("studentProfile");

    if (!savedProfile) {
      return;
    }

    try {
      const data = JSON.parse(savedProfile);

      const grade =
        data.grade && gradeSubjects[data.grade]
          ? data.grade
          : "Grade 6";

      const subjects = gradeSubjects[grade];

      const selectedSubject =
        data.selectedSubject &&
        subjects.includes(data.selectedSubject)
          ? data.selectedSubject
          : subjects[0];

      setProfile({
        name: data.name || "",
        grade,
        subjects,
        selectedSubject,
      });
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  }, []);

  // Change grade
  const handleGradeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newGrade = event.target.value;

    const newSubjects = gradeSubjects[newGrade];

    setProfile((previous) => ({
      ...previous,
      grade: newGrade,
      subjects: newSubjects,
      selectedSubject: newSubjects[0],
    }));

    setSaved(false);
  };

  // Select subject
  const handleSubjectSelect = (subject: string) => {
    setProfile((previous) => ({
      ...previous,
      selectedSubject: subject,
    }));

    setSaved(false);
  };

  // Save profile
  const handleSave = () => {
    const profileToSave = {
      name: profile.name,
      grade: profile.grade,
      subjects: profile.subjects,
      selectedSubject: profile.selectedSubject,
    };

    localStorage.setItem(
      "studentProfile",
      JSON.stringify(profileToSave)
    );

    setProfile(profileToSave);
    setSaved(true);
  };

  // Delete profile
  const handleDeleteProfile = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your profile? This will also delete your learning history, quiz results, and completed lessons."
    );

    if (!confirmed) {
      return;
    }

    // Delete profile
    localStorage.removeItem("studentProfile");

    // Delete learning history
    localStorage.removeItem("omegaLearningHistory");

    // Delete quiz-related data
    localStorage.removeItem("lastQuizResult");
    localStorage.removeItem("quizAttempts");

    // Delete learning selections
    localStorage.removeItem("selectedLearningSubject");
    localStorage.removeItem("selectedLearningTopic");

    // Delete other known progress data
    localStorage.removeItem("quadraticEquationsCompleted");

    // Delete completed lesson records
    Object.keys(localStorage).forEach((key) => {
      if (
        key.startsWith("lessonCompleted_") ||
        key.startsWith("topicCompleted_")
      ) {
        localStorage.removeItem(key);
      }
    });

    // Reset profile state
    setProfile({
      name: "",
      grade: "Grade 6",
      subjects: gradeSubjects["Grade 6"],
      selectedSubject: "Mathematics",
    });

    setSaved(false);

    // Go back to dashboard
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center">
              <User size={26} />
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                Student Profile
              </h1>

              <p className="text-slate-400">
                Personalize your OMEGA learning experience
              </p>
            </div>

          </div>

          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} />
            Dashboard
          </button>

        </div>

        {/* MAIN CARD */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

          {/* NAME */}
          <div className="mb-7">

            <label className="block text-sm font-medium text-slate-300 mb-2">
              Student Name
            </label>

            <input
              type="text"
              value={profile.name}
              onChange={(event) => {
                setProfile((previous) => ({
                  ...previous,
                  name: event.target.value,
                }));

                setSaved(false);
              }}
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white outline-none focus:border-indigo-500"
            />

          </div>

          {/* GRADE */}
          <div className="mb-7">

            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <GraduationCap size={18} />
              Student Grade
            </label>

            <select
              value={profile.grade}
              onChange={handleGradeChange}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white outline-none focus:border-indigo-500"
            >
              {Object.keys(gradeSubjects).map((grade) => (
                <option
                  key={grade}
                  value={grade}
                >
                  {grade}
                </option>
              ))}
            </select>

          </div>

          {/* SELECTED GRADE */}
          <div className="mb-7 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">

            <p className="text-sm text-slate-400">
              Current Grade
            </p>

            <p className="text-2xl font-bold text-indigo-400 mt-1">
              {profile.grade}
            </p>

          </div>

          {/* SUBJECTS */}
          <div className="mb-7">

            <label className="block text-sm font-medium text-slate-300 mb-3">
              Select Your Subject
            </label>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

              {profile.subjects.map((subject) => {

                const selected =
                  profile.selectedSubject === subject;

                return (
                  <button
                    key={subject}
                    type="button"
                    onClick={() =>
                      handleSubjectSelect(subject)
                    }
                    className={`relative p-4 rounded-xl border text-left transition-all ${
                      selected
                        ? "bg-indigo-500/20 border-indigo-500 text-indigo-300"
                        : "bg-slate-900 border-white/10 text-slate-200 hover:border-indigo-400"
                    }`}
                  >

                    {selected && (
                      <span className="absolute top-3 right-3">
                        <Check
                          size={18}
                          className="text-indigo-400"
                        />
                      </span>
                    )}

                    <span className="font-medium">
                      {subject}
                    </span>

                  </button>
                );
              })}

            </div>

          </div>

          {/* SELECTED SUBJECT */}
          <div className="mb-7 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">

            <p className="text-sm text-slate-400">
              Selected Subject
            </p>

            <p className="text-xl font-bold text-emerald-400 mt-1">
              {profile.selectedSubject}
            </p>

          </div>

          {/* SAVE BUTTON */}
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 font-semibold flex items-center justify-center gap-2 transition"
          >

            <Save size={20} />

            {saved
              ? "Profile Saved"
              : "Save Profile"}

          </button>

          {/* SUCCESS MESSAGE */}
          {saved && (
            <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">

              <p className="text-emerald-400 font-medium">
                ✓ Profile saved successfully
              </p>

              <p className="text-sm text-slate-400 mt-1">
                {profile.grade} • {profile.selectedSubject}
              </p>

            </div>
          )}

          {/* DELETE PROFILE */}
          <div className="mt-8 pt-6 border-t border-white/10">

            <h2 className="text-lg font-semibold text-white mb-2">
              Delete Profile
            </h2>

            <p className="text-sm text-slate-400 mb-4">
              Delete your profile and all learning data stored on this device.
            </p>

            <button
              type="button"
              onClick={handleDeleteProfile}
              className="w-full py-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 font-semibold flex items-center justify-center gap-2 transition"
            >

              <Trash2 size={20} />

              Delete Profile

            </button>

          </div>

        </div>
      </div>
    </div>
  );
}

export default Profile;
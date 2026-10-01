export type LearningActivity = {
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

const STORAGE_KEY = "omegaLearningHistory";

export function getLearningHistory(): LearningActivity[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    const history = JSON.parse(saved);

    return Array.isArray(history) ? history : [];
  } catch {
    return [];
  }
}

export function addLearningActivity(
  activity: Omit<LearningActivity, "id" | "timestamp">
) {
  const history = getLearningHistory();

  const newActivity: LearningActivity = {
    ...activity,
    id: `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`,
    timestamp: new Date().toISOString(),
  };

  const updatedHistory = [
    newActivity,
    ...history,
  ];

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedHistory)
  );

  window.dispatchEvent(
    new Event("omegaHistoryUpdated")
  );

  return newActivity;
}

export function clearLearningHistory() {
  localStorage.removeItem(STORAGE_KEY);

  window.dispatchEvent(
    new Event("omegaHistoryUpdated")
  );
}
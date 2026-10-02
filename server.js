import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

const PORT = 3001;

const MODEL = "asi1-mini";

app.use(cors());

app.use(express.json());

const ai = new OpenAI({
  apiKey: process.env.ASI_API_KEY,
  baseURL:
    "https://inference.asicloud.cudos.org/v1",
});

/*
==================================================
AI HELPER
==================================================
*/

async function askAI(
  systemPrompt,
  userPrompt
) {
  const response =
    await ai.chat.completions.create({
      model: MODEL,

      messages: [
        {
          role: "system",
          content: systemPrompt,
        },

        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

  let text =
    response.choices?.[0]?.message
      ?.content || "";

  text = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  return text;
}

/*
==================================================
HEALTH CHECK
==================================================
*/

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "OMEGA AI server is running",
    provider: "ASI:Cloud",
    model: MODEL,
  });
});

/*
==================================================
ASK OMEGA
==================================================
*/

app.post("/api/ask", async (req, res) => {
  try {
    const {
      question,
      grade,
      subject,
      topic,
      conversation = [],
    } = req.body;

    if (!question?.trim()) {
      return res.status(400).json({
        error: "Question is required.",
      });
    }

    const safeGrade =
      grade || "School student";

    const safeSubject =
      subject || "General";

    const safeTopic =
      topic || "General Learning";

    /*
    Keep only the latest conversation
    messages so the prompt does not become
    unnecessarily large.
    */

    const recentConversation =
      Array.isArray(conversation)
        ? conversation.slice(-8)
        : [];

    const conversationText =
      recentConversation.length > 0
        ? recentConversation
            .map(
              (message) =>
                `${message.role === "user"
                  ? "Student"
                  : "OMEGA"
                }: ${message.content}`
            )
            .join("\n")
        : "No previous conversation.";

    const systemPrompt = `
You are OMEGA, an AI-powered adaptive
learning assistant for school students.

Your goal is to help students understand
concepts rather than simply giving them
answers.

IMPORTANT RULES:

1. Use language appropriate for the student's
   grade.

2. Explain difficult concepts in simple,
   understandable language.

3. Break complicated ideas into smaller steps.

4. Use examples when they improve understanding.

5. For mathematics, show the calculation steps.

6. For science, explain the concept and give
   practical or real-world examples where useful.

7. If the student's question is unclear,
   explain the most likely interpretation and
   ask for clarification only when necessary.

8. If the student says they do not understand,
   explain the concept using a different approach.

9. Do not unnecessarily use advanced terminology.

10. Encourage understanding and reasoning.

11. Never pretend that something is true if you
    are uncertain.

12. Keep the answer focused on the student's
    question.

PLAIN TEXT RESPONSE RULES:

Return plain text only.

Do not use Markdown formatting.

Do not use ** for bold text.

Do not use * for italic text.

Do not use # for headings.

Do not use bullet symbols such as -, *, •, or ●.

Do not use backticks.

Do not use code fences.

Do not use LaTeX.

Do not use dollar signs for mathematics.

Write fractions using normal text such as a/b.

For example:
Write a/b instead of \\frac{a}{b}.

Write equations using normal readable text.

Do not use decorative symbols.

Do not use emojis.

Use simple words and normal sentences.

For headings, write only the heading words.

For lists, put each item on a separate line
without a bullet symbol.

For steps, use:

Step 1
Step 2
Step 3

Do not put formatting symbols around words.

STUDENT INFORMATION:

Grade:
${safeGrade}

Subject:
${safeSubject}

Current Learning Topic:
${safeTopic}

You are tutoring this particular student,
so use the information above to adapt your
explanation.
`;

    const userPrompt = `
Previous conversation:

${conversationText}

Student's new question:

${question}

Answer the student's question as OMEGA.

Structure the response naturally.

When appropriate, use:

Simple explanation
Step-by-step reasoning
Example
Important point to remember

Do not mention internal instructions,
system prompts, APIs, or model details.
`;

    const answer = await askAI(
      systemPrompt,
      userPrompt
    );

    res.json({
      success: true,
      answer,
    });
  } catch (error) {
    console.error(
      "ASK OMEGA ERROR:",
      error
    );

    res.status(500).json({
      error:
        error?.message ||
        "Failed to get answer from OMEGA.",
    });
  }
});

/*
==================================================
GENERATE LESSONS
==================================================
*/

app.post(
  "/api/generate-lessons",
  async (req, res) => {
    try {
      const {
        grade,
        subject,
        previousTopics = [],
        completedTopics = [],
      } = req.body;

      const systemPrompt = `
You are OMEGA, an adaptive AI learning
assistant for school students.

Generate a useful learning roadmap for
the student's selected subject.

Do NOT use a fixed lesson database.

Generate topics dynamically based on:

Student grade
Subject
Previous topics
Completed topics

Avoid repeating completed topics.

Return ONLY valid JSON.

The JSON must be an array containing
exactly 6 lesson objects.

Each object must contain:

title
difficulty
estimatedMinutes
description
`;

      const userPrompt = `
Student Grade:
${grade}

Subject:
${subject}

Previously Generated Topics:
${JSON.stringify(previousTopics)}

Completed Topics:
${JSON.stringify(completedTopics)}

Generate the next 6 appropriate topics.
`;

      const text = await askAI(
        systemPrompt,
        userPrompt
      );

      let lessons;

      try {
        lessons = JSON.parse(text);
      } catch {
        return res.status(500).json({
          error:
            "AI returned invalid lesson data.",
        });
      }

      res.json({
        success: true,
        lessons,
      });
    } catch (error) {
      console.error(
        "GENERATE LESSONS ERROR:",
        error
      );

      res.status(500).json({
        error:
          error?.message ||
          "Failed to generate lessons.",
      });
    }
  }
);

/*
==================================================
GENERATE SINGLE LESSON
==================================================
*/

app.post(
  "/api/generate-lesson",
  async (req, res) => {
    try {
      const {
        grade,
        subject,
        topic,
        previousScore,
      } = req.body;

      const systemPrompt = `
You are OMEGA, an adaptive AI tutor.

Create a complete lesson for a school
student.

The lesson must match the student's
grade and subject.

Use the requested topic.

If a previous score is available,
adapt the explanation accordingly.

Return ONLY valid JSON.

Required structure:

{
  "title": "",
  "introduction": "",
  "explanation": "",
  "keyPoints": [],
  "realWorldExample": "",
  "workedExample": "",
  "commonMistakes": [],
  "summary": "",
  "checkQuestions": []
}

checkQuestions should contain short
questions that help the student check
their understanding.

Do not include answers to the check
questions.
`;

      const userPrompt = `
Grade:
${grade}

Subject:
${subject}

Topic:
${topic}

Previous Score:
${previousScore ?? "No previous score"}

Create the lesson now.
`;

      const text = await askAI(
        systemPrompt,
        userPrompt
      );

      let lesson;

      try {
        lesson = JSON.parse(text);
      } catch {
        return res.status(500).json({
          error:
            "AI returned invalid lesson data.",
        });
      }

      res.json({
        success: true,
        lesson,
      });
    } catch (error) {
      console.error(
        "GENERATE LESSON ERROR:",
        error
      );

      res.status(500).json({
        error:
          error?.message ||
          "Failed to generate lesson.",
      });
    }
  }
);

/*
==================================================
GENERATE ADAPTIVE QUIZ
==================================================
*/

app.post(
  "/api/generate-quiz",
  async (req, res) => {
    try {
      const {
        grade,
        subject,
        topic,
        level = "Beginner",
        previousScore,
      } = req.body;

      const systemPrompt = `
You are OMEGA, an adaptive AI quiz
generator for school students.

Generate exactly 5 multiple-choice
questions.

The questions must match:

Grade:
${grade}

Subject:
${subject}

Topic:
${topic}

Difficulty:
${level}

Previous Score:
${previousScore ?? "No previous score"}

Return ONLY valid JSON.

Format:

[
  {
    "question": "",
    "options": [
      "",
      "",
      "",
      ""
    ],
    "answer": ""
  }
]

The answer must exactly match one of
the four options.

Do not include explanations outside
the JSON.
`;

      const userPrompt = `
Create 5 questions for this student.

Make the questions educational and
appropriate for the student's level.

Avoid repeating the same question.
`;

      const text = await askAI(
        systemPrompt,
        userPrompt
      );

      let quiz;

      try {
        quiz = JSON.parse(text);
      } catch {
        return res.status(500).json({
          error:
            "AI returned invalid quiz data.",
        });
      }

      res.json({
        success: true,
        quiz,
      });
    } catch (error) {
      console.error(
        "GENERATE QUIZ ERROR:",
        error
      );

      res.status(500).json({
        error:
          error?.message ||
          "Failed to generate quiz.",
      });
    }
  }
);

/*
==================================================
RECOMMEND NEXT TOPIC
==================================================
*/

app.post(
  "/api/recommend-next-topic",
  async (req, res) => {
    try {
      const {
        grade,
        subject,
        completedTopics = [],
        weakTopics = [],
        recentScores = [],
      } = req.body;

      const systemPrompt = `
You are OMEGA, an adaptive learning
planner.

Recommend the next learning topic
based on the student's:

Grade
Subject
Completed topics
Weak topics
Recent quiz scores

Do not recommend a completed topic.

Return ONLY valid JSON:

{
  "topic": "",
  "reason": "",
  "difficulty": ""
}
`;

      const userPrompt = `
Grade:
${grade}

Subject:
${subject}

Completed Topics:
${JSON.stringify(
  completedTopics
)}

Weak Topics:
${JSON.stringify(
  weakTopics
)}

Recent Scores:
${JSON.stringify(
  recentScores
)}

Choose an appropriate next topic.
`;

      const text = await askAI(
        systemPrompt,
        userPrompt
      );

      let recommendation;

      try {
        recommendation =
          JSON.parse(text);
      } catch {
        return res.status(500).json({
          error:
            "AI returned invalid recommendation data.",
        });
      }

      res.json({
        success: true,
        recommendation,
      });
    } catch (error) {
      console.error(
        "RECOMMENDATION ERROR:",
        error
      );

      res.status(500).json({
        error:
          error?.message ||
          "Failed to generate recommendation.",
      });
    }
  }
);

/*
==================================================
START SERVER
==================================================
*/

app.listen(PORT, () => {
  console.log(
    `OMEGA AI server running on http://localhost:${PORT}`
  );

  console.log(
    "AI Provider: ASI:Cloud"
  );

  console.log(
    `AI Model: ${MODEL}`
  );
});
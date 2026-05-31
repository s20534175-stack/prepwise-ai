const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function askGroq(prompt) {
  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    max_tokens: 2000,
  });
  const text = completion.choices[0]?.message?.content || '';
  return text.replace(/```json\n?|\n?```/g, '').trim();
}

exports.analyzeResume = async (resumeText, targetRole = '') => {
  const prompt = `You are an expert ATS analyzer. Analyze this resume for "${targetRole || 'Software Developer'}".
Resume: ${resumeText.slice(0, 4000)}
Respond ONLY with valid JSON: {"atsScore":<0-100>,"overallFeedback":"<summary>","strengths":["s1","s2","s3"],"improvements":["i1","i2","i3"],"missingKeywords":["k1","k2"],"formattingScore":<0-100>,"contentScore":<0-100>,"keywordsScore":<0-100>,"suggestions":["t1","t2","t3"]}`;
  return JSON.parse(await askGroq(prompt));
};

exports.generateQuestions = async (jobRole, type = 'hr', difficulty = 'medium', count = 5) => {
  const prompt = `Generate ${count} ${difficulty} ${type} interview questions for ${jobRole}. Respond ONLY with JSON array: [{"question":"<q>","category":"<HR|Technical|Behavioral>","tips":"<tip>"}]`;
  return JSON.parse(await askGroq(prompt));
};

exports.evaluateAnswer = async (question, userAnswer, jobRole) => {
  const prompt = `Evaluate this interview answer for ${jobRole}.\nQuestion: "${question}"\nAnswer: "${userAnswer}"\nRespond ONLY with JSON: {"score":<0-10>,"feedback":"<fb>","whatWasGood":"<good>","whatToImprove":"<improve>","sampleBetterAnswer":"<sample>"}`;
  return JSON.parse(await askGroq(prompt));
};

exports.generateInterviewSummary = async (jobRole, questions, totalScore, maxScore) => {
  const prompt = `Summarize mock interview for ${jobRole}. Score: ${totalScore}/${maxScore}. Respond ONLY with JSON: {"summary":"<s>","strengths":["s1","s2"],"improvements":["i1","i2"],"nextSteps":["n1","n2"],"hireable":<true/false>,"confidenceLevel":"<Low|Medium|High>"}`;
  return JSON.parse(await askGroq(prompt));
};
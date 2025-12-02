import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? Constants.manifest?.extra ?? {};
const GEMINI_API_KEY = extra.GEMINI_API_KEY;

export async function testGemini() {
  const testText = "The stock market went up today because tech stocks performed well.";

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: `Summarize this in 6 sentences:\n${testText}` }] }
        ]
      }),
    }
  );

  if (!response.ok) {
    const txt = await response.text().catch(() => '<no body>');
    console.error('Gemini API error', response.status, txt);
    return;
  }

  const data = await response.json();
  console.log('Gemini response:', JSON.stringify(data, null, 2));
}

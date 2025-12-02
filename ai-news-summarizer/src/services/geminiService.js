// import Constants from 'expo-constants';

// const extra = Constants.expoConfig?.extra ?? Constants.manifest?.extra ?? {};
// const GEMINI_API_KEY = extra.GEMINI_API_KEY;

// export async function summarizeArticle(articleText) {
//   if (!GEMINI_API_KEY) {
//     console.warn('GEMINI_API_KEY is not set. Summarization requests will fail.');
//   }

//   try {
//     const response = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
//       {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           contents: [
//             {
//               role: "user",
//               parts: [{ text: `Summarize this in 3 sentences:\n${articleText}` }]
//             }
//           ]
//         }),
//       }
//     );

//     if (!response.ok) {
//       const txt = await response.text().catch(() => '<no body>');
//       console.error('Gemini API error', response.status, txt);
//       return 'Error generating summary.';
//     }

//     const data = await response.json();
//     // Log raw response to Metro so we can inspect shape during debugging
//     try {
//       console.log('Gemini raw response:', JSON.stringify(data));
//     } catch (e) {
//       console.log('Gemini raw response (could not stringify)');
//     }

//     // Try to extract text from several possible response shapes
//     const tryPaths = [
//       () => data.candidates?.[0]?.content?.parts?.[0]?.text,
//       () => data.candidates?.[0]?.output,
//       () => data.candidates?.[0]?.text,
//       () => data.output?.[0]?.content?.parts?.[0]?.text,
//       () => data.outputs?.[0]?.content?.parts?.[0]?.text,
//       () => data.result?.output_text,
//       () => data[0]?.text,
//     ];

//     for (const p of tryPaths) {
//       try {
//         const v = p();
//         if (v && typeof v === 'string' && v.trim().length > 0) return v;
//       } catch (e) {
//         // ignore
//       }
//     }

//     return 'No summary available.';
//   } catch (error) {
//     console.error('Error summarizing article:', error);
//     return 'Error generating summary.';
//   }
// }

import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? Constants.manifest?.extra ?? {};
const GEMINI_API_KEY = extra.GEMINI_API_KEY;

export async function summarizeArticle(articleText) {
  if (!GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not set. Summarization requests will fail.');
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: `Summarize this in 3 sentences:\n${articleText}` }
              ]
            }
          ]
        }),
      }
    );

    if (!response.ok) {
      const txt = await response.text().catch(() => '<no body>');
      console.error('Gemini API error', response.status, txt);
      return 'Error generating summary.';
    }

    const data = await response.json();
    console.log('Gemini raw response:', JSON.stringify(data, null, 2));

    // Extract text from possible response shapes
    const tryPaths = [
      () => data.candidates?.[0]?.content?.parts?.[0]?.text,
      () => data.output?.[0]?.content?.parts?.[0]?.text,
      () => data.result?.output_text,
    ];


    for (const p of tryPaths) {
      try {
        const v = p();
        if (v && typeof v === 'string' && v.trim().length > 0) return v;
      } catch (e) { /* ignore */ }
    }

    return 'No summary available.';
  } catch (error) {
    console.error('Error summarizing article:', error);
    return 'Error generating summary.';
  }
}

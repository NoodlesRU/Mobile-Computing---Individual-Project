import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? Constants.manifest?.extra ?? {};
const NEWS_API_KEY = extra.NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2/top-headlines';

// Fetch top headlines from the U.S. by default
export async function fetchNews(category = 'technology', country = 'us') {
  if (!NEWS_API_KEY) {
    console.warn('NEWS_API_KEY is not set. News requests will fail.');
  }

  try {
    const response = await fetch(
      `${BASE_URL}?country=${country}&category=${category}&apiKey=${NEWS_API_KEY}`
    );

    const data = await response.json();

    if (data.status !== 'ok') {
      throw new Error(data.message || 'Failed to fetch news');
    }

    return data.articles || [];
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

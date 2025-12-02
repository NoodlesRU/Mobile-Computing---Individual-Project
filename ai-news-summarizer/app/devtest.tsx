import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { fetchNews } from '../src/services/newsAPI';
import { summarizeArticle } from '../src/services/geminiService';

type Article = {
  title: string;
  description?: string;
  content?: string;
  source?: { name: string };
};



export default function DevTestScreen() {
  const [news, setNews] = useState<Article[]>([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('technology');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const mainScrollRef = useRef<any>(null);
  const [summaryY, setSummaryY] = useState<number | null>(null);
  //const sampleArticle = `OpenAI released a new model that simplifies many natural language tasks. The model shows strong performance across summarization, question-answering, and code generation tasks. Developers are experimenting with it to build new productivity tools.`;

  async function handleFetchNews() {
    setLoading(true);
    const items = await fetchNews(selectedCategory, 'us');
    setNews(items || []);
    setLoading(false);
  }

  // Automatically fetch when the selected category changes
  useEffect(() => {
    handleFetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);
// Helper: select an article and immediately summarize it
async function selectAndSummarize(article: Article) {
  setSelectedArticle(article);
  setIsSummarizing(true);
  try {
    const text = (article.title || '') + '\n' + (article.description || '') + '\n' + (article.content || '');
    const s = await summarizeArticle(text);
    setSummary(s);
    // scroll to summary area if we have a measured Y
    setTimeout(() => {
      if (mainScrollRef.current) {
        if (summaryY != null) {
          try { mainScrollRef.current.scrollTo({ y: summaryY - 10, animated: true }); } catch { }
        } else {
          try { mainScrollRef.current.scrollToEnd({ animated: true }); } catch { }
        }
      }
    }, 80);
  } catch (err) {
    console.error('Error summarizing selected article:', err);
    setSummary('Failed to summarize article.');
  } finally {
    setIsSummarizing(false);
  }
}




  const categories = ['business','entertainment','general','health','science','sports','technology'];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView ref={mainScrollRef} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Dev Test Screen</Text>

      <View style={styles.buttonRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.catButton, c === selectedCategory && styles.catButtonActive]}
              onPress={() => setSelectedCategory(c)}>
              <Text style={[styles.catText, c === selectedCategory && styles.catTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Fetch button removed — news auto-fetches when category is selected */}

      {/* "Summarize First Article" button removed; use "Summarize Selected Article" instead */}

      <Text style={styles.sectionTitle}>News</Text>
      {news.length === 0 ? (
        <Text style={styles.hint}>No articles loaded.</Text>
      ) : (
        news.map((a, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.article, selectedArticle === a && styles.articleSelected]}
            disabled={loading}
            onPress={() => !loading && selectAndSummarize(a)}>
            <Text style={styles.articleTitle}>{a.title}</Text>
            <Text style={styles.articleSource}>{a.source?.name}</Text>
          </TouchableOpacity>
        ))
      )}


        <View onLayout={(e) => setSummaryY(e.nativeEvent.layout.y)}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.hint}>{summary || 'No summary yet.'}</Text>
        </View>
      </ScrollView>

      {/* Summarizing overlay - rendered as sibling so it centers on the whole screen */}
      {isSummarizing && (
        <View style={styles.overlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.overlayText}>Summarizing...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  buttonRow: { flexDirection: 'row', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 12, marginBottom: 6 },
  hint: { color: '#666' },
  article: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  articleTitle: { fontSize: 16 },
  articleSource: { fontSize: 12, color: '#888' },
  articleSelected: { backgroundColor: '#eef6ff' },
  catRow: { paddingVertical: 6, paddingHorizontal: 4 },
  catButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 8 },
  catButtonActive: { backgroundColor: '#007AFF' },
  catText: { color: '#333', textTransform: 'capitalize' },
  catTextActive: { color: '#fff' },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  overlayText: { marginTop: 12, color: '#333', fontSize: 16 },
});





  // async function handleSummarize() {
  //   setLoading(true);
  //   const s = await summarizeArticle(sampleArticle);
  //   setSummary(s);
  //   setLoading(false);
  // }
//   async function handleSummarize() {
//   if (news.length === 0) {
//     alert('Please fetch news first!');
//     return;
//   }

//   setLoading(true);

//   try {
//     // Take the first article's content or description
//     const firstArticle = news[0];
//     const textToSummarize = firstArticle.content || firstArticle.description || firstArticle.title;

//     const s = await summarizeArticle(textToSummarize);
//     setSummary(s);
//   } catch (error) {
//     console.error('Error summarizing news:', error);
//     setSummary('Failed to summarize article.');
//   }

//   setLoading(false);
// }

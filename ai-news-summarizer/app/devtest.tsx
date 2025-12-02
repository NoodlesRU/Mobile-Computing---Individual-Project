import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, Platform } from 'react-native';
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
  const [displayedNews, setDisplayedNews] = useState<Article[]>([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('technology');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const mainScrollRef = useRef<any>(null);
  const [summaryY, setSummaryY] = useState<number | null>(null);
  //const sampleArticle = `OpenAI released a new model that simplifies many natural language tasks. The model shows strong performance across summarization, question-answering, and code generation tasks. Developers are experimenting with it to build new productivity tools.`;

  async function handleFetchNews() {
    setLoading(true);
    const items = await fetchNews(selectedCategory, 'us');
    setNews(items || []);
    setDisplayedNews(items || []);
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

  function handleSearch() {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setDisplayedNews(news);
      return;
    }

    const words = q.split(/\s+/).filter(Boolean);
    const scored = news.map((a) => {
      const text = ((a.title || '') + ' ' + (a.description || '') + ' ' + (a.content || '')).toLowerCase();
      let score = 0;
      for (const w of words) {
        score += (text.split(w).length - 1);
      }
      return { article: a, score };
    });

    scored.sort((x, y) => y.score - x.score);
    const results = scored.filter(s => s.score > 0).map(s => s.article);
    if (results.length > 0) {
      setDisplayedNews(results);
      // auto-select and summarize top result
      setTimeout(() => {
        selectAndSummarize(results[0]);
        try { mainScrollRef.current?.scrollTo({ y: 0, animated: true }); } catch {}
      }, 80);
    } else {
      // fallback: filter by substring anywhere
      const fallback = news.filter(a => ((a.title || '') + ' ' + (a.description || '') + ' ' + (a.content || '')).toLowerCase().includes(q));
      setDisplayedNews(fallback.length ? fallback : []);
      if (fallback.length) {
        setTimeout(() => selectAndSummarize(fallback[0]), 80);
      }
    }
  }

  return (
    <View style={[{ flex: 1 }, Platform.OS === 'web' ? { backgroundColor: '#ffffff' } : null]}>
      <ScrollView ref={mainScrollRef} contentContainerStyle={styles.container}>
      <Text style={styles.title}>{selectedCategory ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : 'Dev Test'}</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowDropdown((s) => !s)}>
          <Text style={styles.dropdownButtonText}>{selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}</Text>
          <Text style={styles.caret}>{showDropdown ? '▴' : '▾'}</Text>
        </TouchableOpacity>
        {showDropdown && (
          <View style={styles.dropdownMenu}>
            {categories.map((c) => (
              <TouchableOpacity
                key={c}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedCategory(c);
                  setShowDropdown(false);
                }}>
                <Text style={styles.dropdownItemText}>{c.charAt(0).toUpperCase() + c.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search articles (keywords)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.searchClearAbsolute}
              onPress={() => {
                setSearchQuery('');
                setDisplayedNews(news);
              }}
            >
              <Text style={styles.searchClearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>


      <Text style={styles.sectionTitle}>News</Text>

      <View onLayout={(e) => setSummaryY(e.nativeEvent.layout.y)}>
        <View style={styles.summaryHeaderRow}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <TouchableOpacity
            onPress={() => {
              setSummary('');
              setSelectedArticle(null);
            }}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>Clear Summary</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>{summary || 'No summary yet.'}</Text>
      </View>

      {displayedNews.length === 0 ? (
        <Text style={styles.hint}>No articles loaded.</Text>
      ) : (
        displayedNews.map((a, i) => (
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
      </ScrollView>

      {/* Summarizing overlay - rendered as sibling so it centers on the whole screen */}
      {isSummarizing && (
        <View style={styles.overlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.overlayText}>Loading...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 60 },
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
  dropdownButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d0d7de',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 140,
  },
  dropdownButtonText: { color: '#111', fontSize: 16, textTransform: 'capitalize' },
  caret: { marginLeft: 8, color: '#666', fontSize: 14 },
  dropdownMenu: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    zIndex: 999,
  },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  dropdownItemText: { color: '#333', textTransform: 'capitalize' },
  summaryHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  clearButton: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#f7f7f8', borderRadius: 6, borderWidth: 1, borderColor: '#e1e1e1' },
  clearButtonText: { color: '#333', fontSize: 14 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  searchInput: { flex: 1, borderWidth: 1, borderColor: '#e6e6e6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, backgroundColor: '#fff' },
  searchButton: { padding: 10, backgroundColor: '#0876ebff', borderRadius: 8 },
  searchButtonText: { color: '#fff', fontSize: 16 },
  searchClearText: { color: '#666', fontSize: 14 },
  searchInputWrapper: { flex: 1, position: 'relative' },
  searchClearAbsolute: { position: 'absolute', right: 12, top: '40%', transform: [{ translateY: -10 }], padding: 5 },
});



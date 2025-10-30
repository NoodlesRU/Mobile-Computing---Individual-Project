// app/(tabs)/news.tsx
import { View, Text, StyleSheet } from "react-native";

export default function NewsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📰 AI News Summaries</Text>
      <Text style={styles.subtitle}>
        Your AI-powered news summaries will appear here soon.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

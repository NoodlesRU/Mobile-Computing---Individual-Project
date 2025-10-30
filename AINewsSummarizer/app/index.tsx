// app/index.tsx
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
//import logo from "../assets/aiN_logo.png"

export default function LandingPage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/aiN_logo.png")} // Add a logo in assets if you have one
        style={styles.logo}
      />
      <Text style={styles.title}>One-Minute News</Text>
      <Text style={styles.subtitle}>
        Stay informed in seconds — AI-generated summaries tailored for you.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("//news")}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A23",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    color: "#aaa",
    textAlign: "center",
    fontSize: 16,
    marginBottom: 40,
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#1E90FF",
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 25,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 18,
  },
});

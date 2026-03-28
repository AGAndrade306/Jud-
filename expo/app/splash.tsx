import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { useEffect, useRef } from "react";
import { Scale } from "lucide-react-native";

export default function SplashScreen() {
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <Scale size={64} color="#2563eb" strokeWidth={2} />
      </Animated.View>
      <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
        ProcessoJá
      </Animated.Text>
      <Animated.Text style={[styles.subtitle, { opacity: fadeAnim }]}>
        Acompanhe seus processos trabalhistas
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
});

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Scale, Bell, Lock, CheckCircle2 } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";



interface OnboardingSlide {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const slides: OnboardingSlide[] = [
  {
    icon: <Scale size={64} color="#2563eb" strokeWidth={2} />,
    title: "Acompanhe Processos Trabalhistas",
    description:
      "Tenha clareza sobre cada etapa do seu processo. Saiba exatamente em que momento seu caso está.",
  },
  {
    icon: <Bell size={64} color="#2563eb" strokeWidth={2} />,
    title: "Receba Atualizações em Tempo Real",
    description:
      "Notificações por push, e-mail e WhatsApp sempre que houver mudanças no seu processo.",
  },
  {
    icon: <Lock size={64} color="#2563eb" strokeWidth={2} />,
    title: "Seus Dados Protegidos",
    description:
      "Suas informações são criptografadas e armazenadas com segurança. Total conformidade com a LGPD.",
  },
  {
    icon: <CheckCircle2 size={64} color="#10b981" strokeWidth={2} />,
    title: "Pronto para Começar!",
    description:
      "Crie sua conta e comece a acompanhar seus processos agora mesmo.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      completeOnboarding();
      router.replace("/signup" as any);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    router.replace("/signup" as any);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.slideContainer}>
          <View style={styles.iconContainer}>{slides[currentIndex].icon}</View>
          <Text style={styles.title}>{slides[currentIndex].title}</Text>
          <Text style={styles.description}>
            {slides[currentIndex].description}
          </Text>
        </View>

        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 40 }]}>
        {currentIndex < slides.length - 1 && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Pular</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.9}
        >
          <Text style={styles.nextText}>
            {currentIndex === slides.length - 1 ? "Começar" : "Próximo"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  slideContainer: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 400,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  description: {
    fontSize: 17,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 26,
    paddingHorizontal: 8,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#d1d5db",
  },
  activeDot: {
    width: 24,
    backgroundColor: "#2563eb",
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
    gap: 12,
  },
  skipButton: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  skipText: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "600" as const,
  },
  nextButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  nextText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#ffffff",
  },
});

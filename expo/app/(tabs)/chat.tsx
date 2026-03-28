import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { Stack } from "expo-router";

import { Send, Bot } from "lucide-react-native";
import { useChat } from "@/contexts/ChatContext";

export default function ChatScreen() {
  const { messages, send, currentConversation, createConversation } = useChat();
  const [input, setInput] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);

  useEffect(() => {
    if (!currentConversation) {
      createConversation();
    }
  }, [currentConversation, createConversation]);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const messageText = input.trim();
    setInput("");
    setIsSending(true);

    try {
      await send(messageText);
    } catch (error) {
      console.error("[ChatScreen] Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = (message: any, index: number) => {
    const isUser = message.role === "user";
    
    const textParts = message.parts.filter((p: any) => p.type === "text");
    const toolParts = message.parts.filter((p: any) => p.type === "tool");

    return (
      <View key={`${message.id}-${index}`} style={styles.messageContainer}>
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          {!isUser && (
            <View style={styles.botIconContainer}>
              <Bot size={16} color="#2563eb" strokeWidth={2} />
            </View>
          )}
          
          {textParts.map((part: any, i: number) => (
            <Text
              key={`text-${i}`}
              style={[
                styles.messageText,
                isUser ? styles.userText : styles.assistantText,
              ]}
            >
              {part.text}
            </Text>
          ))}

          {toolParts.map((part: any, i: number) => {
            switch (part.state) {
              case "input-streaming":
              case "input-available":
                return (
                  <View key={`tool-${i}`} style={styles.toolContainer}>
                    <ActivityIndicator size="small" color="#2563eb" />
                    <Text style={styles.toolText}>
                      Consultando {part.toolName}...
                    </Text>
                  </View>
                );

              case "output-available":
                return null;

              case "output-error":
                return (
                  <View key={`tool-error-${i}`} style={styles.toolErrorContainer}>
                    <Text style={styles.toolErrorText}>
                      Erro: {part.errorText}
                    </Text>
                  </View>
                );

              default:
                return null;
            }
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Consultor Jurídico",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#2563eb",
          },
          headerTintColor: "#ffffff",
          headerTitleStyle: {
            fontWeight: "700",
            fontSize: 18,
          },
        }}
      />

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={[
          styles.messagesContent,
          { paddingBottom: keyboardHeight > 0 ? keyboardHeight - 50 : 8 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
          {messages.length === 0 && (
            <View style={styles.emptyContainer}>
              <Bot size={64} color="#cbd5e1" strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>Consultor Jurídico AI</Text>
              <Text style={styles.emptyText}>
                Faça perguntas sobre seus processos trabalhistas, prazos, etapas e muito mais.
              </Text>
            </View>
          )}

          {messages.map((msg, idx) => renderMessage(msg, idx))}

          {isSending && (
            <View style={styles.messageContainer}>
              <View style={[styles.messageBubble, styles.assistantBubble]}>
                <ActivityIndicator size="small" color="#2563eb" />
              </View>
            </View>
          )}
      </ScrollView>

      <View
        style={[
          styles.inputContainer,
          Platform.OS === "android" && keyboardHeight > 0 && {
            position: "absolute",
            bottom: keyboardHeight,
            left: 0,
            right: 0,
          },
        ]}
      >
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Digite sua pergunta..."
            placeholderTextColor="#9ca3af"
            multiline
            maxLength={500}
            editable={!isSending}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!input.trim() || isSending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!input.trim() || isSending}
          >
            <Send
              size={20}
              color={!input.trim() || isSending ? "#9ca3af" : "#ffffff"}
              strokeWidth={2}
            />
          </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1f2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
  },
  messageContainer: {
    marginBottom: 12,
  },
  messageBubble: {
    maxWidth: "80%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#2563eb",
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  botIconContainer: {
    marginBottom: 6,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: "#ffffff",
  },
  assistantText: {
    color: "#1f2937",
  },
  toolContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  toolText: {
    fontSize: 13,
    color: "#6b7280",
    fontStyle: "italic",
  },
  toolErrorContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  toolErrorText: {
    fontSize: 13,
    color: "#dc2626",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 12,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: "#1f2937",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#e5e7eb",
  },
});

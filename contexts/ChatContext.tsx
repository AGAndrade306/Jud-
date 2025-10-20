import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect, useCallback, useMemo } from "react";
import { ChatConversation, ChatMessage } from "@/types/chat";
import { useAuth } from "./AuthContext";
import { createRorkTool, useRorkAgent } from "@rork/toolkit-sdk";
import { z } from "zod";
import { useCases } from "./CasesContext";

const CHAT_STORAGE_KEY = "@app:chat_conversations";

export const [ChatProvider, useChat] = createContextHook(() => {
  const { isAuthenticated } = useAuth();
  const { cases } = useCases();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { messages, error, sendMessage, setMessages } = useRorkAgent({
    tools: {
      consultarProcesso: createRorkTool({
        description: "Consulta informações sobre um processo trabalhista específico do usuário pelo número CNJ",
        zodSchema: z.object({
          cnjNumber: z.string().describe("Número CNJ do processo no formato NNNNNNN-DD.AAAA.J.TR.OOOO"),
        }),
        execute(input) {
          console.log("[ChatContext] Consultando processo:", input.cnjNumber);
          const caseData = cases.find((c) => c.cnjNumber === input.cnjNumber);
          
          if (!caseData) {
            return JSON.stringify({
              success: false,
              message: "Processo não encontrado na lista de processos salvos do usuário.",
            });
          }

          return JSON.stringify({
            success: true,
            cnjNumber: caseData.cnjNumber,
            nickname: caseData.nickname,
            currentStage: caseData.currentStage,
            lastUpdate: caseData.currentStageUpdatedAt,
            events: caseData.events.slice(0, 5),
          });
        },
      }),
      listarProcessos: createRorkTool({
        description: "Lista todos os processos trabalhistas que o usuário está acompanhando",
        zodSchema: z.object({}),
        execute() {
          console.log("[ChatContext] Listando processos do usuário");
          return JSON.stringify({
            success: true,
            totalCases: cases.length,
            cases: cases.map((c) => ({
              cnjNumber: c.cnjNumber,
              nickname: c.nickname,
              currentStage: c.currentStage,
              lastUpdate: c.currentStageUpdatedAt,
            })),
          });
        },
      }),
    },
  });

  const loadConversations = async () => {
    try {
      console.log("[ChatContext] Loading conversations...");
      const stored = await AsyncStorage.getItem(CHAT_STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);
        console.log("[ChatContext] Loaded", parsed.length, "conversations");
        setConversations(parsed);
      } else {
        console.log("[ChatContext] No conversations found");
        setConversations([]);
      }
    } catch (error) {
      console.error("[ChatContext] Error loading conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConversations = async (updated: ChatConversation[]) => {
    try {
      await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated));
      setConversations(updated);
      console.log("[ChatContext] Conversations saved:", updated.length);
    } catch (error) {
      console.error("[ChatContext] Error saving conversations:", error);
    }
  };

  const syncMessagesToConversation = useCallback(() => {
    if (!currentConversationId) return;

    const conversationMessages: ChatMessage[] = messages.map((m) => {
      const textParts = m.parts.filter((p) => p.type === "text");
      const content = textParts.map((p) => (p as any).text).join("\n");

      return {
        id: m.id,
        role: m.role as "user" | "assistant",
        content: content || "...",
        timestamp: new Date().toISOString(),
      };
    });

    setConversations((prev) => {
      const updated = prev.map((conv) =>
        conv.id === currentConversationId
          ? {
              ...conv,
              messages: conversationMessages,
              updatedAt: new Date().toISOString(),
            }
          : conv
      );
      AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [messages, currentConversationId]);

  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    } else {
      setConversations([]);
      setCurrentConversationId(null);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (currentConversationId && messages.length > 0) {
      syncMessagesToConversation();
    }
  }, [messages, currentConversationId, syncMessagesToConversation]);

  const createConversation = useCallback(() => {
    const newConv: ChatConversation = {
      id: Date.now().toString(),
      title: "Nova Consulta",
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newConv, ...conversations];
    saveConversations(updated);
    setCurrentConversationId(newConv.id);
    setMessages([]);
    console.log("[ChatContext] New conversation created:", newConv.id);
    return newConv.id;
  }, [conversations, setMessages]);

  const deleteConversation = useCallback(
    (id: string) => {
      const updated = conversations.filter((c) => c.id !== id);
      saveConversations(updated);
      if (currentConversationId === id) {
        setCurrentConversationId(null);
        setMessages([]);
      }
      console.log("[ChatContext] Conversation deleted:", id);
    },
    [conversations, currentConversationId, setMessages]
  );

  const loadConversation = useCallback(
    (id: string) => {
      const conv = conversations.find((c) => c.id === id);
      if (!conv) {
        console.error("[ChatContext] Conversation not found:", id);
        return;
      }

      setCurrentConversationId(id);

      const agentMessages = conv.messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        parts: [{ type: "text" as const, text: msg.content }],
      }));

      setMessages(agentMessages);
      console.log("[ChatContext] Conversation loaded:", id, "with", conv.messages.length, "messages");
    },
    [conversations, setMessages]
  );

  const currentConversation = useMemo(() => {
    return conversations.find((c) => c.id === currentConversationId);
  }, [conversations, currentConversationId]);

  const send = useCallback(
    async (message: string) => {
      if (!currentConversationId) {
        const newId = createConversation();
        setCurrentConversationId(newId);
      }

      console.log("[ChatContext] Sending message:", message);
      await sendMessage(message);
    },
    [currentConversationId, sendMessage, createConversation]
  );

  return useMemo(
    () => ({
      conversations,
      currentConversationId,
      currentConversation,
      messages,
      error,
      isLoading,
      send,
      createConversation,
      deleteConversation,
      loadConversation,
    }),
    [
      conversations,
      currentConversationId,
      currentConversation,
      messages,
      error,
      isLoading,
      send,
      createConversation,
      deleteConversation,
      loadConversation,
    ]
  );
});

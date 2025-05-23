import React, { createContext, useContext } from "react";

import { useActor } from "@xstate/react";

import { chatMachine } from "./chat-machine";
import { ChatMessage } from "../components/ai-chat";

// Интерфейс контекста провайдера чата
export interface ChatContextType {
  // Состояние
  chatMessages: ChatMessage[];
  selectedAgentId: string | null;
  isProcessing: boolean;
  error: string | null;

  // Действия
  sendChatMessage: (message: string) => void;
  receiveChatMessage: (message: ChatMessage) => void;
  selectAgent: (agentId: string) => void;
  setProcessing: (isProcessing: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
  removeMessage: (messageId: string) => void;
}

// Создаем контекст
export const ChatContext = createContext<ChatContextType | null>(null);

// Интерфейс пропсов провайдера
interface ChatProviderProps {
  children: React.ReactNode;
}

/**
 * Провайдер для управления состоянием чата
 *
 * Использует XState машину состояний для управления:
 * - Сообщениями чата
 * - Выбранным агентом (моделью ИИ)
 * - Состоянием обработки
 * - Ошибками
 */
export function ChatProvider({ children }: ChatProviderProps) {
  const [state, send] = useActor(chatMachine);

  // Извлекаем данные из состояния машины
  const { chatMessages, selectedAgentId, isProcessing, error } = state.context;

  // Создаем функции для отправки событий
  const sendChatMessage = (message: string) => {
    send({ type: "SEND_CHAT_MESSAGE", message });
  };

  const receiveChatMessage = (message: ChatMessage) => {
    send({ type: "RECEIVE_CHAT_MESSAGE", message });
  };

  const selectAgent = (agentId: string) => {
    send({ type: "SELECT_AGENT", agentId });
  };

  const setProcessing = (isProcessing: boolean) => {
    send({ type: "SET_PROCESSING", isProcessing });
  };

  const setError = (error: string | null) => {
    send({ type: "SET_ERROR", error });
  };

  const clearMessages = () => {
    send({ type: "CLEAR_MESSAGES" });
  };

  const removeMessage = (messageId: string) => {
    send({ type: "REMOVE_MESSAGE", messageId });
  };

  // Создаем значение контекста
  const contextValue: ChatContextType = {
    // Состояние
    chatMessages,
    selectedAgentId,
    isProcessing,
    error,

    // Действия
    sendChatMessage,
    receiveChatMessage,
    selectAgent,
    setProcessing,
    setError,
    clearMessages,
    removeMessage,
  };

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
}

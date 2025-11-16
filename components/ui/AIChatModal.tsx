// components/ui/AIChatModal.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { AIMessage, globalAIAssistant, SiteContext } from "@/lib/global-ai-assistant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, X, Bot, User, Loader2 } from "lucide-react";

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: SiteContext;
}

export function AIChatModal({ isOpen, onClose, context }: AIChatModalProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      
      if (messages.length === 0) {
        setMessages([{
          id: '1',
          content: 'Привет! Я ваш AI помощник для планирования маршрутов. Могу помочь с поиском мероприятий, построением оптимальных путей, работой в группах и другими вопросами по сайту!',
          role: 'assistant',
          timestamp: new Date()
        }]);
      }
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await globalAIAssistant.sendMessage(inputMessage, context);
      
      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Добавляем предложения как отдельные сообщения
      if (response.suggestions && response.suggestions.length > 0) {
        const suggestionsMessage: AIMessage = {
          id: (Date.now() + 2).toString(),
          content: `💡 **Предложения:**\n${response.suggestions.map(s => `• ${s}`).join('\n')}`,
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, suggestionsMessage]);
      }
    } catch (error) {
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        content: "❌ Извините, произошла ошибка при обработке запроса. Пожалуйста, попробуйте еще раз или обратитесь в поддержку.",
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "Как создать маршрут?",
    "Где найти мероприятия?",
    "Как добавить друзей в группу?",
    "Как работает AI планировщик?"
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:items-center sm:justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Модальное окно */}
      <Card className="relative w-full max-w-md h-[600px] flex flex-col shadow-2xl border-2">
        {/* Заголовок */}
        <CardHeader className="pb-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="h-8 w-8 bg-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
              </div>
              <div>
                <CardTitle className="text-lg">AI Помощник</CardTitle>
                <p className="text-xs text-muted-foreground">Онлайн • Готов помочь</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Область сообщений */}
        <CardContent className="flex-1 p-4 space-y-4 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <Avatar className={`h-8 w-8 flex-shrink-0 ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                <AvatarFallback className="text-xs">
                  {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              
              <div className={`max-w-[80%] space-y-1 ${
                message.role === 'user' ? 'items-end' : 'items-start'
              }`}>
                <div className={`rounded-lg px-3 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                </div>
                <p className={`text-xs ${
                  message.role === 'user' ? 'text-muted-foreground' : 'text-muted-foreground'
                }`}>
                  {message.timestamp.toLocaleTimeString('ru-RU', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {/* Индикатор загрузки */}
          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 bg-muted text-muted-foreground flex-shrink-0">
                <AvatarFallback className="text-xs">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg px-3 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Быстрые вопросы */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage(question)}
                  className="text-xs h-auto py-1 px-2 whitespace-normal text-left hover:bg-primary/10 hover:text-primary"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Поле ввода */}
        <div className="p-4 border-t bg-muted/20">
          <div className="flex space-x-2">
            <Input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Введите ваш вопрос..."
              disabled={isLoading}
              className="flex-1 bg-background"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              size="icon"
              className="flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            AI помощник может допускать ошибки. Проверяйте важную информацию.
          </p>
        </div>
      </Card>
    </div>
  );
}
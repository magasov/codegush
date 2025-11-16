import axios from "axios";

export interface AIMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export interface AIAssistantResponse {
  message: string;
  suggestions?: string[];
  actions?: string[];
}

export interface SiteContext {
  currentPage: string;
  userData?: any;
  plannedEvents?: any[];
  currentRoute?: any[];
  groupMembers?: any[];
}

class GlobalAIAssistant {
  private baseUrl: string = "https://text.pollinations.ai";

  async sendMessage(
    message: string, 
    context: SiteContext
  ): Promise<AIAssistantResponse> {
    const prompt = this.buildPrompt(message, context);
    
    try {
      const response = await this.aiQuery(prompt, {
        model: "gpt-5-nano",
        temperature: 0.7,
        system: "Ты универсальный помощник для сайта планирования маршрутов. Ты помогаешь пользователям с навигацией по сайту, функционалом, планированием мероприятий, работой в группах, техническими вопросами и всем что связано с сайтом. Будь полезным, дружелюбным и конкретным.",
        json_response: false
      });

      return this.parseAssistantResponse(response, context);
    } catch (error) {
      console.error("Global AI Assistant error:", error);
      return this.getFallbackResponse(message, context);
    }
  }

  private buildPrompt(message: string, context: SiteContext): string {
    const { currentPage, userData, plannedEvents = [], currentRoute = [], groupMembers = [] } = context;

    let contextInfo = `Текущая страница: ${currentPage}\n`;

    if (userData) {
      contextInfo += `Пользователь: ${userData.fullName}\n`;
    }

    if (plannedEvents.length > 0) {
      contextInfo += `Запланировано мероприятий: ${plannedEvents.length}\n`;
    }

    if (currentRoute.length > 0) {
      contextInfo += `Текущий маршрут: ${currentRoute.length} точек\n`;
    }

    if (groupMembers.length > 0) {
      contextInfo += `Участников в группе: ${groupMembers.length}\n`;
    }

    return `
КОНТЕКСТ САЙТА:
${contextInfo}

ВОПРОС ПОЛЬЗОВАТЕЛЯ: "${message}"

Ответь как универсальный помощник по всему сайту. Основные разделы сайта:

1. ГЛАВНАЯ СТРАНИЦА - обзор, начало работы
2. МЕРОПРИЯТИЯ - поиск, фильтрация, добавление событий
3. ПЛАНИРОВЩИК - построение маршрутов, AI оптимизация
4. ГРУППЫ - совместное планирование, добавление друзей
5. ПРОФИЛЬ - настройки, личные данные

Функционал:
- Планирование маршрутов по Москве
- Подбор мероприятий
- Групповое планирование
- AI оптимизация маршрутов
- Экспорт и шаринг маршрутов

Будь helpful и решай любые вопросы пользователя:
- Навигация по сайту
- Использование функций
- Технические проблемы
- Советы по планированию
- Работа в группах
- Настройки профиля
- И многое другое!

Формат ответа (JSON):
{
  "message": "Основной ответ помощника",
  "suggestions": ["совет 1", "совет 2"],
  "actions": ["действие 1", "действие 2"]
}

Будь конкретным и предлагай четкие шаги!
`;
  }

  private async aiQuery(prompt: string, options: any = {}): Promise<any> {
    try {
      const encodedPrompt = encodeURIComponent(prompt);
      const url = `${this.baseUrl}/${encodedPrompt}`;

      const response = await axios.get(url, { 
        params: options,
        timeout: 30000
      });

      return response.data;
    } catch (err: any) {
      console.error("AI API error:", err.message);
      throw err;
    }
  }

  private parseAssistantResponse(response: any, context: SiteContext): AIAssistantResponse {
    try {
      let responseText = typeof response === 'string' ? response : JSON.stringify(response);
      
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          message: parsed.message || responseText,
          suggestions: parsed.suggestions || this.generateDefaultSuggestions(context),
          actions: parsed.actions || this.generateDefaultActions(context)
        };
      }

      return {
        message: responseText,
        suggestions: this.generateDefaultSuggestions(context),
        actions: this.generateDefaultActions(context)
      };

    } catch (error) {
      console.error("Error parsing AI response:", error);
      return {
        message: response,
        suggestions: this.generateDefaultSuggestions(context),
        actions: this.generateDefaultActions(context)
      };
    }
  }

  private generateDefaultSuggestions(context: SiteContext): string[] {
    const { currentPage, plannedEvents = [], groupMembers = [] } = context;
    const suggestions: string[] = [];

    switch (currentPage) {
      case "/":
        suggestions.push(
          "Перейдите в раздел мероприятий чтобы начать планирование",
          "Создайте аккаунт для сохранения ваших маршрутов",
          "Изучите популярные места Москвы на главной странице"
        );
        break;
      
      case "/events":
        suggestions.push(
          "Используйте фильтры для поиска подходящих мероприятий",
          "Добавьте понравившиеся события в планировщик",
          "Сохраняйте мероприятия для быстрого доступа"
        );
        break;
      
      case "/planner":
        if (plannedEvents.length === 0) {
          suggestions.push(
            "Добавьте мероприятия из раздела 'Все события'",
            "Начните с 2-3 мероприятий для первого маршрута",
            "Используйте AI помощника для подбора идей"
          );
        } else {
          suggestions.push(
            "Используйте AI для построения оптимального маршрута",
            "Добавьте друзей в группу для совместного планирования",
            "Экспортируйте маршрут для удобного использования"
          );
        }
        break;
      
      case "/profile":
        suggestions.push(
          "Обновите ваши предпочтения для персонализированных рекомендаций",
          "Проверьте настройки уведомлений",
          "Добавьте фото профиля для узнаваемости в группах"
        );
        break;
      
      default:
        suggestions.push(
          "Используйте навигацию для перехода между разделами",
          "Обратитесь к помощи если что-то непонятно",
          "Исследуйте все возможности сайта"
        );
    }

    if (groupMembers.length === 0 && currentPage === "/planner") {
      suggestions.push("Добавьте друзей в группу для совместного планирования");
    }

    return suggestions.slice(0, 3);
  }

  private generateDefaultActions(context: SiteContext): string[] {
    const { currentPage, plannedEvents = [] } = context;
    const actions: string[] = [];

    switch (currentPage) {
      case "/":
        actions.push("Перейти к мероприятиям", "Создать аккаунт", "Изучить возможности");
        break;
      
      case "/events":
        actions.push("Применить фильтры", "Добавить в планировщик", "Показать карту");
        break;
      
      case "/planner":
        if (plannedEvents.length >= 2) {
          actions.push("Построить маршрут", "Пригласить друзей", "Экспортировать план");
        } else {
          actions.push("Добавить мероприятия", "Искать события", "Получить рекомендации");
        }
        break;
      
      default:
        actions.push("Перейти на главную", "Открыть мероприятия", "Проверить планировщик");
    }

    return actions.slice(0, 2);
  }

  private getFallbackResponse(message: string, context: SiteContext): AIAssistantResponse {
    const lowerMessage = message.toLowerCase();
    const { currentPage } = context;

    // Общие ответы для частых вопросов
    if (lowerMessage.includes("как") && lowerMessage.includes("использовать")) {
      return {
        message: "Я помогу вам разобраться с функционалом сайта! Расскажите, что именно вас интересует: планирование маршрутов, работа с мероприятиями, группы или что-то другое?",
        suggestions: [
          "Опишите конкретную задачу которую хотите решить",
          "Укажите в каком разделе у вас возник вопрос",
          "Покажите что именно не получается"
        ],
        actions: ["Перейти к обучению", "Открыть справку"]
      };
    }

    if (lowerMessage.includes("настройк") || lowerMessage.includes("профиль")) {
      return {
        message: "Настройки профиля находятся в соответствующем разделе. Там вы можете изменить личные данные, предпочтения, настройки уведомлений и параметры конфиденциальности.",
        suggestions: [
          "Перейдите в раздел 'Профиль' через главное меню",
          "Обновите ваши интересы для лучших рекомендаций",
          "Настройте уведомления о новых мероприятиях"
        ],
        actions: ["Открыть профиль", "Настроить предпочтения"]
      };
    }

    if (lowerMessage.includes("групп") || lowerMessage.includes("друг")) {
      return {
        message: "Группы позволяют совместно планировать маршруты с друзьями. Вы можете создать группу, пригласить участников и вместе выбирать мероприятия.",
        suggestions: [
          "Создайте группу в разделе планировщика",
          "Пригласите друзей по email или username",
          "Совместно обсуждайте и выбирайте мероприятия"
        ],
        actions: ["Создать группу", "Пригласить друзей"]
      };
    }

    if (lowerMessage.includes("ошибк") || lowerMessage.includes("не работ")) {
      return {
        message: "Извините за неудобства! Опишите подробнее что именно не работает: какая функция, на какой странице, какие действия приводят к ошибке?",
        suggestions: [
          "Обновите страницу и попробуйте еще раз",
          "Проверьте интернет-соединение",
          "Очистите кеш браузера если проблема повторяется"
        ],
        actions: ["Сообщить об ошибке", "Написать в поддержку"]
      };
    }

    // Ответы по конкретным страницам
    switch (currentPage) {
      case "/":
        return {
          message: "Добро пожаловать на главную страницу! Здесь вы можете ознакомиться с возможностями сайта, увидеть популярные мероприятия и начать планирование вашего маршрута по Москве.",
          suggestions: [
            "Перейдите в раздел мероприятий для выбора событий",
            "Создайте аккаунт для сохранения ваших планов",
            "Изучите примеры готовых маршрутов"
          ],
          actions: ["Перейти к мероприятиям", "Создать аккаунт"]
        };
      
      case "/events":
        return {
          message: "Вы в разделе мероприятий! Здесь вы можете найти и выбрать интересные события в Москве. Используйте фильтры, поиск и категории для быстрого поиска.",
          suggestions: [
            "Используйте фильтры по дате, категории и цене",
            "Сохраняйте понравившиеся мероприятия",
            "Добавляйте события в планировщик одним кликом"
          ],
          actions: ["Применить фильтры", "Показать на карте"]
        };
      
      case "/planner":
        return {
          message: "Это ваш планировщик маршрутов! Добавляйте мероприятия, стройте оптимальные маршруты, приглашайте друзей и экспортируйте ваши планы.",
          suggestions: [
            "Добавьте мероприятия из раздела событий",
            "Используйте AI для автоматического планирования",
            "Создайте группу для совместного планирования"
          ],
          actions: ["Добавить мероприятия", "Построить маршрут"]
        };
      
      default:
        return {
          message: "Я ваш универсальный помощник по сайту планирования маршрутов! Могу помочь с навигацией, функционалом, техническими вопросами и всем что связано с сайтом.",
          suggestions: [
            "Задайте конкретный вопрос о функционале",
            "Укажите в каком разделе нужна помощь",
            "Опишите что хотите сделать"
          ],
          actions: ["Изучить возможности", "Открыть справку"]
        };
    }
  }

  // Специализированные помощники для разных разделов
  async getPageSpecificHelp(page: string): Promise<AIAssistantResponse> {
    const context: SiteContext = { currentPage: page };
    
    let question = "";
    switch (page) {
      case "/":
        question = "Что я могу сделать на главной странице?";
        break;
      case "/events":
        question = "Как работать с разделом мероприятий?";
        break;
      case "/planner":
        question = "Как использовать планировщик маршрутов?";
        break;
      case "/profile":
        question = "Какие настройки есть в профиле?";
        break;
      default:
        question = "Как пользоваться этим разделом сайта?";
    }

    return this.sendMessage(question, context);
  }

  // Помощник по техническим вопросам
  async getTechnicalHelp(issue: string): Promise<AIAssistantResponse> {
    const context: SiteContext = { currentPage: "technical" };
    
    return this.sendMessage(`Техническая проблема: ${issue}`, context);
  }

  // Помощник по навигации
  async getNavigationHelp(target: string): Promise<AIAssistantResponse> {
    const context: SiteContext = { currentPage: "navigation" };
    
    return this.sendMessage(`Как перейти в раздел: ${target}`, context);
  }
}

export const globalAIAssistant = new GlobalAIAssistant();
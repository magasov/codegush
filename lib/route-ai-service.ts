import axios from "axios";

export interface AIGeneratedRoute {
  id: string;
  name: string;
  description: string;
  events: Array<{
    id: string;
    order: number;
    plannedTime: string;
    travelTime: number;
  }>;
  totalTime: number;
  travelTime: number;
  eventCount: number;
  advantages: string[];
  disadvantages: string[];
  score: number;
}

export interface RouteGenerationRequest {
  events: Array<{
    id: string;
    title: string;
    duration: number;
    location: string;
    category: string;
    popularity: number;
    time: string;
  }>;
  constraints: {
    startTime: string;
    endTime: string;
    maxTotalTime: number;
  };
}

class RouteAI {
  private baseUrl: string = "https://text.pollinations.ai";

  async generateRouteVariants(request: RouteGenerationRequest): Promise<AIGeneratedRoute[]> {
    const prompt = this.buildRoutePrompt(request);
    
    try {
      console.log("Sending request to AI...");
      const response = await this.aiQuery(prompt, {
        model: "mistral",
        temperature: 0.8,
        system: "Ты эксперт по планированию маршрутов в Москве. Создавай разные варианты маршрутов с разным количеством мероприятий и временем.",
        json_response: false
      });

      console.log("AI Response:", response);
      return this.parseRouteResponse(response, request.events);
    } catch (error) {
      console.error("AI route generation failed:", error);
      return this.generateSmartRoutes(request.events, request.constraints);
    }
  }

  private buildRoutePrompt(request: RouteGenerationRequest): string {
    const eventsText = request.events.map((event, index) => 
      `${index + 1}. ${event.title} (${event.location}), ${event.time}, ${event.duration}мин, ${event.category}, популярность: ${event.popularity}%`
    ).join('\n');

    return `
Пользователь выбрал ${request.events.length} мероприятий в Москве. Создай 3 РАЗНЫХ варианта маршрута:

ВСЕ МЕРОПРИЯТИЯ:
${eventsText}

ОГРАНИЧЕНИЯ:
- Время начала: ${request.constraints.startTime}
- Время окончания: ${request.constraints.endTime}
- Максимальное общее время: ${Math.floor(request.constraints.maxTotalTime / 60)} часов

СОЗДАЙ 3 РАЗНЫХ ВАРИАНТА:
1. КОРОТКИЙ ИНТЕНСИВНЫЙ - 3-4 самых интересных мероприятия, общее время ~3-4 часа
2. СРЕДНИЙ СБАЛАНСИРОВАННЫЙ - 5-7 мероприятий разной длительности, общее время ~5-6 часов  
3. ПОЛНЫЙ ДЕНЬ - 8-10 мероприятий, охватывающих весь день, общее время ~7-8 часов

ФОРМАТ ОТВЕТА (JSON):
{
  "variants": [
    {
      "name": "Название варианта",
      "description": "Описание подхода",
      "selectedEvents": [1, 3, 5],
      "plannedTimes": ["10:00", "12:30", "15:00"],
      "travelTimes": [0, 25, 30],
      "advantages": ["преимущество 1", "преимущество 2"],
      "disadvantages": ["недостаток 1", "недостаток 2"],
      "score": 85
    }
  ]
}

ВАЖНО:
- Каждый вариант должен содержать РАЗНОЕ количество мероприятий
- Учитывай реальное время перемещения между локациями
- Оставляй время на отдых и питание
- Выбирай мероприятия разной длительности и категорий
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

  private parseRouteResponse(response: any, originalEvents: any[]): AIGeneratedRoute[] {
    try {
      let responseText = typeof response === 'string' ? response : JSON.stringify(response);
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response");
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const variants = parsed.variants;

      if (!variants || !Array.isArray(variants)) {
        throw new Error("Invalid variants format in AI response");
      }

      return variants.slice(0, 3).map((variant, index) => {
        const eventsWithOrder = this.applyEventSelection(originalEvents, variant.selectedEvents, variant.plannedTimes, variant.travelTimes);
        
        const totalTime = eventsWithOrder.reduce((total, event) => total + event.duration + event.travelTime, 0);
        const travelTime = eventsWithOrder.reduce((total, event) => total + event.travelTime, 0);

        return {
          id: `ai-${Date.now()}-${index}`,
          name: variant.name || this.getDefaultVariantName(index),
          description: variant.description || this.getDefaultDescription(index),
          events: eventsWithOrder,
          totalTime,
          travelTime,
          eventCount: eventsWithOrder.length,
          advantages: variant.advantages || this.getDefaultAdvantages(index),
          disadvantages: variant.disadvantages || this.getDefaultDisadvantages(index),
          score: variant.score || this.calculateRouteScore(eventsWithOrder, index)
        };
      });

    } catch (error) {
      console.error("Error parsing AI response:", error);
      throw new Error("Failed to parse AI response");
    }
  }

  private applyEventSelection(originalEvents: any[], selectedIndices: number[], plannedTimes: string[], travelTimes: number[]) {
    return selectedIndices.map((eventIndex, index) => {
      const originalEvent = originalEvents[eventIndex - 1];
      if (!originalEvent) return null;
      
      return {
        ...originalEvent,
        order: index,
        plannedTime: plannedTimes[index] || this.calculateTime("10:00", index),
        travelTime: travelTimes[index] || this.calculateTravelTime(originalEvents, index)
      };
    }).filter(Boolean);
  }

  private calculateTime(baseTime: string, offset: number): string {
    const [hours, minutes] = baseTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + (offset * 120); // +2 часа на каждое следующее событие
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  }

  private calculateTravelTime(events: any[], index: number): number {
    if (index === 0) return 0;
    return Math.floor(Math.random() * 25) + 15;
  }

  generateSmartRoutes(events: any[], constraints: any): AIGeneratedRoute[] {
    const sortedByPopularity = [...events].sort((a, b) => b.popularity - a.popularity);
    const sortedByDuration = [...events].sort((a, b) => a.duration - b.duration);
    const sortedByTime = [...events].sort((a, b) => a.time.localeCompare(b.time));

    return [
      this.createShortIntensiveRoute(sortedByPopularity, constraints),
      this.createMediumBalancedRoute(events, constraints),
      this.createFullDayRoute(events, constraints)
    ];
  }

  private createShortIntensiveRoute(events: any[], constraints: any): AIGeneratedRoute {
    const selectedEvents = events.slice(0, 4);
    const routeEvents = this.scheduleEvents(selectedEvents, constraints.startTime);

    return {
      id: "short-intensive",
      name: "Короткий интенсив",
      description: "Самые популярные мероприятия за 3-4 часа",
      events: routeEvents,
      totalTime: this.calculateTotalTime(routeEvents),
      travelTime: this.calculateTravelTimeTotal(routeEvents),
      eventCount: routeEvents.length,
      advantages: [
        "Максимум впечатлений за короткое время",
        "Только самые популярные места",
        "Минимум усталости"
      ],
      disadvantages: [
        "Мало мероприятий",
        "Не охватывает весь день"
      ],
      score: 88
    };
  }

  private createMediumBalancedRoute(events: any[], constraints: any): AIGeneratedRoute {
    const mixedEvents = this.selectDiverseEvents(events, 6);
    const routeEvents = this.scheduleEvents(mixedEvents, constraints.startTime);

    return {
      id: "medium-balanced",
      name: "Сбалансированный день",
      description: "Разнообразные мероприятия на 5-6 часов",
      events: routeEvents,
      totalTime: this.calculateTotalTime(routeEvents),
      travelTime: this.calculateTravelTimeTotal(routeEvents),
      eventCount: routeEvents.length,
      advantages: [
        "Хороший баланс времени и впечатлений",
        "Разнообразие активностей",
        "Есть время на отдых"
      ],
      disadvantages: [
        "Не все выбранные мероприятия",
        "Требует умеренной активности"
      ],
      score: 92
    };
  }

  private createFullDayRoute(events: any[], constraints: any): AIGeneratedRoute {
    const fullDayEvents = events.slice(0, 9);
    const routeEvents = this.scheduleEvents(fullDayEvents, constraints.startTime);

    return {
      id: "full-day",
      name: "Полный день",
      description: "Максимум мероприятий на 7-8 часов",
      events: routeEvents,
      totalTime: this.calculateTotalTime(routeEvents),
      travelTime: this.calculateTravelTimeTotal(routeEvents),
      eventCount: routeEvents.length,
      advantages: [
        "Охватывает больше всего мероприятий",
        "Насыщенный день",
        "Разнообразие впечатлений"
      ],
      disadvantages: [
        "Может быть утомительно",
        "Мало свободного времени",
        "Требует хорошей физической формы"
      ],
      score: 85
    };
  }

  private selectDiverseEvents(events: any[], count: number) {
    const categories = new Set();
    const result = [];
    
    for (const event of events) {
      if (result.length >= count) break;
      if (!categories.has(event.category) || Math.random() > 0.7) {
        result.push(event);
        categories.add(event.category);
      }
    }
    
    return result.slice(0, count);
  }

  private scheduleEvents(events: any[], startTime: string) {
    let currentTime = startTime;
    
    return events.map((event, index) => {
      const travelTime = index === 0 ? 0 : this.calculateTravelTime(events, index);
      
      const eventWithSchedule = {
        ...event,
        order: index,
        plannedTime: currentTime,
        travelTime
      };

      const [hours, minutes] = currentTime.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes + event.duration + travelTime;
      const newHours = Math.floor(totalMinutes / 60);
      const newMinutes = totalMinutes % 60;
      currentTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;

      return eventWithSchedule;
    });
  }

  private calculateTotalTime(events: any[]): number {
    return events.reduce((total, event) => total + event.duration + event.travelTime, 0);
  }

  private calculateTravelTimeTotal(events: any[]): number {
    return events.reduce((total, event) => total + event.travelTime, 0);
  }

  private getDefaultVariantName(index: number): string {
    const names = ["Короткий интенсив", "Сбалансированный день", "Полный день"];
    return names[index] || `Вариант ${index + 1}`;
  }

  private getDefaultDescription(index: number): string {
    const descriptions = [
      "3-4 самых популярных мероприятия за 3-4 часа",
      "5-7 разнообразных мероприятий на 5-6 часов",
      "8-10 мероприятий, охватывающих весь день (7-8 часов)"
    ];
    return descriptions[index] || "Оптимизированный маршрут";
  }

  private getDefaultAdvantages(index: number): string[] {
    const advantages = [
      ["Максимум впечатлений за короткое время", "Минимум усталости", "Только лучшие места"],
      ["Хороший баланс времени и впечатлений", "Разнообразие активностей", "Есть время на отдых"],
      ["Охватывает больше всего мероприятий", "Насыщенный день", "Максимум впечатлений"]
    ];
    return advantages[index] || ["Оптимизированный маршрут", "Удобное расписание"];
  }

  private getDefaultDisadvantages(index: number): string[] {
    const disadvantages = [
      ["Мало мероприятий", "Не охватывает весь день"],
      ["Не все выбранные мероприятия", "Требует умеренной активности"],
      ["Может быть утомительно", "Мало свободного времени", "Требует хорошей формы"]
    ];
    return disadvantages[index] || ["Учитывайте транспорт", "Планируйте с запасом времени"];
  }

  private calculateRouteScore(events: any[], variantIndex: number): number {
    const baseScores = [88, 92, 85];
    const timeEfficiency = Math.max(0, 100 - (events.reduce((sum, e) => sum + e.travelTime, 0) / events.length));
    const popularityScore = events.reduce((sum, e) => sum + e.popularity, 0) / events.length;
    
    return Math.min(98, baseScores[variantIndex] + Math.round((timeEfficiency + popularityScore) * 0.05));
  }
}

export const routeAI = new RouteAI();

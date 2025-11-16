"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Clock, Users, Route, Trash2, Plus, Share2, Download, ChevronRight, Star, Check, X, BarChart3, User, UserPlus, Loader2, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import toast from "react-hot-toast";
import { routeAI } from "@/lib/route-ai-service";

interface User {
  id: string;
  username: string;
  password: string;
  fullName: string;
  email: string;
  avatar: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  category: string;
  popularity: number;
  image?: string;
  price?: number;
  maxParticipants?: number;
}

interface PlannedEvent extends Event {
  plannedTime: string;
  travelTime: number;
  order: number;
  addedBy: string;
  isFixed?: boolean;
}

interface RouteVariant {
  id: string;
  name: string;
  events: PlannedEvent[];
  totalTime: number;
  travelTime: number;
  eventCount: number;
  score: number;
  description: string;
  advantages: string[];
  disadvantages: string[];
}

interface GroupMember {
  user: User;
  isActive: boolean;
}

interface RouteGenerationStep {
  title: string;
  description: string;
  duration: number;
}

interface RouteStats {
  totalEvents: number;
  totalTime: number;
  travelTime: number;
  efficiency: number;
}

const moscowLocations = [
  { address: "Красная площадь, 1", coordinates: [55.7539, 37.6208] },
  { address: "ул. Арбат, 25", coordinates: [55.7496, 37.5904] },
  { address: "Парк Горького, Крымский вал, 9", coordinates: [55.7280, 37.6030] },
  { address: "ВДНХ, проспект Мира, 119", coordinates: [55.8296, 37.6318] },
  { address: "Москва-Сити, Пресненская наб., 8", coordinates: [55.7496, 37.5394] }
];

export default function PlannerPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [plannedEvents, setPlannedEvents] = useState<PlannedEvent[]>([]);
  const [suggestedEvents, setSuggestedEvents] = useState<Event[]>([]);
  const [routeVariants, setRouteVariants] = useState<RouteVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [showGroupManager, setShowGroupManager] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAIRouteGenerating, setIsAIRouteGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [currentStepDescription, setCurrentStepDescription] = useState("");
  const [useAI, setUseAI] = useState(true);
  const router = useRouter();

  const mockEvents: Event[] = [
    {
      id: "1", title: "Концерт группы 'Ветер'", description: "Выступление популярной рок-группы", date: "2024-06-15", time: "14:00", duration: 90, location: "Красная площадь, 1", category: "music", popularity: 95, price: 1500
    },
    {
      id: "2", title: "Мастер-класс по танцам", description: "Обучение современным танцевальным направлениям", date: "2024-06-15", time: "16:00", duration: 60, location: "Парк Горького, Крымский вал, 9", category: "workshop", popularity: 80, price: 500
    },
    {
      id: "3", title: "Кинопоказ под открытым небом", description: "Просмотр фильма на большом экране", date: "2024-06-15", time: "19:00", duration: 90, location: "Парк Сокольники", category: "cinema", popularity: 85, price: 300
    },
    {
      id: "4", title: "Фуд-корт: Гастрономический тур", description: "Дегустация блюд от лучших шеф-поваров", date: "2024-06-15", time: "17:30", duration: 60, location: "ул. Арбат, 25", category: "food", popularity: 90, price: 800
    },
    {
      id: "5", title: "Выставка современного искусства", description: "Работы молодых художников и скульпторов", date: "2024-06-15", time: "15:00", duration: 45, location: "ЦДХ, Крымский вал, 10", category: "art", popularity: 75, price: 400
    },
    {
      id: "6", title: "Йога на рассвете", description: "Утренняя практика йоги", date: "2024-06-15", time: "11:00", duration: 60, location: "Воробьевы горы", category: "sport", popularity: 70, price: 0
    },
    {
      id: "7", title: "Экскурсия по Кремлю", description: "Знакомство с историей Московского Кремля", date: "2024-06-15", time: "10:00", duration: 120, location: "Московский Кремль", category: "culture", popularity: 92, price: 1000
    },
    {
      id: "8", title: "Прогулка на теплоходе", description: "Прогулка по Москве-реке с видом на достопримечательности", date: "2024-06-15", time: "13:00", duration: 90, location: "причал Устьинский", category: "recreation", popularity: 88, price: 600
    },
    {
      id: "9", title: "Шоппинг в ГУМе", description: "Посещение исторического торгового центра", date: "2024-06-15", time: "12:00", duration: 120, location: "Красная площадь, 3", category: "shopping", popularity: 78, price: 0
    },
    {
      id: "10", title: "Вечер в Большом театре", description: "Посещение балетного представления", date: "2024-06-15", time: "19:30", duration: 150, location: "Театральная площадь, 1", category: "theater", popularity: 96, price: 2000
    },
    {
      id: "11", title: "Фотосессия в Парке Горького", description: "Профессиональная фотосессия в iconic местах", date: "2024-06-15", time: "16:30", duration: 60, location: "Парк Горького", category: "photo", popularity: 82, price: 1200
    },
    {
      id: "12", title: "Дегустация в винном баре", description: "Знакомство с российскими винами", date: "2024-06-15", time: "20:00", duration: 90, location: "ул. Пятницкая, 15", category: "food", popularity: 85, price: 1500
    }
  ];

  const routeGenerationSteps: RouteGenerationStep[] = [
    { title: "Анализируем мероприятия...", description: "Оцениваем популярность и длительность", duration: 1000 },
    { title: "Формируем варианты...", description: "Создаем маршруты разной продолжительности", duration: 1200 },
    { title: "Оптимизируем время...", description: "Расставляем мероприятия в оптимальном порядке", duration: 900 },
    { title: "Учитываем логистику...", description: "Рассчитываем время перемещений", duration: 800 },
    { title: "Финальная проверка...", description: "Убеждаемся в реалистичности маршрутов", duration: 600 }
  ];

  useEffect(() => {
    const checkUser = () => {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          
          const savedEvents = localStorage.getItem(`planner_${parsedUser.id}`);
          if (savedEvents) {
            setPlannedEvents(JSON.parse(savedEvents));
          }
          
          loadGroupMembers(parsedUser.id);
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
    setSuggestedEvents(mockEvents);
  }, [router]);

  const loadGroupMembers = (currentUserId: string) => {
    try {
      const groupData = localStorage.getItem(`group_${currentUserId}`);
      if (groupData) {
        const members = JSON.parse(groupData);
        setGroupMembers(members);
      } else {
        const currentUserData = localStorage.getItem("user");
        if (currentUserData) {
          const currentUser = JSON.parse(currentUserData);
          const initialGroup = [{ user: currentUser, isActive: true }];
          setGroupMembers(initialGroup);
          localStorage.setItem(`group_${currentUserId}`, JSON.stringify(initialGroup));
        }
      }
    } catch (error) {
      console.error("Error loading group members:", error);
    }
  };

  const addFriendToGroup = (friendId: string) => {
    try {
      const allUsersData = localStorage.getItem("users");
      if (!allUsersData) return;

      const allUsers: User[] = JSON.parse(allUsersData);
      const friend = allUsers.find(u => u.id === friendId);
      
      if (!friend) {
        toast.error("Пользователь не найден");
        return;
      }

      if (groupMembers.some(member => member.user.id === friendId)) {
        toast.error("Этот пользователь уже в группе");
        return;
      }

      const updatedGroup = [...groupMembers, { user: friend, isActive: true }];
      setGroupMembers(updatedGroup);
      
      if (user) {
        localStorage.setItem(`group_${user.id}`, JSON.stringify(updatedGroup));
      }

      toast.success(`${friend.fullName} добавлен в группу!`);
    } catch (error) {
      console.error("Error adding friend to group:", error);
      toast.error("Ошибка при добавлении друга");
    }
  };

  const removeFriendFromGroup = (friendId: string) => {
    const updatedGroup = groupMembers.filter(member => member.user.id !== friendId);
    setGroupMembers(updatedGroup);
    
    if (user) {
      localStorage.setItem(`group_${user.id}`, JSON.stringify(updatedGroup));
      
      const updatedEvents = plannedEvents.filter(event => event.addedBy !== friendId);
      setPlannedEvents(updatedEvents);
      localStorage.setItem(`planner_${user.id}`, JSON.stringify(updatedEvents));
    }

    toast.success("Пользователь удален из группы");
  };

  const addEventToPlanner = (event: Event) => {
    if (!user) return;

    if (plannedEvents.find(planned => planned.id === event.id)) {
      toast.error("Это событие уже добавлено в ваш маршрут");
      return;
    }

    const travelTime = calculateTravelTime(event, plannedEvents[plannedEvents.length - 1]);
    const newPlannedEvent: PlannedEvent = {
      ...event,
      plannedTime: event.time,
      travelTime,
      order: plannedEvents.length,
      addedBy: user.id,
      isFixed: false
    };

    const updatedEvents = [...plannedEvents, newPlannedEvent];
    setPlannedEvents(updatedEvents);
    
    localStorage.setItem(`planner_${user.id}`, JSON.stringify(updatedEvents));

    toast.success(`"${event.title}" добавлено в маршрут!`);
  };

  const removeEventFromPlanner = (eventId: string) => {
    const eventToRemove = plannedEvents.find(event => event.id === eventId);
    const updatedEvents = plannedEvents.filter(event => event.id !== eventId);
    setPlannedEvents(updatedEvents);
    
    if (user) {
      localStorage.setItem(`planner_${user.id}`, JSON.stringify(updatedEvents));
    }

    if (eventToRemove) {
      toast.success(`"${eventToRemove.title}" удалено из маршрута`);
    }
  };

  const toggleEventFixed = (eventId: string) => {
    const updatedEvents = plannedEvents.map(event => 
      event.id === eventId ? { ...event, isFixed: !event.isFixed } : event
    );
    setPlannedEvents(updatedEvents);
    
    if (user) {
      localStorage.setItem(`planner_${user.id}`, JSON.stringify(updatedEvents));
    }
  };

  const calculateTravelTime = (current: Event, previous?: Event): number => {
    if (!previous) return 0;
    
    const getLocationComplexity = (location: string) => {
      if (location.includes("Красная площадь")) return 1;
      if (location.includes("Арбат")) return 2;
      if (location.includes("Парк Горького")) return 3;
      if (location.includes("ВДНХ")) return 4;
      return Math.floor(Math.random() * 5) + 1;
    };

    const currentComplexity = getLocationComplexity(current.location);
    const previousComplexity = getLocationComplexity(previous.location);
    const complexityDiff = Math.abs(currentComplexity - previousComplexity);
    
    return Math.floor(Math.random() * 20) + 10 + (complexityDiff * 3);
  };

  const calculateTotalTime = (events: PlannedEvent[]) => {
    return events.reduce((total, event) => total + event.duration + event.travelTime, 0);
  };

  const simulateRouteGeneration = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    for (let i = 0; i < routeGenerationSteps.length; i++) {
      const step = routeGenerationSteps[i];
      setCurrentStep(step.title);
      setCurrentStepDescription(step.description);
      setGenerationProgress(((i + 1) / routeGenerationSteps.length) * 100);
      await new Promise(resolve => setTimeout(resolve, step.duration));
    }

    setIsGenerating(false);
    setGenerationProgress(100);
  };

  const generateAIRoutes = async () => {
    if (plannedEvents.length < 3) {
      toast.error("Добавьте хотя бы 3 мероприятия для AI планирования");
      return;
    }

    setIsAIRouteGenerating(true);
    setCurrentStep("AI анализирует мероприятия...");
    setCurrentStepDescription("Создаем разные варианты маршрутов");
    
    try {
      const request = {
        events: plannedEvents.map(event => ({
          id: event.id,
          title: event.title,
          duration: event.duration,
          location: event.location,
          category: event.category,
          popularity: event.popularity,
          time: event.time
        })),
        constraints: {
          startTime: "09:00",
          endTime: "22:00", 
          maxTotalTime: 780 
        }
      };

      const aiGeneratedRoutes = await routeAI.generateRouteVariants(request);
      
      const convertedRoutes: RouteVariant[] = aiGeneratedRoutes.map(aiRoute => ({
        ...aiRoute,
        events: aiRoute.events.map(aiEvent => {
          const originalEvent = plannedEvents.find(e => e.id === aiEvent.id);
          if (!originalEvent) return aiEvent;
          
          return {
            ...originalEvent,
            plannedTime: aiEvent.plannedTime,
            travelTime: aiEvent.travelTime,
            order: aiEvent.order,
            addedBy: originalEvent.addedBy,
            isFixed: originalEvent.isFixed
          };
        }).filter(Boolean) as PlannedEvent[],
        eventCount: aiRoute.events.length
      }));

      setRouteVariants(convertedRoutes);
      setShowComparison(true);
      toast.success("🧠 AI создал 3 варианта маршрута!");

    } catch (error) {
      console.error("AI route generation failed:", error);
      toast.error("Не удалось сгенерировать маршруты через AI. Используем стандартную логику.");
      await generateRouteVariants();
    } finally {
      setIsAIRouteGenerating(false);
    }
  };

  const generateRouteVariants = async () => {
    if (plannedEvents.length < 2) {
      if (plannedEvents.length === 1) {
        toast.success("Событие добавлено! Добавьте еще события для построения маршрута");
      }
      return;
    }

    await simulateRouteGeneration();

    const variants: RouteVariant[] = [
      generateShortRoute(plannedEvents),
      generateMediumRoute(plannedEvents),
      generateFullRoute(plannedEvents)
    ].filter(Boolean) as RouteVariant[];

    setRouteVariants(variants);
    setShowComparison(true);
    toast.success("Маршрут успешно сгенерирован!");
  };

  const generateShortRoute = (events: PlannedEvent[]): RouteVariant => {
    const shortEvents = [...events]
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 4)
      .map((event, index, array) => ({
        ...event,
        order: index,
        plannedTime: calculateTime("10:00", index),
        travelTime: index > 0 ? calculateTravelTime(event, array[index - 1]) : 0
      }));

    const totalTime = calculateTotalTime(shortEvents);
    const travelTime = shortEvents.reduce((total, event) => total + event.travelTime, 0);

    return {
      id: "short-route",
      name: "Короткий интенсив",
      events: shortEvents,
      totalTime,
      travelTime,
      eventCount: shortEvents.length,
      score: 85,
      description: "3-4 самых популярных мероприятия за 3-4 часа",
      advantages: [
        "Максимум впечатлений за короткое время",
        "Минимум усталости",
        "Только лучшие места"
      ],
      disadvantages: [
        "Мало мероприятий",
        "Не охватывает весь день"
      ]
    };
  };

  const generateMediumRoute = (events: PlannedEvent[]): RouteVariant => {
    const mediumEvents = [...events]
      .sort((a, b) => {
        const categoryBonus = new Set(events.map(e => e.category)).size / events.length;
        return (b.popularity * 0.7 + categoryBonus * 30) - (a.popularity * 0.7 + categoryBonus * 30);
      })
      .slice(0, 6)
      .map((event, index, array) => ({
        ...event,
        order: index,
        plannedTime: calculateTime("09:30", index),
        travelTime: index > 0 ? calculateTravelTime(event, array[index - 1]) : 0
      }));

    const totalTime = calculateTotalTime(mediumEvents);
    const travelTime = mediumEvents.reduce((total, event) => total + event.travelTime, 0);

    return {
      id: "medium-route",
      name: "Сбалансированный день",
      events: mediumEvents,
      totalTime,
      travelTime,
      eventCount: mediumEvents.length,
      score: 90,
      description: "5-6 разнообразных мероприятий на 5-6 часов",
      advantages: [
        "Хороший баланс времени и впечатлений",
        "Разнообразие активностей",
        "Есть время на отдых"
      ],
      disadvantages: [
        "Не все выбранные мероприятия",
        "Требует умеренной активности"
      ]
    };
  };

  const generateFullRoute = (events: PlannedEvent[]): RouteVariant => {
    const fullEvents = [...events]
      .slice(0, 9)
      .map((event, index, array) => ({
        ...event,
        order: index,
        plannedTime: calculateTime("09:00", index),
        travelTime: index > 0 ? calculateTravelTime(event, array[index - 1]) : 0
      }));

    const totalTime = calculateTotalTime(fullEvents);
    const travelTime = fullEvents.reduce((total, event) => total + event.travelTime, 0);

    return {
      id: "full-route",
      name: "Полный день",
      events: fullEvents,
      totalTime,
      travelTime,
      eventCount: fullEvents.length,
      score: 82,
      description: "8-9 мероприятий, охватывающих весь день",
      advantages: [
        "Охватывает больше всего мероприятий",
        "Насыщенный день",
        "Максимум впечатлений"
      ],
      disadvantages: [
        "Может быть утомительно",
        "Мало свободного времени",
        "Требует хорошей физической формы"
      ]
    };
  };

  const calculateTime = (baseTime: string, offset: number): string => {
    const [hours, minutes] = baseTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + (offset * 120);
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  };

  const handleGenerateRoutes = async () => {
    if (plannedEvents.length < 2) {
      toast.error("Добавьте хотя бы 2 мероприятия для построения маршрута");
      return;
    }

    if (useAI && plannedEvents.length >= 3) {
      await generateAIRoutes();
    } else {
      await generateRouteVariants();
    }
  };

  const selectVariant = (variantId: string) => {
    const variant = routeVariants.find(v => v.id === variantId);
    if (variant) {
      setPlannedEvents(variant.events);
      setSelectedVariant(variantId);
      if (user) {
        localStorage.setItem(`planner_${user.id}`, JSON.stringify(variant.events));
      }
      toast.success(`Выбран маршрут: ${variant.name}`);
    }
  };

  const shareRoute = () => {
    const routeText = `Мой маршрут по Москве:\n\n${plannedEvents.map((event, index) => 
      `${index + 1}. ${event.plannedTime} - ${event.title} (${event.location})`
    ).join('\n')}\n\nОбщее время: ${formatTime(calculateTotalTime(plannedEvents))}`;

    navigator.clipboard.writeText(routeText);
    toast.success("Маршрут скопирован в буфер обмена!");
  };

  const exportRoute = () => {
    const routeData = {
      title: `Маршрут по Москве - ${new Date().toLocaleDateString()}`,
      user: user?.fullName,
      events: plannedEvents.map(event => ({
        order: event.order + 1,
        time: event.plannedTime,
        title: event.title,
        location: event.location,
        duration: `${event.duration} мин`,
        travelTime: `${event.travelTime} мин`
      })),
      statistics: {
        totalEvents: plannedEvents.length,
        totalTime: formatTime(calculateTotalTime(plannedEvents)),
        totalTravelTime: formatTime(plannedEvents.reduce((total, event) => total + event.travelTime, 0))
      }
    };

    const blob = new Blob([JSON.stringify(routeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `маршрут-москва-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Маршрут экспортирован в JSON!");
  };

  const clearAllEvents = () => {
    if (plannedEvents.length === 0) return;
    
    setPlannedEvents([]);
    setRouteVariants([]);
    setSelectedVariant(null);
    setShowComparison(false);
    if (user) {
      localStorage.removeItem(`planner_${user.id}`);
    }
    toast.success("Все события удалены из маршрута");
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      music: "bg-blue-100 text-blue-800 border-blue-200",
      workshop: "bg-green-100 text-green-800 border-green-200",
      cinema: "bg-purple-100 text-purple-800 border-purple-200",
      food: "bg-orange-100 text-orange-800 border-orange-200",
      art: "bg-pink-100 text-pink-800 border-pink-200",
      sport: "bg-teal-100 text-teal-800 border-teal-200",
      culture: "bg-red-100 text-red-800 border-red-200",
      recreation: "bg-indigo-100 text-indigo-800 border-indigo-200",
      shopping: "bg-amber-100 text-amber-800 border-amber-200",
      theater: "bg-rose-100 text-rose-800 border-rose-200",
      photo: "bg-cyan-100 text-cyan-800 border-cyan-200"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      music: "🎵", workshop: "🔧", cinema: "🎬", food: "🍴", art: "🎨", sport: "⚽",
      culture: "🏛️", recreation: "🚤", shopping: "🛍️", theater: "🎭", photo: "📸"
    };
    return icons[category as keyof typeof icons] || "📌";
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}ч ${mins}м` : `${mins}м`;
  };

  const getUserNameById = (userId: string) => {
    const member = groupMembers.find(m => m.user.id === userId);
    return member ? member.user.fullName : "Неизвестный";
  };

  const getRouteStats = (): RouteStats => {
    const totalTime = calculateTotalTime(plannedEvents);
    const travelTime = plannedEvents.reduce((total, event) => total + event.travelTime, 0);
    const eventTime = plannedEvents.reduce((total, event) => total + event.duration, 0);
    
    return {
      totalEvents: plannedEvents.length,
      totalTime,
      travelTime,
      efficiency: Math.round((eventTime / totalTime) * 100)
    };
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-68px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Загрузка планировщика...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const stats = getRouteStats();

  return (
    <div className="min-h-[calc(100vh-68px)] bg-background">
      {(isGenerating || isAIRouteGenerating) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                {isAIRouteGenerating ? (
                  <>
                    <Brain className="h-6 w-6 text-purple-600" />
                    AI строит маршруты
                  </>
                ) : (
                  <>
                    <Route className="h-6 w-6 text-primary" />
                    Генерируем маршрут по Москве
                  </>
                )}
              </CardTitle>
              <CardDescription className="text-center">
                {isAIRouteGenerating 
                  ? "Нейросеть создает 3 разных варианта маршрута"
                  : "Оптимизируем ваш маршрут для максимального комфорта"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Прогресс</span>
                  <span>{Math.round(generationProgress)}%</span>
                </div>
                <Progress value={generationProgress} className="h-2" />
              </div>
              
              <div className="text-center space-y-2">
                <div className="animate-pulse">
                  <Loader2 className="h-8 w-8 mx-auto text-primary mb-2 animate-spin" />
                </div>
                <p className="font-medium text-sm">{currentStep}</p>
                <p className="text-sm text-muted-foreground">{currentStepDescription}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs text-center">
                <div className="p-2 bg-blue-50 rounded-lg border">
                  <MapPin className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                  <span className="font-medium">{plannedEvents.length}</span>
                  <div className="text-muted-foreground">мероприятий</div>
                </div>
                <div className="p-2 bg-green-50 rounded-lg border">
                  <Clock className="h-4 w-4 mx-auto mb-1 text-green-600" />
                  <span className="font-medium">{formatTime(stats.totalTime)}</span>
                  <div className="text-muted-foreground">общее время</div>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg border">
                  <Users className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                  <span className="font-medium">{groupMembers.length}</span>
                  <div className="text-muted-foreground">участников</div>
                </div>
              </div>

              {isAIRouteGenerating && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-800 text-center">
                    🧠 AI создает 3 варианта: короткий, средний и полный день
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <section className="py-8 bg-muted/30">
        <div className="container px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-bold">Мой маршрут по Москве</h1>
              <p className="text-lg text-muted-foreground">
                Создайте идеальный маршрут по достопримечательностям Москвы, {user.fullName}
              </p>
              
              <div className="flex items-center gap-2 mt-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Группа: {groupMembers.length} участник(ов)
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowGroupManager(!showGroupManager)}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Управление группой
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 flex-wrap">
                {plannedEvents.length > 0 && (
                  <>
                    <Button variant="outline" onClick={shareRoute}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Поделиться
                    </Button>
                    <Button variant="outline" onClick={exportRoute}>
                      <Download className="h-4 w-4 mr-2" />
                      Экспорт
                    </Button>
                    <Button variant="outline" onClick={clearAllEvents} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Очистить все
                    </Button>
                  </>
                )}
                <Button asChild>
                  <Link href="/events">
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить места
                  </Link>
                </Button>
              </div>

              {plannedEvents.length >= 2 && !showComparison && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useAI}
                        onChange={(e) => setUseAI(e.target.checked)}
                        className="w-4 h-4"
                        disabled={plannedEvents.length < 3}
                      />
                      <span className="flex items-center gap-1">
                        🧠 Использовать AI {plannedEvents.length < 3 && "(нужно 3+ мероприятий)"}
                      </span>
                    </label>
                  </div>
                  <Button 
                    onClick={handleGenerateRoutes}
                    disabled={isGenerating || isAIRouteGenerating}
                    className="flex-1"
                  >
                    {isAIRouteGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        AI строит маршруты...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        {useAI && plannedEvents.length >= 3 ? "AI Построить маршруты" : "Построить маршруты"}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {showGroupManager && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Управление группой</CardTitle>
                <CardDescription>
                  Добавьте друзей для совместного планирования маршрута
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Участники группы:</h4>
                    {groupMembers.map((member) => (
                      <div key={member.user.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{member.user.fullName}</p>
                            <p className="text-sm text-muted-foreground">@{member.user.username}</p>
                          </div>
                        </div>
                        {member.user.id !== user.id && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => removeFriendFromGroup(member.user.id)}
                            className="text-destructive"
                          >
                            Удалить
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Добавить друга:</h4>
                    <div className="flex gap-2">
                      <select 
                        className="flex-1 border rounded-lg px-3 py-2"
                        onChange={(e) => {
                          if (e.target.value) {
                            addFriendToGroup(e.target.value);
                            e.target.value = "";
                          }
                        }}
                      >
                        <option value="">Выберите друга</option>
                        {(() => {
                          try {
                            const allUsersData = localStorage.getItem("users");
                            if (allUsersData) {
                              const allUsers: User[] = JSON.parse(allUsersData);
                              const availableFriends = allUsers.filter(
                                u => u.id !== user.id && !groupMembers.some(m => m.user.id === u.id)
                              );
                              
                              return availableFriends.map(friend => (
                                <option key={friend.id} value={friend.id}>
                                  {friend.fullName} (@{friend.username})
                                </option>
                              ));
                            }
                          } catch (error) {
                            console.error("Error loading users:", error);
                          }
                          return null;
                        })()}
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <div className="container px-4 py-8">
        {showComparison ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Варианты маршрутов по Москве</CardTitle>
                <CardDescription>
                  Выберите наиболее подходящий вариант. Каждый маршрут содержит разное количество мероприятий и длительность.
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              {routeVariants.map((variant) => (
                <Card 
                  key={variant.id} 
                  className={`relative cursor-pointer transition-all hover:shadow-lg border-2 ${
                    selectedVariant === variant.id ? "border-primary shadow-md" : "border-transparent"
                  }`}
                  onClick={() => selectVariant(variant.id)}
                >
                  {selectedVariant === variant.id && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <Badge className="bg-green-500">
                        <Check className="h-3 w-3 mr-1" />
                        Выбран
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg leading-tight">{variant.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-sm">
                            {variant.score}%
                          </Badge>
                          {variant.id.includes('ai') && (
                            <Badge className="bg-purple-500 text-white">
                              🧠 AI
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <CardDescription>{variant.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 pt-0">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{formatTime(variant.totalTime)}</div>
                        <div className="text-xs text-muted-foreground">общее время</div>
                      </div>
                      <div className="h-8 w-px bg-border"></div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{variant.eventCount}</div>
                        <div className="text-xs text-muted-foreground">мероприятий</div>
                      </div>
                      <div className="h-8 w-px bg-border"></div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{formatTime(variant.travelTime)}</div>
                        <div className="text-xs text-muted-foreground">в пути</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Преимущества:</div>
                        <div className="space-y-1">
                          {variant.advantages.map((advantage, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs text-green-600">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              {advantage}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium">Особенности:</div>
                        <div className="space-y-1">
                          {variant.disadvantages.map((disadvantage, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs text-amber-600">
                              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                              {disadvantage}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Маршрут:</div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {variant.events.map((event, index) => (
                          <div key={event.id} className="flex items-center gap-2 text-xs p-2 hover:bg-muted rounded-lg transition-colors">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                              event.isFixed ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20 text-foreground"
                            }`}>
                              {index + 1}
                            </div>
                            <span className="flex-1 truncate">{event.title}</span>
                            <span className="text-muted-foreground font-medium">{event.plannedTime}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      variant={selectedVariant === variant.id ? "default" : "outline"}
                      size="sm"
                    >
                      {selectedVariant === variant.id ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Выбран
                        </>
                      ) : (
                        "Выбрать этот маршрут"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-2 justify-center pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowComparison(false)}
              >
                <X className="h-4 w-4 mr-2" />
                Закрыть сравнение
              </Button>
              {selectedVariant && (
                <Button asChild>
                  <Link href="/events">
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить еще места
                  </Link>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-primary">{stats.totalEvents}</div>
                      <div className="text-sm text-muted-foreground">Мероприятий</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-primary">{formatTime(stats.totalTime)}</div>
                      <div className="text-sm text-muted-foreground">Общее время</div>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="text-2xl font-bold text-primary">{formatTime(stats.travelTime)}</div>
                      <div className="text-sm text-muted-foreground">В пути</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="text-2xl font-bold text-primary">{stats.efficiency}%</div>
                      <div className="text-sm text-muted-foreground">Эффективность</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Выбранные мероприятия</CardTitle>
                    <CardDescription>
                      {plannedEvents.length > 0 
                        ? `Вы выбрали ${plannedEvents.length} мероприятий. Постройте маршрут чтобы увидеть варианты.`
                        : "Добавьте мероприятия чтобы построить маршрут"
                      }
                    </CardDescription>
                  </div>
                  {plannedEvents.length > 1 && (
                    <div className="flex items-center gap-2">
                      <Button onClick={handleGenerateRoutes} variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Построить маршруты
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {plannedEvents.length === 0 ? (
                    <div className="text-center py-12">
                      <Route className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Маршрут пуст</h3>
                      <p className="text-muted-foreground mb-4">
                        Добавьте мероприятия из предложенных ниже или со страницы всех достопримечательностей
                      </p>
                      <Button asChild>
                        <Link href="/events">
                          <Plus className="h-4 w-4 mr-2" />
                          Найти мероприятия
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {plannedEvents
                        .sort((a, b) => a.order - b.order)
                        .map((event, index) => (
                          <div key={event.id} className="flex gap-4 group">
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                event.isFixed ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20 text-foreground"
                              }`}>
                                {index + 1}
                              </div>
                              {index < plannedEvents.length - 1 && (
                                <div className="w-0.5 h-8 bg-border mt-1 flex items-center justify-center">
                                  <div className="w-2 h-2 bg-muted-foreground rounded-full opacity-50"></div>
                                </div>
                              )}
                            </div>
                            
                            <Card className="flex-1 hover:shadow-md transition-shadow group-hover:border-primary/20">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-2 flex-1">
                                    <div className="flex items-start justify-between">
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                          <h4 className="font-semibold">{event.title}</h4>
                                          <Badge 
                                            variant="outline" 
                                            className={getCategoryColor(event.category)}
                                          >
                                            <span className="mr-1">{getCategoryIcon(event.category)}</span>
                                            {event.category}
                                          </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{event.description}</p>
                                      </div>
                                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => toggleEventFixed(event.id)}
                                          title={event.isFixed ? "Сделать гибким" : "Зафиксировать время"}
                                        >
                                          {event.isFixed ? "🔒" : "🔓"}
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeEventFromPlanner(event.id)}
                                          className="text-destructive hover:text-destructive"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2">
                                      <Badge variant="secondary" className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {event.plannedTime} ({event.duration} мин)
                                      </Badge>
                                      <Badge variant="secondary" className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        <span className="max-w-[120px] truncate">{event.location}</span>
                                      </Badge>
                                      <Badge variant="outline" className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        {getUserNameById(event.addedBy)}
                                      </Badge>
                                      {event.price !== undefined && event.price > 0 && (
                                        <Badge variant="outline" className="text-amber-600">
                                          {event.price} ₽
                                        </Badge>
                                      )}
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                        <span>{event.popularity}%</span>
                                      </div>
                                    </div>

                                    {event.travelTime > 0 && index < plannedEvents.length - 1 && (
                                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-800 flex items-center gap-2">
                                          <Route className="h-4 w-4" />
                                          Переход к следующему месту: ~{event.travelTime} минут
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Популярные места Москвы</CardTitle>
                  <CardDescription>
                    Рекомендуемые мероприятия и достопримечательности
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {suggestedEvents
                    .filter(event => !plannedEvents.find(planned => planned.id === event.id))
                    .slice(0, 3)
                    .map((event) => (
                      <Card key={event.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => addEventToPlanner(event)}>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <h4 className="font-semibold text-sm leading-tight">{event.title}</h4>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span>{event.popularity}%</span>
                              </div>
                            </div>
                            
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{event.time} ({event.duration} мин)</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <Badge className={getCategoryColor(event.category)}>
                                {getCategoryIcon(event.category)} {event.category}
                              </Badge>
                              {event.price !== undefined && (
                                <span className="text-xs font-medium">
                                  {event.price > 0 ? `${event.price} ₽` : "Бесплатно"}
                                </span>
                              )}
                            </div>

                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                addEventToPlanner(event);
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Добавить в маршрут
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/events">
                      Все мероприятия
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Советы для планирования</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                    <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Выбирайте 10-15 понравившихся мероприятий для лучшего выбора маршрутов</span>
                  </div>
                  <div className="flex items-start gap-2 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                    <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>AI создаст 3 варианта: короткий (3-4 ч), средний (5-6 ч) и полный день (7-8 ч)</span>
                  </div>
                  <div className="flex items-start gap-2 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                    <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Учитывайте время на перемещение между локациями (15-40 минут)</span>
                  </div>
                  <div className="flex items-start gap-2 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                    <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Закрепляйте важные мероприятия, чтобы AI учел их в маршруте</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
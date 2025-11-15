"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Clock, Users, Route, Trash2, Plus, Share2, Download, ChevronRight, Star, Check, X, BarChart3, User, UserPlus, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import toast from "react-hot-toast";

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

// Реальные адреса Москвы с координатами для расчета маршрутов
const moscowLocations = [
  { address: "Красная площадь, 1", coordinates: [55.7539, 37.6208] },
  { address: "ул. Арбат, 25", coordinates: [55.7496, 37.5904] },
  { address: "Парк Горького, Крымский вал, 9", coordinates: [55.7280, 37.6030] },
  { address: "ВДНХ, проспект Мира, 119", coordinates: [55.8296, 37.6318] },
  { address: "Москва-Сити, Пресненская наб., 8", coordinates: [55.7496, 37.5394] },
  { address: "Центральный детский магазин, Театральный пр-д, 5", coordinates: [55.7600, 37.6190] },
  { address: "ГУМ, Красная площадь, 3", coordinates: [55.7547, 37.6218] },
  { address: "Большой театр, Театральная площадь, 1", coordinates: [55.7601, 37.6185] },
  { address: "Парк Зарядье, ул. Варварка, 6", coordinates: [55.7514, 37.6270] },
  { address: "Музей Москвы, Зубовский бульвар, 2", coordinates: [55.7360, 37.5950] }
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
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [currentStepDescription, setCurrentStepDescription] = useState("");
  const router = useRouter();

  // Mock данные событий для предложений с московскими адресами
  const mockEvents: Event[] = [
    {
      id: "1",
      title: "Концерт группы 'Ветер'",
      description: "Выступление популярной рок-группы на главной сцене",
      date: "2024-06-15",
      time: "14:00",
      duration: 90,
      location: "Красная площадь, 1",
      category: "music",
      popularity: 95,
      image: "/api/placeholder/400/200",
      price: 1500,
      maxParticipants: 5000
    },
    {
      id: "2",
      title: "Мастер-класс по танцам",
      description: "Обучение современным танцевальным направлениям",
      date: "2024-06-15",
      time: "16:00",
      duration: 60,
      location: "Парк Горького, Крымский вал, 9",
      category: "workshop",
      popularity: 80,
      image: "/api/placeholder/400/200",
      price: 500,
      maxParticipants: 30
    },
    {
      id: "3",
      title: "Кинопоказ под открытым небом",
      description: "Просмотр фильма на большом экране в вечерней атмосфере",
      date: "2024-06-15",
      time: "19:00",
      duration: 90,
      location: "Парк Сокольники, ул. Сокольнический вал, 1",
      category: "cinema",
      popularity: 85,
      image: "/api/placeholder/400/200",
      price: 300,
      maxParticipants: 200
    },
    {
      id: "4",
      title: "Фуд-корт: Гастрономический тур",
      description: "Дегустация блюд от лучших шеф-поваров фестиваля",
      date: "2024-06-15",
      time: "17:30",
      duration: 60,
      location: "ул. Арбат, 25",
      category: "food",
      popularity: 90,
      image: "/api/placeholder/400/200",
      price: 800
    },
    {
      id: "5",
      title: "Выставка современного искусства",
      description: "Работы молодых художников и скульпторов",
      date: "2024-06-15",
      time: "15:00",
      duration: 45,
      location: "ЦДХ, Крымский вал, 10",
      category: "art",
      popularity: 75,
      image: "/api/placeholder/400/200",
      price: 400,
      maxParticipants: 100
    },
    {
      id: "6",
      title: "Йога на рассвете",
      description: "Утренняя практика йоги для заряда энергии",
      date: "2024-06-15",
      time: "11:00",
      duration: 60,
      location: "Воробьевы горы, Университетская площадь, 1",
      category: "sport",
      popularity: 70,
      image: "/api/placeholder/400/200",
      price: 0,
      maxParticipants: 50
    }
  ];

  const routeGenerationSteps: RouteGenerationStep[] = [
    {
      title: "Анализируем локации...",
      description: "Определяем оптимальную последовательность посещения",
      duration: 1000
    },
    {
      title: "Рассчитываем маршруты...",
      description: "Строим пешеходные и транспортные маршруты",
      duration: 1200
    },
    {
      title: "Учитываем транспорт...",
      description: "Анализируем доступность метро и наземного транспорта",
      duration: 800
    },
    {
      title: "Проверяем время работы...",
      description: "Убеждаемся, что все места будут открыты",
      duration: 600
    },
    {
      title: "Оптимизируем последовательность...",
      description: "Создаем комфортный график посещения",
      duration: 900
    },
    {
      title: "Формируем варианты маршрутов...",
      description: "Готовим лучшие варианты для выбора",
      duration: 700
    }
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

    if (updatedEvents.length >= 2) {
      setTimeout(() => generateRouteVariants(), 500);
    }

    toast.success(`"${event.title}" добавлено в маршрут!`);
  };

  const removeEventFromPlanner = (eventId: string) => {
    const eventToRemove = plannedEvents.find(event => event.id === eventId);
    const updatedEvents = plannedEvents.filter(event => event.id !== eventId);
    setPlannedEvents(updatedEvents);
    
    if (user) {
      localStorage.setItem(`planner_${user.id}`, JSON.stringify(updatedEvents));
    }

    if (updatedEvents.length >= 2) {
      setTimeout(() => generateRouteVariants(), 500);
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

    if (updatedEvents.length >= 2) {
      setTimeout(() => generateRouteVariants(), 500);
    }
  };

  const calculateTravelTime = (current: Event, previous?: Event): number => {
    if (!previous) return 0;
    
    // Имитация расчета времени на основе "удаленности" адресов
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
    
    return Math.floor(Math.random() * 15) + 5 + (complexityDiff * 3);
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

  const generateTimeOptimizedVariant = (events: PlannedEvent[]): RouteVariant => {
    const fixedEvents = events.filter(event => event.isFixed);
    const flexibleEvents = events.filter(event => !event.isFixed);

    const optimizedEvents = [...fixedEvents, ...flexibleEvents].sort((a, b) => {
      const timeA = parseInt(a.time.replace(':', ''));
      const timeB = parseInt(b.time.replace(':', ''));
      return timeA - timeB;
    }).map((event, index, array) => ({
      ...event,
      order: index,
      travelTime: index > 0 ? calculateTravelTime(event, array[index - 1]) : 0
    }));

    const totalTime = calculateTotalTime(optimizedEvents);
    const travelTime = optimizedEvents.reduce((total, event) => total + event.travelTime, 0);

    return {
      id: "time-optimized",
      name: "Оптимальный по времени",
      events: optimizedEvents,
      totalTime,
      travelTime,
      eventCount: optimizedEvents.length,
      score: calculateRouteScore(optimizedEvents, 'time'),
      description: "Минимальное время ожидания между событиями",
      advantages: [
        "Минимальное время в пути",
        "Эффективное использование времени",
        "Оптимальная последовательность"
      ],
      disadvantages: [
        "Может не учитывать популярность мест",
        "Менее гибкий для спонтанных изменений"
      ]
    };
  };

  const generatePopularityOptimizedVariant = (events: PlannedEvent[]): RouteVariant => {
    const popularityOptimized = [...events].sort((a, b) => b.popularity - a.popularity)
      .map((event, index, array) => ({
        ...event,
        order: index,
        travelTime: index > 0 ? calculateTravelTime(event, array[index - 1]) : 0
      }));

    const totalTime = calculateTotalTime(popularityOptimized);
    const travelTime = popularityOptimized.reduce((total, event) => total + event.travelTime, 0);

    return {
      id: "popularity-optimized",
      name: "По популярности",
      events: popularityOptimized,
      totalTime,
      travelTime,
      eventCount: popularityOptimized.length,
      score: calculateRouteScore(popularityOptimized, 'popularity'),
      description: "Самые популярные события в начале дня",
      advantages: [
        "Начинается с самых интересных мест",
        "Учитывает рейтинги и отзывы",
        "Популярные места посещаются в лучшее время"
      ],
      disadvantages: [
        "Может быть больше времени в пути",
        "Пиковые часы посещения"
      ]
    };
  };

  const generateBalancedVariant = (events: PlannedEvent[]): RouteVariant => {
    const categoryOrder = ["music", "workshop", "food", "cinema", "art", "sport"];
    const balanced = [...events].sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a.category);
      const bIndex = categoryOrder.indexOf(b.category);
      return aIndex - bIndex;
    }).map((event, index, array) => ({
      ...event,
      order: index,
      travelTime: index > 0 ? calculateTravelTime(event, array[index - 1]) : 0
    }));

    const totalTime = calculateTotalTime(balanced);
    const travelTime = balanced.reduce((total, event) => total + event.travelTime, 0);

    return {
      id: "balanced",
      name: "Сбалансированный",
      events: balanced,
      totalTime,
      travelTime,
      eventCount: balanced.length,
      score: calculateRouteScore(balanced, 'balanced'),
      description: "Разнообразие активностей в течение дня",
      advantages: [
        "Разнообразие типов активностей",
        "Сбалансированная нагрузка",
        "Подходит для разных интересов"
      ],
      disadvantages: [
        "Не всегда оптимален по времени",
        "Может требовать больше перемещений"
      ]
    };
  };

  const calculateRouteScore = (events: PlannedEvent[], type: 'time' | 'popularity' | 'balanced'): number => {
    let score = 80; // Базовый балл
    
    if (type === 'time') {
      const totalTravelTime = events.reduce((sum, event) => sum + event.travelTime, 0);
      const avgTravelTime = totalTravelTime / Math.max(1, events.length - 1);
      const efficiency = Math.max(0, 100 - (avgTravelTime * 2));
      score += efficiency * 0.15;
    } else if (type === 'popularity') {
      const avgPopularity = events.reduce((sum, event) => sum + event.popularity, 0) / events.length;
      score += (avgPopularity - 80) * 0.2;
    } else {
      // balanced
      const categories = new Set(events.map(event => event.category));
      const diversityBonus = (categories.size / events.length) * 20;
      score += diversityBonus;
    }
    
    // Бонус за фиксированные события
    const fixedEventsCount = events.filter(event => event.isFixed).length;
    score += fixedEventsCount * 2;
    
    return Math.min(98, Math.round(score));
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
      generateTimeOptimizedVariant(plannedEvents),
      generatePopularityOptimizedVariant(plannedEvents),
      generateBalancedVariant(plannedEvents)
    ].filter(Boolean) as RouteVariant[];

    setRouteVariants(variants);
    setShowComparison(true);
    toast.success("Маршрут успешно сгенерирован!");
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
    const routeData = {
      title: `Маршрут по Москве от ${user?.fullName}`,
      events: plannedEvents.map(event => ({
        время: event.plannedTime,
        событие: event.title,
        адрес: event.location,
        длительность: `${event.duration} мин`
      })),
      totalTime: formatTime(calculateTotalTime(plannedEvents)),
      totalEvents: plannedEvents.length
    };

    const routeText = `Мой маршрут по Москве:\n\n${routeData.events.map((event, index) => 
      `${index + 1}. ${event.время} - ${event.событие} (${event.адрес})`
    ).join('\n')}\n\nОбщее время: ${routeData.totalTime}`;

    navigator.clipboard.writeText(routeText);
    toast.success("Маршрут скопирован в буфер обмена!");
  };

  const exportRoute = () => {
    const routeData = {
      title: `Маршрут по Москве - ${new Date().toLocaleDateString()}`,
      user: user?.fullName,
      group: groupMembers.map(m => m.user.fullName),
      events: plannedEvents.map(event => ({
        order: event.order + 1,
        time: event.plannedTime,
        title: event.title,
        location: event.location,
        duration: `${event.duration} мин`,
        travelTime: `${event.travelTime} мин`,
        category: event.category
      })),
      statistics: {
        totalEvents: plannedEvents.length,
        totalTime: formatTime(calculateTotalTime(plannedEvents)),
        totalTravelTime: formatTime(plannedEvents.reduce((total, event) => total + event.travelTime, 0)),
        efficiency: `${Math.round((plannedEvents.reduce((total, event) => total + event.duration, 0) / calculateTotalTime(plannedEvents)) * 100)}%`
      }
    };

    console.log("Экспорт маршрута:", routeData);
    
    // В реальном приложении здесь был бы экспорт в PDF или CSV
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
      sport: "bg-teal-100 text-teal-800 border-teal-200"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      music: "🎵",
      workshop: "🔧",
      cinema: "🎬",
      food: "🍴",
      art: "🎨",
      sport: "⚽"
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
      {/* Анимация генерации маршрута */}
      {isGenerating && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Route className="h-6 w-6 text-primary" />
                Генерируем маршрут по Москве
              </CardTitle>
              <CardDescription className="text-center">
                Оптимизируем ваш маршрут для максимального комфорта
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
                  <div className="text-muted-foreground">локаций</div>
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
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
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
                  {plannedEvents.length >= 2 && !showComparison && (
                    <Button onClick={generateRouteVariants}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Построить маршрут
                    </Button>
                  )}
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
                  Выберите наиболее подходящий вариант маршрута. Каждый вариант оптимизирован по разным параметрам.
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
                      <CardTitle className="text-lg leading-tight">{variant.name}</CardTitle>
                      <Badge variant="secondary" className="text-sm">
                        {variant.score}%
                      </Badge>
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
                        <div className="text-xs text-muted-foreground">мест</div>
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
                      <div className="text-sm text-muted-foreground">Мест</div>
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
                    <CardTitle>Маршрут по Москве</CardTitle>
                    <CardDescription>
                      {plannedEvents.length > 0 
                        ? selectedVariant 
                          ? `Выбранный маршрут: ${routeVariants.find(v => v.id === selectedVariant)?.name}`
                          : "Оптимальная последовательность посещения мест" 
                        : "Добавьте места чтобы построить маршрут"}
                    </CardDescription>
                  </div>
                  {plannedEvents.length > 1 && (
                    <Button onClick={generateRouteVariants} variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Построить маршрут
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {plannedEvents.length === 0 ? (
                    <div className="text-center py-12">
                      <Route className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Маршрут пуст</h3>
                      <p className="text-muted-foreground mb-4">
                        Добавьте места из предложенных ниже или со страницы всех достопримечательностей
                      </p>
                      <Button asChild>
                        <Link href="/events">
                          <Plus className="h-4 w-4 mr-2" />
                          Найти места
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
                    Рекомендуемые достопримечательности и мероприятия
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
                      Все достопримечательности
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Советы для Москвы</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                    <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Учитывайте пробки при планировании времени между локациями</span>
                  </div>
                  <div className="flex items-start gap-2 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                    <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Используйте метро для быстрого перемещения между районами</span>
                  </div>
                  <div className="flex items-start gap-2 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                    <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Начинайте маршрут с центральных достопримечательностей</span>
                  </div>
                  <div className="flex items-start gap-2 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                    <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Проверяйте время работы музеев и парков заранее</span>
                  </div>
                  <div className="flex items-start gap-2 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                    <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Бронируйте билеты онлайн для популярных мест</span>
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
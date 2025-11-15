"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Clock, Users, Route, Trash2, Plus, Share2, Download, ChevronRight, Star, Check, X, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

interface User {
  id: string;
  username: string;
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
}

interface PlannedEvent extends Event {
  plannedTime: string;
  travelTime: number;
  order: number;
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
}

export default function PlannerPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [plannedEvents, setPlannedEvents] = useState<PlannedEvent[]>([]);
  const [suggestedEvents, setSuggestedEvents] = useState<Event[]>([]);
  const [routeVariants, setRouteVariants] = useState<RouteVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const router = useRouter();

  // Mock данные событий для предложений
  const mockEvents: Event[] = [
    {
      id: "1",
      title: "Концерт группы 'Ветер'",
      description: "Выступление популярной рок-группы на главной сцене",
      date: "2024-06-15",
      time: "14:00",
      duration: 90,
      location: "Главная сцена",
      category: "music",
      popularity: 95,
      image: "/api/placeholder/400/200"
    },
    {
      id: "2",
      title: "Мастер-класс по танцам",
      description: "Обучение современным танцевальным направлениям",
      date: "2024-06-15",
      time: "16:00",
      duration: 60,
      location: "Палатка №2",
      category: "workshop",
      popularity: 80,
      image: "/api/placeholder/400/200"
    },
    {
      id: "3",
      title: "Кинопоказ под открытым небом",
      description: "Просмотр фильма на большом экране в вечерней атмосфере",
      date: "2024-06-15",
      time: "19:00",
      duration: 90,
      location: "Лужайка",
      category: "cinema",
      popularity: 85,
      image: "/api/placeholder/400/200"
    },
    {
      id: "4",
      title: "Фуд-корт: Гастрономический тур",
      description: "Дегустация блюд от лучших шеф-поваров фестиваля",
      date: "2024-06-15",
      time: "17:30",
      duration: 60,
      location: "Центральная площадь",
      category: "food",
      popularity: 90,
      image: "/api/placeholder/400/200"
    },
    {
      id: "5",
      title: "Выставка современного искусства",
      description: "Работы молодых художников и скульпторов",
      date: "2024-06-15",
      time: "15:00",
      duration: 45,
      location: "Галерея",
      category: "art",
      popularity: 75,
      image: "/api/placeholder/400/200"
    },
    {
      id: "6",
      title: "Йога на рассвете",
      description: "Утренняя практика йоги для заряда энергии",
      date: "2024-06-15",
      time: "11:00",
      duration: 60,
      location: "Лужайка",
      category: "sport",
      popularity: 70,
      image: "/api/placeholder/400/200"
    }
  ];

  useEffect(() => {
    // Проверяем наличие пользователя в localStorage
    const checkUser = () => {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          // Загружаем сохраненные события из localStorage
          const savedEvents = localStorage.getItem(`planner_${parsedUser.id}`);
          if (savedEvents) {
            setPlannedEvents(JSON.parse(savedEvents));
          }
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

  const addEventToPlanner = (event: Event) => {
    const travelTime = Math.floor(Math.random() * 20) + 10; // Mock время перемещения
    const newPlannedEvent: PlannedEvent = {
      ...event,
      plannedTime: event.time,
      travelTime,
      order: plannedEvents.length
    };

    const updatedEvents = [...plannedEvents, newPlannedEvent];
    setPlannedEvents(updatedEvents);
    
    // Сохраняем в localStorage
    if (user) {
      localStorage.setItem(`planner_${user.id}`, JSON.stringify(updatedEvents));
    }

    toast.success(`"${event.title}" добавлено в маршрут!`);
  };

  const removeEventFromPlanner = (eventId: string) => {
    const eventToRemove = plannedEvents.find(event => event.id === eventId);
    const updatedEvents = plannedEvents.filter(event => event.id !== eventId);
    setPlannedEvents(updatedEvents);
    
    // Сохраняем в localStorage
    if (user) {
      localStorage.setItem(`planner_${user.id}`, JSON.stringify(updatedEvents));
    }

    if (eventToRemove) {
      toast.success(`"${eventToRemove.title}" удалено из маршрута`);
    }
  };

  const calculateTotalTime = (events: PlannedEvent[]) => {
    return events.reduce((total, event) => total + event.duration + event.travelTime, 0);
  };

  const generateRouteVariants = () => {
    if (plannedEvents.length < 2) {
      toast.error("Добавьте хотя бы 2 события для генерации маршрутов");
      return;
    }

    const variants: RouteVariant[] = [];

    // Вариант 1: Оптимальный по времени
    const timeOptimized = [...plannedEvents].sort((a, b) => {
      const timeA = parseInt(a.time.replace(':', ''));
      const timeB = parseInt(b.time.replace(':', ''));
      return timeA - timeB;
    }).map((event, index) => ({
      ...event,
      order: index,
      travelTime: Math.floor(Math.random() * 15) + 5
    }));

    variants.push({
      id: "1",
      name: "Оптимальный по времени",
      events: timeOptimized,
      totalTime: calculateTotalTime(timeOptimized),
      travelTime: timeOptimized.reduce((total, event) => total + event.travelTime, 0),
      eventCount: timeOptimized.length,
      score: 95,
      description: "Минимальное время ожидания между событиями"
    });

    // Вариант 2: По популярности
    const popularityOptimized = [...plannedEvents].sort((a, b) => b.popularity - a.popularity)
      .map((event, index) => ({
        ...event,
        order: index,
        travelTime: Math.floor(Math.random() * 20) + 10
      }));

    variants.push({
      id: "2",
      name: "По популярности",
      events: popularityOptimized,
      totalTime: calculateTotalTime(popularityOptimized),
      travelTime: popularityOptimized.reduce((total, event) => total + event.travelTime, 0),
      eventCount: popularityOptimized.length,
      score: 88,
      description: "Самые популярные события в начале дня"
    });

    // Вариант 3: Сбалансированный
    const balanced = [...plannedEvents].sort((a, b) => {
      // Чередуем категории для разнообразия
      const categoryOrder = ["music", "workshop", "food", "cinema", "art", "sport"];
      const aIndex = categoryOrder.indexOf(a.category);
      const bIndex = categoryOrder.indexOf(b.category);
      return aIndex - bIndex;
    }).map((event, index) => ({
      ...event,
      order: index,
      travelTime: Math.floor(Math.random() * 18) + 8
    }));

    variants.push({
      id: "3",
      name: "Сбалансированный",
      events: balanced,
      totalTime: calculateTotalTime(balanced),
      travelTime: balanced.reduce((total, event) => total + event.travelTime, 0),
      eventCount: balanced.length,
      score: 92,
      description: "Разнообразие активностей в течение дня"
    });

    setRouteVariants(variants);
    setShowComparison(true);
    toast.success("Сгенерировано 3 варианта маршрутов!");
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
    const routeText = `Мой маршрут на фестивале: ${plannedEvents.map(e => e.title).join(' → ')}`;
    navigator.clipboard.writeText(routeText);
    toast.success("Маршрут скопирован в буфер обмена!");
  };

  const exportRoute = () => {
    const routeData = plannedEvents.map(event => ({
      время: event.plannedTime,
      событие: event.title,
      локация: event.location,
      длительность: `${event.duration} мин`
    }));
    console.log("Экспорт маршрута:", routeData);
    toast.success("Маршрут экспортирован!");
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
      music: "bg-blue-100 text-blue-800",
      workshop: "bg-green-100 text-green-800",
      cinema: "bg-purple-100 text-purple-800",
      food: "bg-orange-100 text-orange-800",
      art: "bg-pink-100 text-pink-800",
      sport: "bg-teal-100 text-teal-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}ч ${mins}м` : `${mins}м`;
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

  return (
    <div className="min-h-[calc(100vh-68px)] bg-background">
      {/* Header */}
      <section className="py-8 bg-muted/30">
        <div className="container px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-bold">Мой планировщик</h1>
              <p className="text-lg text-muted-foreground">
                Создайте идеальный маршрут по фестивалю, {user.fullName}
              </p>
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
                      Сравнить маршруты
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
                  Добавить события
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container px-4 py-8">
        {showComparison ? (
          // Режим сравнения маршрутов
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Сравнение маршрутов</CardTitle>
                <CardDescription>
                  Выберите наиболее подходящий вариант маршрута
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              {routeVariants.map((variant) => (
                <Card 
                  key={variant.id} 
                  className={`relative cursor-pointer transition-all hover:shadow-lg ${
                    selectedVariant === variant.id ? "ring-2 ring-primary" : ""
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
                  <CardHeader>
                    <CardTitle className="text-lg">{variant.name}</CardTitle>
                    <CardDescription>{variant.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary" className="text-sm">
                        Оценка: {variant.score}%
                      </Badge>
                      <div className="text-2xl font-bold text-primary">
                        {formatTime(variant.totalTime)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-semibold">{variant.eventCount}</div>
                        <div className="text-muted-foreground">Событий</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-semibold">{formatTime(variant.travelTime)}</div>
                        <div className="text-muted-foreground">В пути</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Маршрут:</div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {variant.events.map((event, index) => (
                          <div key={event.id} className="flex items-center gap-2 text-xs p-1 hover:bg-muted rounded">
                            <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                              {index + 1}
                            </div>
                            <span className="flex-1 truncate">{event.title}</span>
                            <span className="text-muted-foreground">{event.plannedTime}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      variant={selectedVariant === variant.id ? "default" : "outline"}
                    >
                      {selectedVariant === variant.id ? "Выбран" : "Выбрать этот маршрут"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-2 justify-center">
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
                    Добавить еще события
                  </Link>
                </Button>
              )}
            </div>
          </div>
        ) : (
          // Обычный режим просмотра маршрута
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Основной контент - Маршрут */}
            <div className="lg:col-span-2 space-y-6">
              {/* Статистика */}
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">{plannedEvents.length}</div>
                      <div className="text-sm text-muted-foreground">Событий</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {formatTime(calculateTotalTime(plannedEvents))}
                      </div>
                      <div className="text-sm text-muted-foreground">Общее время</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {formatTime(plannedEvents.reduce((total, event) => total + event.travelTime, 0))}
                      </div>
                      <div className="text-sm text-muted-foreground">В пути</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {plannedEvents.length > 0 ? "Готов" : "Пусто"}
                      </div>
                      <div className="text-sm text-muted-foreground">Статус</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Маршрут */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Ваш маршрут</CardTitle>
                    <CardDescription>
                      {plannedEvents.length > 0 
                        ? selectedVariant 
                          ? `Выбранный маршрут: ${routeVariants.find(v => v.id === selectedVariant)?.name}`
                          : "Оптимальная последовательность событий" 
                        : "Добавьте события чтобы построить маршрут"}
                    </CardDescription>
                  </div>
                  {plannedEvents.length > 1 && (
                    <Button onClick={generateRouteVariants} variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Сравнить маршруты
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {plannedEvents.length === 0 ? (
                    <div className="text-center py-12">
                      <Route className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Маршрут пуст</h3>
                      <p className="text-muted-foreground mb-4">
                        Добавьте события из предложенных ниже или со страницы всех событий
                      </p>
                      <Button asChild>
                        <Link href="/events">
                          <Plus className="h-4 w-4 mr-2" />
                          Найти события
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
                              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </div>
                              {index < plannedEvents.length - 1 && (
                                <div className="w-0.5 h-8 bg-border mt-1 flex items-center justify-center">
                                  <div className="w-2 h-2 bg-muted-foreground rounded-full opacity-50"></div>
                                </div>
                              )}
                            </div>
                            
                            <Card className="flex-1 hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-2 flex-1">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <h4 className="font-semibold">{event.title}</h4>
                                        <p className="text-sm text-muted-foreground">{event.description}</p>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeEventFromPlanner(event.id)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2">
                                      <Badge variant="secondary" className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {event.plannedTime} ({event.duration} мин)
                                      </Badge>
                                      <Badge variant="secondary" className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {event.location}
                                      </Badge>
                                      <Badge className={getCategoryColor(event.category)}>
                                        {event.category}
                                      </Badge>
                                    </div>

                                    {event.travelTime > 0 && index < plannedEvents.length - 1 && (
                                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-800 flex items-center gap-2">
                                          <Route className="h-4 w-4" />
                                          Переход к следующему событию: {event.travelTime} минут
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

            {/* Боковая панель - Предложенные события */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Рекомендуем посетить</CardTitle>
                  <CardDescription>
                    События которые могут вас заинтересовать
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {suggestedEvents
                    .filter(event => !plannedEvents.find(planned => planned.id === event.id))
                    .slice(0, 3)
                    .map((event) => (
                      <Card key={event.id} className="hover:shadow-md transition-shadow">
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
                                <span>{event.location}</span>
                              </div>
                            </div>

                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={() => addEventToPlanner(event)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Добавить
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/events">
                      Все события
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Советы по планированию */}
              <Card>
                <CardHeader>
                  <CardTitle>Советы по планированию</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-1.5"></div>
                    <span>Учитывайте время на перемещение между локациями</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-1.5"></div>
                    <span>Оставляйте перерывы между событиями</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-1.5"></div>
                    <span>Начинайте с самых важных для вас событий</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-1.5"></div>
                    <span>Проверяйте актуальное расписание</span>
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
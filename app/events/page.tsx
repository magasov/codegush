"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Clock, Users, Star, Filter, Search, Plus, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
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

export default function EventsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [plannedEvents, setPlannedEvents] = useState<PlannedEvent[]>([]);
  const router = useRouter();

const events: Event[] = [
  {
    id: "1",
    title: "Концерт группы 'Ветер'",
    description: "Выступление популярной рок-группы на главной сцене с новым альбомом",
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
    description: "Обучение современным танцевальным направлениям от профессиональных хореографов",
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
    description: "Просмотр фильма на большом экране в вечерней атмосфере с попкорном и напитками",
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
    description: "Дегустация блюд от лучших шеф-поваров фестиваля со всего мира",
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
    title: "Арт-инсталляция 'Свет и Тень'",
    description: "Интерактивная световая инсталляция от современных художников с VR-элементами",
    date: "2024-06-15",
    time: "15:00",
    duration: 120,
    location: "Арт-зона",
    category: "art",
    popularity: 75,
    image: "/api/placeholder/400/200"
  },
  {
    id: "6",
    title: "Йога на рассвете",
    description: "Утренняя практика йоги для заряда энергии на весь день с сертифицированным инструктором",
    date: "2024-06-16",
    time: "06:00",
    duration: 60,
    location: "Лужайка",
    category: "sport",
    popularity: 70,
    image: "/api/placeholder/400/200"
  },
  {
    id: "7",
    title: "DJ-сет 'Электронные вибрации'",
    description: "Зажигательный сет от лучших диджеев города на специально оборудованной площадке",
    date: "2024-06-15",
    time: "21:00",
    duration: 120,
    location: "Танцпол",
    category: "music",
    popularity: 88,
    image: "/api/placeholder/400/200"
  },
  {
    id: "8",
    title: "Воркшоп по каллиграфии",
    description: "Искусство красивого письма: от основ до продвинутых техник под руководством мастера",
    date: "2024-06-16",
    time: "11:00",
    duration: 90,
    location: "Творческая мастерская",
    category: "workshop",
    popularity: 72,
    image: "/api/placeholder/400/200"
  },
  {
    id: "9",
    title: "Кулинарный баттл шеф-поваров",
    description: "Соревнование между известными шефами с дегустацией блюд для зрителей",
    date: "2024-06-16",
    time: "13:00",
    duration: 75,
    location: "Кулинарная арена",
    category: "food",
    popularity: 92,
    image: "/api/placeholder/400/200"
  },
  {
    id: "10",
    title: "Уличный театр 'Карнавал масок'",
    description: "Яркое представление уличного театра с интерактивными элементами и костюмированным шествием",
    date: "2024-06-15",
    time: "18:30",
    duration: 60,
    location: "Центральная аллея",
    category: "art",
    popularity: 78,
    image: "/api/placeholder/400/200"
  },
  {
    id: "11",
    title: "Пробежка 'Здоровое утро'",
    description: "Групповая пробежка по территории парка с фитнес-инструктором и разминкой",
    date: "2024-06-16",
    time: "07:30",
    duration: 45,
    location: "Старт у главного входа",
    category: "sport",
    popularity: 65,
    image: "/api/placeholder/400/200"
  },
  {
    id: "12",
    title: "Ночное кино под звездами",
    description: "Показ культового фильма на большом экране с уютными пледами и горячими напитками",
    date: "2024-06-16",
    time: "22:00",
    duration: 120,
    location: "Вечерний амфитеатр",
    category: "cinema",
    popularity: 82,
    image: "/api/placeholder/400/200"
  }
];

const categories = [
  { value: "all", label: "Все категории" },
  { value: "music", label: "Музыка" },
  { value: "workshop", label: "Мастер-классы" },
  { value: "cinema", label: "Кино" },
  { value: "food", label: "Еда" },
  { value: "art", label: "Искусство" },
  { value: "sport", label: "Спорт" }
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
  }, [router]);

  const addEventToPlanner = (event: Event) => {
    if (plannedEvents.find(planned => planned.id === event.id)) {
      toast.error("Это событие уже добавлено в ваш маршрут");
      return;
    }

    const travelTime = Math.floor(Math.random() * 20) + 10; 
    const newPlannedEvent: PlannedEvent = {
      ...event,
      plannedTime: event.time,
      travelTime,
      order: plannedEvents.length
    };

    const updatedEvents = [...plannedEvents, newPlannedEvent];
    setPlannedEvents(updatedEvents);
    
    if (user) {
      localStorage.setItem(`planner_${user.id}`, JSON.stringify(updatedEvents));
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

    if (eventToRemove) {
      toast.success(`"${eventToRemove.title}" удалено из маршрута`);
    }
  };

  const isEventInPlanner = (eventId: string) => {
    return plannedEvents.some(event => event.id === eventId);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-68px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; 
  }

  return (
    <div className="min-h-[calc(100vh-68px)] bg-background">
      <section className="py-8 bg-muted/30">
        <div className="container px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-bold">События фестиваля</h1>
              <p className="text-lg text-muted-foreground">
                Добро пожаловать, {user.fullName}! Выберите события для вашего идеального маршрута.
              </p>
            </div>
            <div className="flex gap-2">
              {plannedEvents.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{plannedEvents.length} в маршруте</span>
                </div>
              )}
              <Button asChild>
                <Link href="/planner">
                  <Calendar className="h-4 w-4 mr-2" />
                  Мой планировщик
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 border-b">
        <div className="container px-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск событий..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.value)}
                  className="whitespace-nowrap"
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              Все события ({filteredEvents.length})
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>Сортировка: По популярности</span>
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">События не найдены</h3>
              <p className="text-muted-foreground">
                Попробуйте изменить параметры поиска или выбрать другую категорию
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => {
                const isInPlanner = isEventInPlanner(event.id);
                return (
                  <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
                        <img 
                          src={event.image} 
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-lg leading-tight">
                            {event.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {event.description}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground ml-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{event.popularity}%</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                          {categories.find(c => c.value === event.category)?.label}
                        </span>
                        {isInPlanner && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            В маршруте
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(event.date).toLocaleDateString('ru-RU')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{event.time} ({event.duration} мин)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{event.location}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        {isInPlanner ? (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => removeEventFromPlanner(event.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            В маршруте
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => addEventToPlanner(event)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Добавить в маршрут
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Users className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="container px-4">
          <Card>
            <CardContent className="p-8">
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <h2 className="text-2xl lg:text-3xl font-bold">
                  {plannedEvents.length > 0 ? "Маршрут готов к просмотру!" : "Готовы построить маршрут?"}
                </h2>
                <p className="text-muted-foreground">
                  {plannedEvents.length > 0 
                    ? `Вы добавили ${plannedEvents.length} событий. Перейдите в планировщик для оптимизации маршрута.`
                    : "Добавьте события в планировщик и наш алгоритм создаст оптимальный маршрут без временных конфликтов"
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button asChild size="lg">
                    <Link href="/planner">
                      {plannedEvents.length > 0 ? "Перейти в планировщик" : "Начать планирование"}
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/">
                      На главную
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
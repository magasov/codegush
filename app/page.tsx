"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Clock, Users, Route, Star } from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: <Route className="h-6 w-6" />,
      title: "Умные маршруты",
      description: "Автоматическое построение оптимальных путей между событиями"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Без конфликтов",
      description: "Все временные промежутки учитывают перемещение между локациями"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Карта фестиваля",
      description: "Визуализация вашего маршрута на интерактивной карте"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Групповое планирование",
      description: "Создавайте маршруты вместе с друзьями"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Гибкое расписание",
      description: "Несколько вариантов на выбор под разные предпочтения"
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Персональные рекомендации",
      description: "Система предлагает события по вашим интересам"
    }
  ];

  return (
    <div className="min-h-[calc(100vh-68px)] bg-background">
      <section className="relative py-20 lg:py-30">
        <div className="container px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                  Создайте свой
                  <span className="text-primary block">идеальный фестиваль</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                  Выбирайте события, а наш алгоритм построит оптимальные маршруты 
                  без временных конфликтов. Максимум впечатлений, минимум хлопот.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-lg px-8 py-4">
                  <Link href="/events">
                    Начать планирование
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4">
                  <Link href="/about">
                    Узнать больше
                  </Link>
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Без временных конфликтов</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Оптимальные маршруты</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <Card className="p-6 shadow-lg border-2">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl">Пример маршрута</CardTitle>
                  <CardDescription>Один из возможных вариантов вашего дня</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { time: "14:00-15:30", event: "Концерт группы 'Ветер'", location: "Главная сцена" },
                    { time: "16:00-17:00", event: "Мастер-класс по танцам", location: "Палатка №2" },
                    { time: "17:30-18:30", event: "Фуд-корт", location: "Центральная площадь" },
                    { time: "19:00-20:30", event: "Кинопоказ под открытым небом", location: "Лужайка" }
                  ].map((item, index) => (
                    <div key={index} className="flex gap-4 items-start">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        {index < 3 && <div className="w-0.5 h-8 bg-border mt-1"></div>}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{item.time}</div>
                        <div className="text-sm text-muted-foreground">{item.event}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {item.location}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold">Почему выбирают нас</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Все необходимое для идеального планирования фестивального дня в одном месте
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container px-4">
          <Card className="bg-primary text-primary-foreground border-0">
            <CardContent className="p-12">
              <div className="text-center space-y-6 max-w-2xl mx-auto">
                <h2 className="text-3xl lg:text-4xl font-bold">
                  Готовы создать свой идеальный день?
                </h2>
                <p className="text-xl text-primary-foreground/80">
                  Присоединяйтесь к тысячам посетителей, которые уже используют наш планировщик 
                  для лучшего фестивального опыта.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button asChild size="lg" variant="secondary" className="text-lg px-8">
                    <Link href="/events">
                      Начать бесплатно
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="secondary" className="text-lg px-8 border-primary-foreground ">
                    <Link href="/demo">
                      Смотреть демо
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
'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, Heart, Zap, Shield, Globe } from "lucide-react";

export default function About() {
  const values = [
    {
      icon: <Target className="h-6 w-6" />,
      title: "Наша миссия",
      description: "Сделать посещение фестивалей максимально комфортным и эффективным для каждого гостя"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Инновации",
      description: "Используем передовые алгоритмы для построения оптимальных маршрутов"
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Для людей",
      description: "Создаем продукт, который действительно решает проблемы посетителей"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Надежность",
      description: "Гарантируем точность расчетов и сохранность ваших данных"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Сообщество",
      description: "Объединяем любителей фестивалей в одном удобном пространстве"
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Доступность",
      description: "Делаем планирование доступным для всех, независимо от опыта"
    }
  ];

  const team = [
    {
      name: "Мухаммад Аушев",
      role: "Тимлидер",
      description: "Более 5 лет в IT-индустрии"
    },
    {
      name: "Льянов Ахмед",
      role: "Замтимлид",
      description: "Frontend разработчик"
    },
    {
      name: "Леймоев Анзор",
      role: "Разработчик C++",
      description: "Создает интуитивные программы"
    },
    {
      name: "Касиев Абдулла",
      role: ".NET Разработчик",
      description: "Знает все о фестивальной культуре"
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
                  О нашем
                  <span className="text-primary block">проекте</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                  Мы — команда энтузиастов, которая понимает, как сложно бывает 
                  спланировать идеальный фестивальный день. Наш сервис создан, 
                  чтобы вы могли наслаждаться музыкой и искусством, а не думать о логистике.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-lg px-8 py-4">
                  <Link href="/events">
                    Попробовать сейчас
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4">
                  <Link href="/contact">
                    Связаться с нами
                  </Link>
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Основано в 2024</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>5000+ пользователей</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <Card className="p-6 shadow-lg border-2">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl">Наша история</CardTitle>
                  <CardDescription>От идеи к реальному продукту</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { year: "2023", event: "Идея", description: "Поняли проблему на собственном опыте" },
                    { year: "2024 Q1", event: "Разработка", description: "Создали первый прототип" },
                    { year: "2024 Q2", event: "Запуск", description: "Вышли на рынок" },
                    { year: "Сейчас", event: "Рост", description: "Помогаем тысячам пользователей" }
                  ].map((item, index) => (
                    <div key={index} className="flex gap-4 items-start">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        {index < 3 && <div className="w-0.5 h-8 bg-border mt-1"></div>}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{item.year}</div>
                        <div className="text-sm text-muted-foreground">{item.event}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {item.description}
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
            <h2 className="text-3xl lg:text-4xl font-bold">Наши ценности</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Принципы, которые лежат в основе всего, что мы делаем
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {value.icon}
                    </div>
                    <CardTitle className="text-lg">{value.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {value.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold">Наша команда</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Талантливые люди, которые работают над тем, чтобы ваш фестивальный опыт был идеальным
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{member.name}</h3>
                  <p className="text-primary font-medium text-sm mb-2">{member.role}</p>
                  <p className="text-muted-foreground text-sm">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl lg:text-4xl font-bold mb-2">5000+</div>
              <div className="text-primary-foreground/80">Пользователей</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold mb-2">50+</div>
              <div className="text-primary-foreground/80">Фестивалей</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold mb-2">10000+</div>
              <div className="text-primary-foreground/80">Построенных маршрутов</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold mb-2">98%</div>
              <div className="text-primary-foreground/80">Довольных клиентов</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container px-4">
          <Card className="bg-card border-2">
            <CardContent className="p-12">
              <div className="text-center space-y-6 max-w-2xl mx-auto">
                <h2 className="text-3xl lg:text-4xl font-bold">
                  Готовы присоединиться?
                </h2>
                <p className="text-xl text-muted-foreground">
                  Начните планировать свой идеальный фестивальный день уже сегодня. 
                  Присоединяйтесь к сообществу осознанных посетителей.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button asChild size="lg" className="text-lg px-8">
                    <Link href="/events">
                      Начать бесплатно
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-lg px-8">
                    <Link href="/contact">
                      Связаться с нами
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
'use client';

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, MessageCircle, Mail, Clock, Users, Route, Calendar } from "lucide-react";

export default function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  const faqCategories = [
    {
      icon: <Route className="h-5 w-5" />,
      title: "Планирование маршрутов",
      questions: [
        {
          question: "Как работает алгоритм построения маршрутов?",
          answer: "Наш алгоритм учитывает множество факторов: время начала и окончания событий, расстояние между локациями, время на перемещение, ваши предпочтения и приоритеты. Система автоматически исключает временные конфликты и строит оптимальный путь."
        },
        {
          question: "Можно ли редактировать автоматически созданный маршрут?",
          answer: "Да, конечно! Вы можете вручную изменять порядок событий, добавлять или удалять активности. Система автоматически пересчитает временные промежутки и предупредит о возможных конфликтах."
        },
        {
          question: "Учитывается ли время на перемещение между сценами?",
          answer: "Да, мы используем точные данные о расстояниях между локациями и среднее время перемещения с учетом загруженности. Для каждого перехода закладывается дополнительное время."
        }
      ]
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      title: "Работа с расписанием",
      questions: [
        {
          question: "Как добавить событие в мое расписание?",
          answer: "Просто найдите нужное событие в каталоге и нажмите кнопку 'Добавить в мой план'. Событие автоматически появится в вашем расписании с учетом оптимального времени."
        },
        {
          question: "Можно ли создать несколько вариантов маршрута?",
          answer: "Да, вы можете создавать неограниченное количество вариантов маршрутов для разных дней или сценариев. Например, отдельный маршрут для утра и для вечера."
        },
        {
          question: "Что делать если события перекрываются по времени?",
          answer: "Система автоматически предупредит о конфликтах и предложит альтернативные варианты. Вы сможете выбрать приоритетное событие или найти замену конфликтующему."
        }
      ]
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Аккаунт и настройки",
      questions: [
        {
          question: "Нужно ли регистрироваться для использования сервиса?",
          answer: "Вы можете просматривать события и карту без регистрации, но для сохранения маршрутов, синхронизации между устройствами и доступа к персональным рекомендациям потребуется аккаунт."
        },
        {
          question: "Как синхронизировать мой маршрут между устройствами?",
          answer: "После регистрации все ваши маршруты автоматически сохраняются в облаке. Вы можете получить к ним доступ с любого устройства, войдя в свой аккаунт."
        },
        {
          question: "Можно ли делиться своими маршрутами с друзьями?",
          answer: "Да, вы можете поделиться ссылкой на свой маршрут или создать совместный маршрут с друзьями. Все участники смогут вносить изменения в реальном времени."
        }
      ]
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Технические вопросы",
      questions: [
        {
          question: "Работает ли приложение офлайн?",
          answer: "Основной функционал требует подключения к интернету. Однако вы можете сохранить свой финальный маршрут в виде PDF или добавить его в календарь телефона для офлайн-доступа."
        },
        {
          question: "Как часто обновляется информация о событиях?",
          answer: "Данные обновляются в реальном времени. При любых изменениях в расписании (отмена, перенос) вы получите уведомление, и ваш маршрут будет автоматически скорректирован."
        },
        {
          question: "Какие браузеры поддерживаются?",
          answer: "Сервис работает во всех современных браузерах: Chrome, Firefox, Safari, Edge. Рекомендуем использовать последние версии для лучшей производительности."
        }
      ]
    }
  ];

  const popularQuestions = [
    {
      question: "Сколько стоит использование сервиса?",
      answer: "Основной функционал полностью бесплатный. Премиум-функции, такие как расширенная аналитика и приоритетная поддержка, доступны по подписке."
    },
    {
      question: "Как восстановить доступ к аккаунту?",
      answer: "На странице входа нажмите 'Забыли пароль?' и следуйте инструкциям. Ссылка для восстановления будет отправлена на вашу электронную почту."
    },
    {
      question: "Можно ли импортировать расписание из других приложений?",
      answer: "Да, мы поддерживаем импорт из популярных календарных приложений и социальных сетей. Доступны форматы CSV, ICS и интеграция через API."
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
                  Часто задаваемые
                  <span className="text-primary block">вопросы</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                  Здесь вы найдете ответы на самые популярные вопросы 
                  о работе нашего сервиса планирования фестивальных маршрутов.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-lg px-8 py-4">
                  <Link href="/contact">
                    Задать вопрос
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4">
                  <Link href="/events">
                    Начать планирование
                  </Link>
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>Быстрые ответы</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Актуальная информация</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <Card className="p-6 shadow-lg border-2">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl">Не нашли ответ?</CardTitle>
                  <CardDescription>Мы всегда готовы помочь</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Электронная почта</div>
                      <div className="text-sm text-muted-foreground">support@festival.ru</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Онлайн-чат</div>
                      <div className="text-sm text-muted-foreground">Круглосуточная поддержка</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Время ответа</div>
                      <div className="text-sm text-muted-foreground">Обычно в течение 1 часа</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold">Популярные вопросы</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Самые частые вопросы от наших пользователей
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {popularQuestions.map((item, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleItem(index + 100)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-semibold text-lg">{item.question}</span>
                    {openItems.includes(index + 100) ? (
                      <ChevronUp className="h-5 w-5 text-primary" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  {openItems.includes(index + 100) && (
                    <div className="px-6 pb-6">
                      <div className="border-t pt-4">
                        <p className="text-muted-foreground leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold">Все вопросы по категориям</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Найдите ответы в соответствующих разделах
            </p>
          </div>

          <div className="space-y-8">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {category.icon}
                  </div>
                  <h3 className="text-2xl font-bold">{category.title}</h3>
                </div>
                
                <div className="grid gap-4">
                  {category.questions.map((item, itemIndex) => {
                    const globalIndex = categoryIndex * 10 + itemIndex;
                    return (
                      <Card key={itemIndex} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-0">
                          <button
                            onClick={() => toggleItem(globalIndex)}
                            className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                          >
                            <span className="font-semibold text-lg pr-4">{item.question}</span>
                            {openItems.includes(globalIndex) ? (
                              <ChevronUp className="h-5 w-5 text-primary flex-shrink-0" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            )}
                          </button>
                          {openItems.includes(globalIndex) && (
                            <div className="px-6 pb-6">
                              <div className="border-t pt-4">
                                <p className="text-muted-foreground leading-relaxed">
                                  {item.answer}
                                </p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container px-4">
          <div className="text-center space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Остались вопросы?
            </h2>
            <p className="text-xl text-primary-foreground/80">
              Наша команда поддержки всегда готова помочь вам 
              и ответить на любые вопросы
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8">
                <Link href="/contact">
                  Написать в поддержку
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Link href="/events">
                  Попробовать сервис
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
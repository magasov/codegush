"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { useState } from "react";

export default function Contacts() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь будет логика отправки формы
    console.log("Форма отправлена:", formData);
    // Сброс формы после отправки
    setFormData({ name: "", email: "", subject: "", message: "" });
    alert("Сообщение отправлено! Мы свяжемся с вами в ближайшее время.");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const contactInfo = [
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Телефон",
      content: "+7 (999) 123-45-67",
      description: "Ежедневно с 9:00 до 21:00"
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email",
      content: "support@festivalplanner.ru",
      description: "Отвечаем в течение 24 часов"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Адрес",
      content: "г. Москва, ул. Фестивальная, 15",
      description: "БЦ 'Арена', офис 305"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Часы работы",
      content: "Пн-Пт: 9:00-18:00",
      description: "Сб-Вс: техническая поддержка"
    }
  ];

  return (
    <div className="min-h-[calc(100vh-68px)] bg-background py-12">
      <div className="container px-4">
        {/* Заголовок */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
            Свяжитесь с нами
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Есть вопросы или предложения? Мы всегда рады помочь вам создать идеальный фестивальный опыт
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Контактная информация */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Наши контакты</h2>
              <p className="text-muted-foreground">
                Свяжитесь с нами любым удобным способом. Наша команда поддержки всегда готова помочь 
                с вопросами о планировании маршрутов, техническими проблемами или партнерскими предложениями.
              </p>
            </div>

            <div className="grid gap-6">
              {contactInfo.map((item, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg text-primary">
                        {item.icon}
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <p className="text-foreground">{item.content}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Дополнительная информация */}
            <Card>
              <CardHeader>
                <CardTitle>Часто задаваемые вопросы</CardTitle>
                <CardDescription>
                  Возможно, ответ на ваш вопрос уже есть в нашей базе знаний
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold">Как работает планировщик маршрутов?</h4>
                  <p className="text-sm text-muted-foreground">
                    Наш алгоритм автоматически строит оптимальные маршруты между событиями, учитывая время перемещения и ваши предпочтения.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Можно ли планировать с друзьями?</h4>
                  <p className="text-sm text-muted-foreground">
                    Да! Функция группового планирования позволяет создавать общие маршруты и синхронизировать расписания.
                  </p>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/faq">
                    Смотреть все вопросы
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Форма обратной связи */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Напишите нам</CardTitle>
                <CardDescription>
                  Заполните форму ниже, и мы свяжемся с вами в ближайшее время
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Имя *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Ваше имя"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Тема сообщения *
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="О чем вы хотите спросить?"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Сообщение *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Опишите ваш вопрос или предложение..."
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    <Send className="h-4 w-4 mr-2" />
                    Отправить сообщение
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Нажимая кнопку, вы соглашаетесь с нашей Политикой конфиденциальности
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* Экстренная поддержка */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Срочная поддержка
                </CardTitle>
                <CardDescription>
                  Для срочных вопросов во время фестиваля
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="font-semibold">Телефон горячей линии:</p>
                  <p className="text-lg text-primary">+7 (800) 123-45-67</p>
                  <p className="text-sm text-muted-foreground">
                    Работает 24/7 в дни проведения фестивалей
                  </p>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/support">
                    Техническая поддержка
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
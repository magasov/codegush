// components/footer.tsx
"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "./ui/button";
import { 
  MapPin, 
  Calendar, 
  Music, 
  Users,
  Mail,
  Instagram,
  Facebook,
  Youtube,
  Heart
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const festivalInfo = [
    {
      icon: <MapPin className="h-5 w-5" />,
      title: "Место проведения",
      description: "Парк Горького, Москва"
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      title: "Даты фестиваля",
      description: "15-17 августа 2024"
    },
    {
      icon: <Music className="h-5 w-5" />,
      title: "Более 100 артистов",
      description: "Музыка, искусство, спорт"
    }
  ];

  const quickLinks = [
    { name: "Расписание", href: "/schedule" },
    { name: "Карта фестиваля", href: "/map" },
    { name: "Артисты", href: "/artists" },
    { name: "Новости", href: "/news" },
    { name: "FAQ", href: "/faq" }
  ];

  const supportLinks = [
    { name: "Помощь", href: "/help" },
    { name: "Контакты", href: "/contact" },
    { name: "Для прессы", href: "/press" },
    { name: "Партнеры", href: "/partners" },
    { name: "Волонтерам", href: "/volunteers" }
  ];

  const socialLinks = [
    {
      icon: <Instagram className="h-5 w-5" />,
      href: "https://instagram.com",
      name: "Instagram"
    },
    {
      icon: <Facebook className="h-5 w-5" />,
      href: "https://facebook.com",
      name: "Facebook"
    },
    {
      icon: <Youtube className="h-5 w-5" />,
      href: "https://youtube.com",
      name: "YouTube"
    },
    {
      icon: <Mail className="h-5 w-5" />,
      href: "mailto:info@festival.ru",
      name: "Email"
    }
  ];

  return (
    <footer className="bg-card border-t">
      {/* Основной контент футера */}
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Информация о фестивале */}
         <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <Music className="h-6 w-6 text-white" />
                </div>
                <div>
                <span className="text-xl font-bold text-black">
                    PayFest
                </span>
                <p className="text-xs text-muted-foreground">Генератор маршрутов</p>
                </div>
            </Link>
            <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                Создайте свой идеальный фестивальный день. Наш планировщик поможет посетить 
                максимум событий без временных конфликтов.
            </p>
            </div>

          {/* Быстрые ссылки по фестивалю */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Фестиваль</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors flex items-center gap-2 group"
                  >
                    <div className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Информация о фестивале */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Информация</h3>
            <ul className="space-y-4">
              {festivalInfo.map((info, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="text-primary mt-0.5 bg-primary/10 p-1 rounded-lg">
                    {info.icon}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{info.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {info.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Поддержка и соцсети */}
          <div>
            {/* Социальные сети */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Мы в соцсетях</p>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <Button
                    key={social.name}
                    variant="outline"
                    size="icon"
                    asChild
                    className="h-10 w-10 rounded-lg border-2 hover:border-primary transition-all"
                  >
                    <Link 
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.name}
                    >
                      {social.icon}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Нижняя часть футера */}
      <div className="border-t bg-muted/30">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Копирайт */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>© {currentYear} PayFest. Все права защищены.</span>
            </div>

            {/* Правовые ссылки */}
            <div className="flex items-center gap-6 text-sm">
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Конфиденциальность
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Условия использования
              </Link>
              <Link
                href="/cookies"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
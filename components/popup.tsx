"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "@/app/api/auth-context";

interface PopupProps {
  type: "login" | "signup";
}

// Генерация случайного ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function Popup({ type }: PopupProps) {
  const isLogin = type === "login";
  const router = useRouter();
  const { handleLogin, handleRegister } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    
    if (isLogin) {
      // Логика входа
      const username = formData.get("username") as string;
      const password = formData.get("password") as string;

      // Проверяем существующего пользователя в localStorage
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const user = existingUsers.find((u: any) => 
        u.username === username && u.password === password
      );

      if (user) {
        toast.success("Вход успешен!");
        handleLogin(user);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error("Неверное имя пользователя или пароль");
      }
    } else {
      // Логика регистрации
      const userData = {
        id: generateId(),
        username: formData.get("username") as string,
        password: formData.get("password") as string,
        fullName: formData.get("fullName") as string,
        email: formData.get("email") as string,
        avatar: "",
      };

      // Проверяем, не существует ли уже пользователь с таким username или email
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const userExists = existingUsers.some((u: any) => 
        u.username === userData.username || u.email === userData.email
      );

      if (userExists) {
        toast.error("Пользователь с таким именем или email уже существует");
        return;
      }

      // Сохраняем нового пользователя
      const updatedUsers = [...existingUsers, userData];
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      toast.success("Регистрация успешна!");
      handleRegister(userData);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={isLogin ? "card" : "default"}>
          <p>{isLogin ? "Войти" : "Зарегистрироваться"}</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isLogin ? "Войти в аккаунт" : "Регистрация"}</DialogTitle>
          <DialogDescription>
            {isLogin
              ? "Введите ваше имя пользователя и пароль для входа в аккаунт"
              : "Создайте новый аккаунт. Заполните данные ниже."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            {!isLogin && (
              <>
                <div className="grid gap-3">
                  <Label htmlFor="fullName">Имя Фамилия</Label>
                  <Input id="fullName" name="fullName" placeholder="Иван Иванов" required />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="username">Имя пользователя</Label>
                  <Input id="username" name="username" placeholder="@ivanov" required />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
              </>
            )}
            {isLogin && (
              <div className="grid gap-3">
                <Label htmlFor="username">Имя пользователя</Label>
                <Input id="username" name="username" placeholder="@ivanov" required />
              </div>
            )}
            <div className="grid gap-3">
              <Label htmlFor="password">Пароль</Label>
              <Input id="password" name="password" type="password" required />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Отмена</Button>
            </DialogClose>
            <Button type="submit">{isLogin ? "Войти" : "Зарегистрироваться"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
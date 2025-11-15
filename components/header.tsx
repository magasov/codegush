"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import Popup from "@/components/popup";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuth } from "@/app/api/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LogOut, Settings, User } from "lucide-react";
import { toast } from "react-hot-toast";
import { Skeleton } from "./ui/skeleton";

export default function Header() {
  const { isAuth, user, handleLogout, isLoading } = useAuth();

  const handleLogoutWithToast = () => {
    setTimeout(() => {
      window.location.reload()
    }, 3000)
    toast.promise(
      new Promise((resolve) => {
        handleLogout();
        setTimeout(resolve, 1000);
      }),
      {
        loading: "Выход из системы...",
        success: "Вы успешно вышли из системы",
        error: "Ошибка при выходе",
      }
    );
  };

  return (
    <header className="bg-card sticky top-0 z-50 border-b">
      <div className="container flex items-center justify-between h-[68px]">
        <div className="flex items-center gap-8 px-4">
          <Link href="/" className="text-xl font-bold">
            PayFest
          </Link>
        </div>

        {isAuth ? (
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full p-0 hover:bg-secondary/80 transition-colors"
                >
                  <Avatar className="h-9 w-9 rounded-full">
                    {isLoading ? (
                      <Skeleton className="h-full w-full rounded-full" />
                    ) : (
                      <>
                        <AvatarImage
                          src={user?.avatar || ""}
                          className="object-cover rounded-full"
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {user?.fullName?.split(" ").map((n) => n[0]).join("") || "ФИ"}
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-64 rounded-lg p-2 shadow-lg border"
                align="end"
                sideOffset={10}
              >
                <DropdownMenuLabel className="p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.fullName || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem asChild>
                  <Link
                    href="/profile"
                    className="w-full flex items-center p-2 rounded-md hover:bg-accent cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Профиль</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/settings"
                    className="w-full flex items-center p-2 rounded-md hover:bg-accent cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Настройки</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  onClick={handleLogoutWithToast}
                  className="w-full flex items-center p-2 rounded-md hover:bg-accent cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Выйти</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Popup type="login" />
            <Popup type="signup" />
          </div>
        )}
      </div>
    </header>
  );
}
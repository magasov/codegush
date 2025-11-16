"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/api/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus, UserMinus, Route, X } from "lucide-react";
import toast from "react-hot-toast";

interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  avatar?: string;
}

interface Friend {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  status: "online" | "offline";
}

interface GroupRoute {
  id: string;
  name: string;
  participants: Friend[];
  createdAt: string;
}

export default function FriendsPage() {
  const router = useRouter();
  const { user: authUser } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [groupRoutes, setGroupRoutes] = useState<GroupRoute[]>([]);
  const [activeTab, setActiveTab] = useState<"friends" | "routes">("friends");
  const [newFriendName, setNewFriendName] = useState("");
  const [newFriendNickname, setNewFriendNickname] = useState("");

  useEffect(() => {
    const currentUser =
      authUser ||
      (typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("currentUser") || "null") ||
          JSON.parse(localStorage.getItem("user") || "null")
        : null);

    if (!currentUser) {
      router.push("/");
      return;
    }

    setUser(currentUser);

    if (typeof window === "undefined") return;

    // Загружаем друзей
    const storedFriends = localStorage.getItem(`friends_${currentUser.id}`);
    if (storedFriends) {
      setFriends(JSON.parse(storedFriends));
    } else {
      // Два локальных друга по умолчанию
      const defaultFriends: Friend[] = [
        {
          id: "friend-1",
          name: "Алексей",
          username: "alex",
          status: "online",
        },
        {
          id: "friend-2",
          name: "Мария",
          username: "masha",
          status: "offline",
        },
      ];
      setFriends(defaultFriends);
      localStorage.setItem(`friends_${currentUser.id}`, JSON.stringify(defaultFriends));
    }

    // Загружаем групповые маршруты
    const storedRoutes = localStorage.getItem(`groupRoutes_${currentUser.id}`);
    if (storedRoutes) {
      setGroupRoutes(JSON.parse(storedRoutes));
    }
  }, [authUser, router]);

  const saveFriends = (updated: Friend[]) => {
    setFriends(updated);
    if (user) {
      localStorage.setItem(`friends_${user.id}`, JSON.stringify(updated));
    }
  };

  const saveRoutes = (updated: GroupRoute[]) => {
    setGroupRoutes(updated);
    if (user) {
      localStorage.setItem(`groupRoutes_${user.id}`, JSON.stringify(updated));
    }
  };

  const handleAddFriend = () => {
    const name = newFriendName.trim();
    const nickname = newFriendNickname.trim();

    if (!name || !nickname) {
      toast.error("Введите имя и никнейм друга");
      return;
    }

    // Проверяем, нет ли уже друга с таким никнеймом
    if (friends.some(friend => friend.username === nickname)) {
      toast.error("Друг с таким никнеймом уже существует");
      return;
    }

    const newFriend: Friend = {
      id: `friend-${Date.now()}`,
      name,
      username: nickname,
      status: "offline",
    };

    const updated = [...friends, newFriend];
    saveFriends(updated);
    setNewFriendName("");
    setNewFriendNickname("");
    toast.success("Друг добавлен");
  };

  const handleRemoveFriend = (friendId: string) => {
    const friendToRemove = friends.find(f => f.id === friendId);
    if (!friendToRemove) return;

    const updated = friends.filter(friend => friend.id !== friendId);
    saveFriends(updated);
    
    // Также удаляем этого друга из всех групповых маршрутов
    const updatedRoutes = groupRoutes.map(route => ({
      ...route,
      participants: route.participants.filter(p => p.id !== friendId)
    })).filter(route => route.participants.length > 0); // Удаляем пустые маршруты
    
    saveRoutes(updatedRoutes);
    toast.success(`Друг ${friendToRemove.name} удален`);
  };

  const handleCreateGroupRoute = (friend: Friend) => {
    setActiveTab("routes");

    setGroupRoutes((prev) => {
      const existingRoutes = [...prev];

      // Ищем маршрут, где уже есть этот друг
      let targetRoute = existingRoutes.find((route) =>
        route.participants.some((p) => p.id === friend.id)
      );

      if (!targetRoute) {
        targetRoute = {
          id: `route-${Date.now()}`,
          name: `Маршрут с ${friend.name}`,
          participants: [friend],
          createdAt: new Date().toISOString(),
        };
        existingRoutes.unshift(targetRoute);
        toast.success(`Создан общий маршрут с ${friend.name}`);
      } else {
        // Если маршрут уже есть, просто убеждаемся, что друг включён
        if (!targetRoute.participants.some((p) => p.id === friend.id)) {
          targetRoute.participants = [...targetRoute.participants, friend];
        }
        toast.success(`Маршрут с ${friend.name} обновлён`);
      }

      const updatedRoutes = [...existingRoutes];
      saveRoutes(updatedRoutes);
      return updatedRoutes;
    });
  };

  const handleAddFriendToRoute = (routeId: string, friendId: string) => {
    const friend = friends.find((f) => f.id === friendId);
    if (!friend) return;

    const updatedRoutes = groupRoutes.map((route) => {
      if (route.id !== routeId) return route;

      if (route.participants.some((p) => p.id === friend.id)) {
        toast.error("Этот друг уже есть в маршруте");
        return route;
      }

      return {
        ...route,
        participants: [...route.participants, friend],
      };
    });

    saveRoutes(updatedRoutes);
    toast.success("Друг добавлен в маршрут");
  };

  const handleRemoveFriendFromRoute = (routeId: string, friendId: string) => {
    const updatedRoutes = groupRoutes.map((route) => {
      if (route.id !== routeId) return route;

      return {
        ...route,
        participants: route.participants.filter((p) => p.id !== friendId),
      };
    }).filter(route => route.participants.length > 0); // Удаляем пустые маршруты

    saveRoutes(updatedRoutes);
    toast.success("Друг удалён из маршрута");
  };

  const handleDeleteRoute = (routeId: string) => {
    const updatedRoutes = groupRoutes.filter(route => route.id !== routeId);
    saveRoutes(updatedRoutes);
    toast.success("Маршрут удален");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-68px)] bg-background">
      <section className="py-10">
        <div className="container space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                Друзья и групповые маршруты
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Соберите команду друзей и планируйте общие маршруты по фестивалю. Создавайте
                групповые планы в один клик прямо из списка друзей.
              </p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
              <div className="text-sm text-muted-foreground">Вы вошли как</div>
              <div className="font-medium">{user.fullName}</div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "friends" | "routes")} className="space-y-6">
            <TabsList>
              <TabsTrigger value="friends">Мои друзья</TabsTrigger>
              <TabsTrigger value="routes">Групповые маршруты</TabsTrigger>
            </TabsList>

            <TabsContent value="friends" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Список друзей</CardTitle>
                    <CardDescription>
                      Здесь отображаются друзья, с которыми вы можете создавать общие маршруты.
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="px-3 py-1">
                    Всего друзей: {friends.length}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {friends.map((friend) => (
                      <div
                        key={friend.id}
                        className="relative group rounded-xl border bg-card/60 p-4 hover:border-primary/60 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            {friend.avatar && <AvatarImage src={friend.avatar} alt={friend.name} />}
                            <AvatarFallback>
                              {friend.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium">{friend.name}</div>
                            <div className="text-xs text-muted-foreground">@{friend.username}</div>
                            <div className="mt-1">
                              <Badge
                                variant={friend.status === "online" ? "default" : "outline"}
                                className="text-xs"
                              >
                                {friend.status === "online" ? "Онлайн" : "Оффлайн"}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFriend(friend.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Кнопка создания общего маршрута при наведении */}
                        <div className="absolute inset-0 bg-background/90 flex items-center justify-center rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            onClick={() => handleCreateGroupRoute(friend)}
                            className="flex items-center gap-2"
                          >
                            <Route className="h-4 w-4" />
                            Создать общий маршрут
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2 text-sm uppercase tracking-wide text-muted-foreground">
                      <UserPlus className="h-4 w-4" />
                      Добавить нового друга
                    </h3>
                    <div className="flex flex-col md:flex-row gap-3">
                      <Input
                        placeholder="Имя и фамилия"
                        value={newFriendName}
                        onChange={(e) => setNewFriendName(e.target.value)}
                      />
                      <Input
                        placeholder="Никнейм (логин)"
                        value={newFriendNickname}
                        onChange={(e) => setNewFriendNickname(e.target.value)}
                      />
                      <Button onClick={handleAddFriend} className="md:w-auto">
                        Добавить
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="routes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Групповые маршруты</CardTitle>
                  <CardDescription>
                    Здесь появляются маршруты, которые вы создаёте с друзьями. Добавляйте и убирайте
                    участников в один клик.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {groupRoutes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Пока нет ни одного группового маршрута. Наведите курсор на друга и нажмите
                      «Создать общий маршрут», чтобы начать.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {groupRoutes.map((route) => (
                        <div
                          key={route.id}
                          className="border rounded-xl p-4 bg-card/60 flex flex-col gap-3"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Route className="h-4 w-4 text-primary" />
                                <h3 className="font-semibold">{route.name}</h3>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Создан: {new Date(route.createdAt).toLocaleString()}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">
                                Участников: {route.participants.length}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteRoute(route.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-1">
                            {route.participants.map((participant) => (
                              <div
                                key={participant.id}
                                className="flex items-center gap-1 rounded-full border px-2 py-1 text-xs bg-background/60"
                              >
                                <span>{participant.name}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveFriendFromRoute(route.id, participant.id)
                                  }
                                  className="ml-1 inline-flex items-center justify-center rounded-full hover:bg-destructive/10"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                            {route.participants.length === 0 && (
                              <span className="text-xs text-muted-foreground">
                                В маршруте пока нет участников
                              </span>
                            )}
                          </div>

                          {friends.length > 0 && (
                            <div className="flex flex-col md:flex-row md:items-center gap-3 mt-2">
                              <div className="text-xs text-muted-foreground">
                                Добавить друга в этот маршрут:
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {friends
                                  .filter(
                                    (friend) =>
                                      !route.participants.some((p) => p.id === friend.id)
                                  )
                                  .map((friend) => (
                                    <Button
                                      key={friend.id}
                                      variant="outline"
                                      size="sm"
                                      className="text-xs"
                                      onClick={() =>
                                        handleAddFriendToRoute(route.id, friend.id)
                                      }
                                    >
                                      <UserPlus className="h-3 w-3 mr-1" />
                                      {friend.name}
                                    </Button>
                                  ))}
                                {friends.filter(
                                  (friend) =>
                                    !route.participants.some((p) => p.id === friend.id)
                                ).length === 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    Все ваши друзья уже в этом маршруте
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between items-center text-xs text-muted-foreground pt-2">
            <div>
              Совет: создайте общий маршрут с друзьями, а затем откройте раздел «Маршрут» для
              детальной настройки событий.
            </div>
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/planner">Перейти к планировщику</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
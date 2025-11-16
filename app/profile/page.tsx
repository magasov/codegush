'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/app/api/auth-context";
import { toast } from "react-hot-toast";
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Edit, 
  Save, 
  X, 
  Settings,
  Bell,
  Shield,
  Download,
  Upload,
  Trash2,
  Music,
  Route
} from "lucide-react";

interface UserData {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  joinDate?: string;
  location?: string;
  bio?: string;
}

export default function Profile() {
  const { user: authUser, handleLogin } = useAuth();
  const [user, setUser] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = () => {
      setIsLoading(true);
      try {
        const currentUser = authUser || JSON.parse(localStorage.getItem('currentUser') || 'null');
        
        if (currentUser) {
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const userData = users.find((u: UserData) => u.id === currentUser.id) || currentUser;
          
          const completeUserData = {
            ...userData,
            joinDate: userData.joinDate || new Date().toISOString().split('T')[0],
            location: userData.location || 'Не указано',
            bio: userData.bio || 'Расскажите о себе...'
          };
          
          setUser(completeUserData);
          setEditedUser(completeUserData);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        toast.error('Ошибка загрузки данных профиля');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [authUser]);

  const handleSave = () => {
    if (!editedUser) return;

    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map((u: UserData) => 
        u.id === editedUser.id ? editedUser : u
      );
      
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      localStorage.setItem('currentUser', JSON.stringify(editedUser));
      handleLogin(editedUser);
      
      setUser(editedUser);
      setIsEditing(false);
      toast.success('Профиль успешно обновлен!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Ошибка сохранения профиля');
    }
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof UserData, value: string) => {
    if (editedUser) {
      setEditedUser(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const exportData = () => {
    if (!user) return;
    
    const dataStr = JSON.stringify(user, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `profile-${user.username}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Данные экспортированы');
  };

  const deleteAccount = () => {
    if (!user || !confirm('Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить.')) {
      return;
    }

    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.filter((u: UserData) => u.id !== user.id);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      localStorage.removeItem('currentUser');
      
      toast.success('Аккаунт успешно удален');
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Ошибка удаления аккаунта');
    }
  };

  const stats = [
    { label: 'Созданные маршруты', value: '12', icon: <Route className="h-4 w-4" /> },
    { label: 'Посещенные события', value: '47', icon: <Music className="h-4 w-4" /> },
    { label: 'Дней использования', value: '24', icon: <Calendar className="h-4 w-4" /> },
  ];

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-68px)] bg-background py-20">
        <div className="container px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-64 bg-muted rounded"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-48 bg-muted rounded"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-68px)] bg-background py-20">
        <div className="container px-4">
          <div className="text-center space-y-6 max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold">Профиль не найден</h1>
            <p className="text-xl text-muted-foreground">
              Пожалуйста, войдите в систему чтобы просмотреть свой профиль
            </p>
            <Button asChild size="lg">
              <Link href="/">
                На главную
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-68px)] bg-background py-8">
      <div className="container px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">Профиль</h1>
            <p className="text-muted-foreground mt-2">
              Управляйте вашими данными и настройками
            </p>
          </div>
          <div className="flex gap-3">
            {!isEditing ? (
              <>
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Редактировать
                </Button>
                <Button asChild variant="outline">
                  <Link href="/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Настройки
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={handleSave}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Сохранить
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Отмена
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
                <CardDescription>
                  Ваши персональные данные и контактная информация
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-lg bg-primary/10 text-primary">
                      {user.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid gap-3">
                          <Label htmlFor="fullName">Имя и фамилия</Label>
                          <Input
                            id="fullName"
                            value={editedUser?.fullName || ''}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                          />
                        </div>
                        <div className="grid gap-3">
                          <Label htmlFor="username">Имя пользователя</Label>
                          <Input
                            id="username"
                            value={editedUser?.username || ''}
                            onChange={(e) => handleInputChange('username', e.target.value)}
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h2 className="text-2xl font-bold">{user.fullName}</h2>
                        <p className="text-muted-foreground">@{user.username}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={editedUser?.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    ) : (
                      <p>{user.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="h-4 w-4" />
                      Дата регистрации
                    </Label>
                    <p>{new Date(user.joinDate || '').toLocaleDateString('ru-RU')}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <MapPin className="h-4 w-4" />
                      Местоположение
                    </Label>
                    {isEditing ? (
                      <Input
                        value={editedUser?.location || ''}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="Введите ваш город"
                      />
                    ) : (
                      <p>{user.location}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">О себе</Label>
                  {isEditing ? (
                    <textarea
                      className="w-full min-h-[80px] p-3 border rounded-lg resize-none"
                      value={editedUser?.bio || ''}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Расскажите о себе..."
                    />
                  ) : (
                    <p className="text-muted-foreground">{user.bio}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Статистика */}
            <Card>
              <CardHeader>
                <CardTitle>Статистика</CardTitle>
                <CardDescription>
                  Ваша активность и достижения
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        {stat.icon}
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Действия</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={exportData}
                >
                  <Download className="h-4 w-4" />
                  Экспорт данных
                </Button>
                <Button asChild variant="outline" className="w-full justify-start gap-2">
                  <Link href="/my-routes">
                    <Route className="h-4 w-4" />
                    Мои маршруты
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start gap-2">
                  <Link href="/settings">
                    <Settings className="h-4 w-4" />
                    Настройки
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Приватность</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span className="text-sm">Уведомления</span>
                  </div>
                  <div className="w-11 h-6 bg-muted rounded-full relative">
                    <div className="w-5 h-5 bg-primary rounded-full absolute top-0.5 left-0.5"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm">Публичный профиль</span>
                  </div>
                  <div className="w-11 h-6 bg-muted rounded-full relative">
                    <div className="w-5 h-5 bg-border rounded-full absolute top-0.5 right-0.5"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">
                  Опасная зона
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                  Эти действия нельзя отменить. Будьте осторожны.
                </p>
                <Button 
                  variant="destructive" 
                  className="w-full gap-2"
                  onClick={deleteAccount}
                >
                  <Trash2 className="h-4 w-4" />
                  Удалить аккаунт
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
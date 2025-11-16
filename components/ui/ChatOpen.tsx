// components/ui/AIChatButton.tsx
"use client";

import { useState, useEffect } from "react";
import { SiteContext } from "@/lib/global-ai-assistant";
import { AIChatModal } from "./AIChatModal";
import { MessageCircle } from "lucide-react";

export function AIChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [siteContext, setSiteContext] = useState<SiteContext>({
    currentPage: '/',
    userData: null,
    plannedEvents: [],
    currentRoute: [],
    groupMembers: []
  });

  useEffect(() => {
    const getUserData = () => {
      try {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
      } catch {
        return null;
      }
    };

    const getPlannedEvents = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          const events = localStorage.getItem(`planner_${user.id}`);
          return events ? JSON.parse(events) : [];
        }
      } catch {
        return [];
      }
      return [];
    };

    const getGroupMembers = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          const group = localStorage.getItem(`group_${user.id}`);
          return group ? JSON.parse(group) : [];
        }
      } catch {
        return [];
      }
      return [];
    };

    setSiteContext({
      currentPage: window.location.pathname,
      userData: getUserData(),
      plannedEvents: getPlannedEvents(),
      currentRoute: [],
      groupMembers: getGroupMembers()
    });
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 group"
        aria-label="Открыть AI помощник"
      >
        <MessageCircle className="w-6 h-6 transition-transform group-hover:scale-110" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
      </button>

      <AIChatModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        context={siteContext}
      />
    </>
  );
}
"use client";

import { usePathname } from "next/navigation";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideAsideRight = pathname.startsWith("/profile");

  return (
    <div className="flex gap-4 min-h-screen container mx-auto">
      <main className="flex-1 py-3">{children}</main>
    </div>
  );
}

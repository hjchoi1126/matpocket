"use client";

import BottomNav from "@/components/layout/BottomNav";
import { GeoNotifierProvider } from "@/components/features/GeoNotifierContext";
import GeoNotifierInner from "@/components/features/GeoNotifierInner";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-x-hidden bg-white shadow-sm">
      <div className="flex min-h-0 flex-1 flex-col pb-[calc(4rem+env(safe-area-inset-bottom))]">
        <GeoNotifierProvider>
          <GeoNotifierInner />
          {children}
          <BottomNav />
        </GeoNotifierProvider>
      </div>
    </div>
  );
}

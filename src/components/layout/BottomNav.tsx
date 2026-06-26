"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, Heart, MapPin, Settings, UtensilsCrossed } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "홈", icon: UtensilsCrossed },
  { href: "/map", label: "지도", icon: MapPin },
  { href: "/play", label: "플레이 🎮", icon: Gamepad2 },
  { href: "/saved", label: "저장소", icon: Heart },
  { href: "/settings", label: "설정", icon: Settings },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-gray-200 bg-white shadow-lg [padding-bottom:env(safe-area-inset-bottom)]">
      <div className="flex h-16 items-stretch justify-around px-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : href === "/play"
                ? pathname === "/play" || pathname.startsWith("/play/")
                : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 text-[10px] transition-colors sm:text-xs ${
                isActive
                  ? "text-primary"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon
                className="h-5 w-5"
                strokeWidth={isActive ? 2.5 : 2}
                fill={isActive && label === "저장소" ? "currentColor" : "none"}
                aria-hidden
              />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

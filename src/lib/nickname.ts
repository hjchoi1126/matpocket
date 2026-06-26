const NICKNAME_KEY = "matpocket_nickname";

export function GetLocalNickname(): string {
  if (typeof window === "undefined") {
    return "맛집러";
  }

  return localStorage.getItem(NICKNAME_KEY)?.trim() || "맛집러";
}

export function SetLocalNickname(name: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(NICKNAME_KEY, name.trim() || "맛집러");
}

const LOCAL_USER_ID_KEY = "matpocket_user_id";

export function GetLocalUserId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  const existingId = localStorage.getItem(LOCAL_USER_ID_KEY);
  if (existingId) {
    return existingId;
  }

  const newId = crypto.randomUUID();
  localStorage.setItem(LOCAL_USER_ID_KEY, newId);
  return newId;
}

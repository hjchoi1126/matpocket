const VOTER_TOKEN_KEY = "matpocket_voter_token";

export function GetVoterToken(): string {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = localStorage.getItem(VOTER_TOKEN_KEY);
  if (existing) return existing;

  const token = crypto.randomUUID();
  localStorage.setItem(VOTER_TOKEN_KEY, token);
  return token;
}

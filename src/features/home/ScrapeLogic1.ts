import type { ScrapeResult } from "@/types/place";

type ScrapeLogic1Result = {
  data?: ScrapeResult & { hint?: string };
  error?: string;
};

export async function ScrapeLogic1(url: string): Promise<ScrapeLogic1Result> {
  const response = await fetch("/api/scrape", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  const payload = (await response.json().catch(() => null)) as
    | (ScrapeResult & { hint?: string; error?: string })
    | null;

  if (!response.ok || !payload) {
    return {
      error: payload?.error ?? "링크 분석에 실패했습니다.",
    };
  }

  return { data: payload };
}

import { NextResponse } from "next/server";

type ScrapeRequestBody = {
  url?: string;
};

function ExtractMetaTag(html: string, key: string): string | null {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`,
      "i",
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return decodeHtmlEntities(match[1].trim());
    }
  }

  return null;
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function ExtractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match?.[1] ? decodeHtmlEntities(match[1].trim()) : null;
}

function GuessPlaceName(title: string | null, description: string | null): string {
  const source = title ?? description ?? "";

  const patterns = [
    /^(.+?)\s*[|:：\-–—]\s*.+$/,
    /^(.+?)\s+맛집/,
    /^(.+?)\s+카페/,
  ];

  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return source.split(/[|:：\-–—]/)[0]?.trim() || "이름 미확인 맛집";
}

function GuessAddress(description: string | null, title: string | null): string {
  const source = `${description ?? ""} ${title ?? ""}`;

  const roadMatch = source.match(
    /([가-힣]+(?:특별시|광역시|도)?\s+[가-힣]+(?:시|군|구)\s+[가-힣0-9\s\-]+(?:로|길|동)\s*\d*[^\s,|]*)/,
  );
  if (roadMatch?.[1]) {
    return roadMatch[1].trim();
  }

  const districtMatch = source.match(
    /([가-힣]+(?:특별시|광역시|도)?\s+[가-힣]+(?:시|군|구)\s+[가-힣0-9]+(?:동|읍|면|리))/,
  );
  if (districtMatch?.[1]) {
    return districtMatch[1].trim();
  }

  return "";
}

function GuessCategory(url: string, description: string | null): string {
  if (url.includes("place.map.kakao.com") || url.includes("kakao")) {
    return "카카오맵";
  }
  if (url.includes("naver") || url.includes("map.naver")) {
    return "네이버지도";
  }
  if (url.includes("instagram")) {
    return "인스타그램";
  }

  if (description?.includes("카페")) return "카페";
  if (description?.includes("맛집")) return "맛집";

  return "기타";
}

function IsValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  let body: ScrapeRequestBody;

  try {
    body = (await request.json()) as ScrapeRequestBody;
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const url = body.url?.trim();

  if (!url) {
    return NextResponse.json({ error: "링크를 입력해 주세요." }, { status: 400 });
  }

  if (!IsValidUrl(url)) {
    return NextResponse.json(
      { error: "http 또는 https 링크만 지원합니다." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; MatpocketBot/1.0; +https://matpocket.app)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "링크 페이지를 불러오지 못했습니다." },
        { status: 422 },
      );
    }

    const html = await response.text();
    const ogTitle = ExtractMetaTag(html, "og:title");
    const ogDescription = ExtractMetaTag(html, "og:description");
    const ogSiteName = ExtractMetaTag(html, "og:site_name");
    const pageTitle = ExtractTitle(html);

    const title = ogTitle ?? pageTitle;
    const description = ogDescription ?? ogSiteName ?? "";
    const place_name = GuessPlaceName(title, description);
    const address = GuessAddress(description, title);
    const category = GuessCategory(url, description);

    return NextResponse.json({
      place_name,
      address,
      category,
      link_url: url,
      hint: description || title || "",
    });
  } catch {
    return NextResponse.json(
      { error: "링크 분석 중 오류가 발생했습니다. 직접 입력해 주세요." },
      { status: 500 },
    );
  }
}

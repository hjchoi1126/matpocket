import { NextResponse } from "next/server";

const KAKAO_KEYWORD_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";

export async function GET(request: Request) {
  const apiKey = process.env.KAKAO_REST_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "카카오 REST API 키가 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim();
  const x = searchParams.get("x");
  const y = searchParams.get("y");

  if (!query) {
    return NextResponse.json(
      { error: "검색어를 입력해 주세요." },
      { status: 400 },
    );
  }

  const kakaoUrl = new URL(KAKAO_KEYWORD_URL);
  kakaoUrl.searchParams.set("query", query);
  kakaoUrl.searchParams.set("category_group_code", "FD6");
  kakaoUrl.searchParams.set("size", "15");

  if (x && y) {
    kakaoUrl.searchParams.set("x", x);
    kakaoUrl.searchParams.set("y", y);
    kakaoUrl.searchParams.set("sort", "distance");
  }

  const response = await fetch(kakaoUrl, {
    headers: {
      Authorization: `KakaoAK ${apiKey}`,
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      message?: string;
      msg?: string;
    } | null;
    const kakaoMessage = payload?.message ?? payload?.msg;

    let message = kakaoMessage ?? "맛집 검색에 실패했습니다.";

    if (response.status === 401) {
      message =
        kakaoMessage ??
        "카카오 API 인증에 실패했습니다. REST API 키를 확인해 주세요.";
    }

    if (response.status === 403) {
      message = [
        kakaoMessage ?? "카카오 로컬 API 호출 권한이 없습니다.",
        "확인: REST API 키가 지도 앱과 동일한 앱의 키인지, 제품 설정에서 '카카오 로컬'이 활성화되어 있는지 확인해 주세요.",
      ].join("\n");
    }

    return NextResponse.json({ error: message }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}

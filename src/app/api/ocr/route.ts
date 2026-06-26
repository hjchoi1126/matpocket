import { NextResponse } from "next/server";

const MOCK_STORE_NAMES = [
  "맛포켓식당",
  "홍대 곱창구이",
  "성수 브런치카페",
  "강남 한정식",
  "이태원 파스타",
  "종로 칼국수",
];

function PickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function FormatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function POST(request: Request) {
  let file: File | null = null;

  try {
    const formData = await request.formData();
    const uploaded = formData.get("file");

    if (uploaded instanceof File && uploaded.size > 0) {
      file = uploaded;
    }
  } catch {
    return NextResponse.json(
      { error: "파일 업로드 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  if (!file) {
    return NextResponse.json(
      { error: "영수증 이미지를 업로드해 주세요." },
      { status: 400 },
    );
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
  if (file.type && !allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "jpg, png, webp 형식의 이미지만 지원합니다." },
      { status: 400 },
    );
  }

  await new Promise((resolve) => setTimeout(resolve, 800));

  const daysAgo = Math.floor(Math.random() * 14);
  const visitDate = new Date();
  visitDate.setDate(visitDate.getDate() - daysAgo);

  return NextResponse.json({
    store_name: PickRandom(MOCK_STORE_NAMES),
    visit_date: FormatDate(visitDate),
    confidence: 0.85 + Math.random() * 0.12,
    mock: true,
    file_name: file.name,
  });
}

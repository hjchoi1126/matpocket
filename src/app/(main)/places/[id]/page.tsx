import PLACE_DETAIL_BASIC_01 from "@/features/places/PLACE_DETAIL_BASIC_01";

type PlaceDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PlaceDetailPage({ params }: PlaceDetailPageProps) {
  const { id } = await params;
  const placeId = Number(id);

  if (!Number.isFinite(placeId)) {
    return (
      <div className="flex flex-1 items-center justify-center py-20 text-sm text-gray-500">
        잘못된 맛집 ID입니다.
      </div>
    );
  }

  return <PLACE_DETAIL_BASIC_01 placeId={placeId} />;
}

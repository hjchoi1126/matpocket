export {};

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        LatLng: new (lat: number, lng: number) => kakao.maps.LatLng;
        Map: new (
          container: HTMLElement,
          options: { center: kakao.maps.LatLng; level: number },
        ) => kakao.maps.Map;
        Marker: new (options: {
          map?: kakao.maps.Map;
          position: kakao.maps.LatLng;
          image?: kakao.maps.MarkerImage;
        }) => kakao.maps.Marker;
        MarkerImage: new (
          src: string,
          size: kakao.maps.Size,
          options?: { offset?: kakao.maps.Point },
        ) => kakao.maps.MarkerImage;
        Size: new (width: number, height: number) => kakao.maps.Size;
        Point: new (x: number, y: number) => kakao.maps.Point;
      };
    };
  }

  namespace kakao.maps {
    interface LatLng {
      getLat(): number;
      getLng(): number;
    }

    interface Map {
      setCenter(latlng: LatLng): void;
      setLevel(level: number): void;
      relayout(): void;
    }

    interface Marker {
      setMap(map: Map | null): void;
      setPosition(position: LatLng): void;
      setImage(image: MarkerImage): void;
    }

    interface MarkerImage {}
    interface Size {}
    interface Point {}
  }
}

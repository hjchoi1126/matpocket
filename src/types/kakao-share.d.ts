export {};

declare global {
  interface Window {
    Kakao?: {
      init: (key: string) => void;
      isInitialized?: () => boolean;
      Share: {
        sendDefault: (settings: Record<string, unknown>) => void;
      };
    };
  }
}

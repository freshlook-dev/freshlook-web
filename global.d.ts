declare module 'swiper/css';
declare module '*.css';

type FbEventPayload = Record<string, string | number | boolean | null | string[] | undefined>
type FbqFunction = (action: 'track', event: string, data?: FbEventPayload) => void

declare global {
  interface Window {
    fbq?: FbqFunction;
  }
}

export {};

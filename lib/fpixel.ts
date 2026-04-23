type FbEventData = Record<string, string | number | boolean | null | string[] | undefined>

export const fbEvent = (event: string, data?: FbEventData) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', event, data)
  }
}

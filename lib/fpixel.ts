export const fbEvent = (event: string, data?: any) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', event, data)
  }
}
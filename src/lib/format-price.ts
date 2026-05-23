export function formatPriceCents(priceCents: number, language = 'ru'): string {
  const locale = language === 'kk' ? 'kk-KZ' : 'ru-RU'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'KZT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(priceCents / 100)
}

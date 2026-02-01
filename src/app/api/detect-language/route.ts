import { NextRequest, NextResponse } from 'next/server'

// Countries that should default to Spanish
const spanishCountries = [
  'AR', 'BO', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC', 'SV', 'GQ',
  'GT', 'HN', 'MX', 'NI', 'PA', 'PY', 'PE', 'PR', 'ES', 'UY', 'VE'
]

// Portuguese-speaking countries
const portugueseCountries = ['BR', 'PT', 'AO', 'MZ', 'GW', 'CV', 'ST', 'TL']

export async function GET(request: NextRequest) {
  try {
    // Try to get IP from various headers
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const cfConnectingIP = request.headers.get('cf-connecting-ip')

    const ip = cfConnectingIP || realIP || forwardedFor?.split(',')[0] || null

    // If no IP (local development), return Spanish as default for Paraguay
    if (!ip || ip === '127.0.0.1' || ip === '::1') {
      return NextResponse.json({
        language: 'es',
        country: 'PY',
        source: 'default'
      })
    }

    // Use ip-api.com free service (50 req/min limit)
    const geoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode,country`)

    if (!geoResponse.ok) {
      return NextResponse.json({
        language: 'es',
        country: 'unknown',
        source: 'fallback'
      })
    }

    const geoData = await geoResponse.json()
    const countryCode = geoData.countryCode

    // Determine language based on country
    let language = 'en' // Default to English

    if (spanishCountries.includes(countryCode)) {
      language = 'es'
    } else if (portugueseCountries.includes(countryCode)) {
      // Portuguese speakers often understand Spanish, so show Spanish
      // Or you could add Portuguese support: language = 'pt'
      language = 'es'
    }

    return NextResponse.json({
      language,
      country: countryCode,
      countryName: geoData.country,
      source: 'geolocation'
    })
  } catch (error) {
    console.error('Language detection error:', error)
    // Default to Spanish (since the hostel is in Paraguay)
    return NextResponse.json({
      language: 'es',
      country: 'unknown',
      source: 'error-fallback'
    })
  }
}

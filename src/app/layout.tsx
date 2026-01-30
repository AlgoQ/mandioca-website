import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { I18nProvider } from "@/lib/i18n"
import { WhatsAppButton } from "@/components/ui/WhatsAppButton"

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Mandioca Hostel | Tu Hogar en Asunción, Paraguay",
  icons: {
    icon: "/favicon.svg",
  },
  description:
    "Reserva tu estadía en Mandioca Hostel - el hostel #1 de Asunción, Paraguay. Piscina, quincho, WiFi gratis y la mejor atmósfera. Book your stay at Mandioca Hostel - #1 rated hostel in Asunción, Paraguay.",
  keywords: [
    "hostel",
    "Asuncion hostel",
    "Paraguay hostel",
    "budget accommodation",
    "backpacker",
    "travel",
    "South America hostels",
    "Mandioca Hostel",
    "hostel con piscina",
    "hostel Asuncion",
  ],
  openGraph: {
    title: "Mandioca Hostel | Tu Hogar en Asunción, Paraguay",
    description:
      "El hostel #1 de Asunción con piscina, quincho y la mejor atmósfera. ¡Sentite como en casa!",
    type: "website",
    locale: "es_PY",
    alternateLocale: "en_US",
    siteName: "Mandioca Hostel",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${poppins.variable} font-sans antialiased overflow-x-hidden`}
      >
        <I18nProvider>
          <Header />
          <main className="overflow-x-hidden">{children}</main>
          <Footer />
          <WhatsAppButton />
        </I18nProvider>
      </body>
    </html>
  )
}

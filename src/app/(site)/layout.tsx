import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { I18nProvider } from "@/lib/i18n"
import { WhatsAppButton } from "@/components/ui/WhatsAppButton"
import CookieBanner from "@/components/CookieBanner"

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <I18nProvider>
      <Header />
      <main className="overflow-x-hidden">{children}</main>
      <Footer />
      <WhatsAppButton />
      <CookieBanner />
    </I18nProvider>
  )
}

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50 pt-[104px]">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#0A4843] hover:text-[#F7B03D] transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="bg-white rounded-md shadow-sm p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-[#0A4843] mb-8">
              Mandioca Hostel Policy and Conditions
            </h1>

            <div className="space-y-8 text-gray-700">
              {/* Cancellation Policy */}
              <section>
                <h2 className="text-xl font-semibold text-[#0A4843] mb-3">
                  Cancellation Policy
                </h2>
                <p className="leading-relaxed">
                  3 days before arrival. In case of a late cancellation or No Show,
                  you will be charged the first night of your stay.
                </p>
              </section>

              {/* Check-in/Check-out */}
              <section>
                <h2 className="text-xl font-semibold text-[#0A4843] mb-3">
                  Check-in / Check-out
                </h2>
                <ul className="space-y-2">
                  <li>Check in from 13:00 to 23:00</li>
                  <li>Check out before 12:00</li>
                </ul>
              </section>

              {/* Payment */}
              <section>
                <h2 className="text-xl font-semibold text-[#0A4843] mb-3">
                  Payment
                </h2>
                <ul className="space-y-2">
                  <li>Payment upon arrival by cash, credit and debit card</li>
                  <li>Taxes included</li>
                  <li>Breakfast not included</li>
                </ul>
              </section>

              {/* General */}
              <section>
                <h2 className="text-xl font-semibold text-[#0A4843] mb-3">
                  General
                </h2>
                <ul className="space-y-2">
                  <li>24 hours reception</li>
                  <li>No special conditions</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

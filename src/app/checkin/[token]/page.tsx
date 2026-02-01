'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import {
  User,
  Mail,
  Phone,
  Globe,
  Calendar,
  CreditCard,
  AlertCircle,
  Users,
  FileText,
  Camera,
  CheckCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { SignaturePad } from '@/components/ui/signature-pad'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Booking, HostelRule } from '@/types/database'

// Common nationalities for the hostel
const NATIONALITIES = [
  'Argentina', 'Australia', 'Brazil', 'Canada', 'Chile', 'Colombia', 'France',
  'Germany', 'Italy', 'Mexico', 'Netherlands', 'Paraguay', 'Peru', 'Spain',
  'United Kingdom', 'United States', 'Uruguay', 'Other'
]

interface BookingData extends Booking {
  checkin_token: string
  checkin_completed_at: string | null
}

type Step = 'loading' | 'info' | 'identity' | 'emergency' | 'rules' | 'signature' | 'complete' | 'error' | 'already_done'

export default function CheckInPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  // State
  const [step, setStep] = useState<Step>('loading')
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [rules, setRules] = useState<HostelRule[]>([])
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    // Identity
    nationality: '',
    dateOfBirth: '',
    passportNumber: '',
    passportExpiry: '',
    // Emergency contact
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: '',
    // Preferences
    dietaryRestrictions: '',
    specialRequests: '',
    arrivalTime: '',
    // Documents
    passportImage: null as File | null,
    signatureDataUrl: '',
    // Consents
    rulesAccepted: false,
    gdprConsent: false,
  })

  // Fetch booking data on mount
  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await fetch(`/api/checkin/${token}`)
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Invalid check-in link')
        }

        const data = await res.json()
        setBooking(data.booking)
        setRules(data.rules || [])

        // Check if already completed
        if (data.booking.checkin_completed_at) {
          setStep('already_done')
        } else {
          setStep('info')
        }
      } catch (err) {
        console.error('Error fetching booking:', err)
        setError(err instanceof Error ? err.message : 'Failed to load booking')
        setStep('error')
      }
    }

    if (token) {
      fetchBooking()
    }
  }, [token])

  const handleInputChange = (field: string, value: string | boolean | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File too large. Maximum size is 5MB.')
        return
      }
      handleInputChange('passportImage', file)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError('')

    try {
      // Create form data for file upload
      const submitData = new FormData()
      submitData.append('token', token)
      submitData.append('nationality', formData.nationality)
      submitData.append('dateOfBirth', formData.dateOfBirth)
      submitData.append('passportNumber', formData.passportNumber)
      submitData.append('passportExpiry', formData.passportExpiry)
      submitData.append('emergencyName', formData.emergencyName)
      submitData.append('emergencyPhone', formData.emergencyPhone)
      submitData.append('emergencyRelation', formData.emergencyRelation)
      submitData.append('dietaryRestrictions', formData.dietaryRestrictions)
      submitData.append('specialRequests', formData.specialRequests)
      submitData.append('arrivalTime', formData.arrivalTime)
      submitData.append('signatureDataUrl', formData.signatureDataUrl)
      submitData.append('rulesAccepted', String(formData.rulesAccepted))
      submitData.append('gdprConsent', String(formData.gdprConsent))

      if (formData.passportImage) {
        submitData.append('passportImage', formData.passportImage)
      }

      const res = await fetch(`/api/checkin/${token}`, {
        method: 'POST',
        body: submitData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Check-in failed')
      }

      setStep('complete')
    } catch (err) {
      console.error('Check-in error:', err)
      setError(err instanceof Error ? err.message : 'Check-in failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceedFromInfo = true
  const canProceedFromIdentity = formData.nationality && formData.dateOfBirth && formData.passportNumber
  const canProceedFromEmergency = formData.emergencyName && formData.emergencyPhone
  const canProceedFromRules = formData.rulesAccepted && formData.gdprConsent
  const canProceedFromSignature = formData.signatureDataUrl

  // Render loading state
  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#0A4843] mx-auto mb-4" />
          <p className="text-gray-600">Loading your booking...</p>
        </div>
      </div>
    )
  }

  // Render error state
  if (step === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Check-in Link Invalid</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push('/')} className="bg-[#0A4843]">
              Return to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render already completed state
  if (step === 'already_done') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Already Checked In!</h2>
            <p className="text-gray-600 mb-4">
              You&apos;ve already completed your online check-in on{' '}
              {booking?.checkin_completed_at && format(new Date(booking.checkin_completed_at), 'PPP')}
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
              <p className="text-sm text-gray-600">
                <strong>Check-in:</strong> {booking?.check_in} (from 1:00 PM)
              </p>
              <p className="text-sm text-gray-600">
                <strong>Check-out:</strong> {booking?.check_out} (by 12:00 PM)
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Questions? Contact us on{' '}
              <a href="https://wa.me/5493704951772" className="text-[#0A4843] underline">
                WhatsApp
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render completion state
  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#0A4843] mb-2">Check-in Complete!</h2>
            <p className="text-gray-600 mb-6">
              Thank you, {booking?.guest_name}! Your registration is complete.
              We can&apos;t wait to welcome you to Mandioca Hostel!
            </p>
            <div className="bg-[#0A4843]/5 rounded-lg p-4 text-left mb-6">
              <h3 className="font-semibold text-[#0A4843] mb-2">Your Stay Details</h3>
              <p className="text-sm text-gray-600">
                <strong>Check-in:</strong> {booking?.check_in} from 1:00 PM
              </p>
              <p className="text-sm text-gray-600">
                <strong>Check-out:</strong> {booking?.check_out} by 12:00 PM
              </p>
              {formData.arrivalTime && (
                <p className="text-sm text-gray-600">
                  <strong>Expected arrival:</strong> {formData.arrivalTime}
                </p>
              )}
            </div>
            <div className="bg-[#F7B03D]/10 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-[#0A4843] mb-2">📍 Our Location</h3>
              <p className="text-sm text-gray-600">Av. Colón 1090, Asunción, Paraguay</p>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=-25.2855854,-57.6497056"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#0A4843] underline"
              >
                Get Directions →
              </a>
            </div>
            <Button
              onClick={() => window.open('https://wa.me/5493704951772', '_blank')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Contact us on WhatsApp
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main check-in form steps
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#0A4843]">Online Check-in</h1>
          <p className="text-gray-600">Mandioca Hostel</p>
        </div>

        {/* Booking Summary Card */}
        {booking && (
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-[#0A4843]">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p><strong>Guest:</strong> {booking.guest_name}</p>
              <p><strong>Check-in:</strong> {booking.check_in}</p>
              <p><strong>Check-out:</strong> {booking.check_out}</p>
              <p><strong>Guests:</strong> {booking.guest_count}</p>
            </CardContent>
          </Card>
        )}

        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {['info', 'identity', 'emergency', 'rules', 'signature'].map((s, i) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full transition-colors ${
                step === s
                  ? 'bg-[#0A4843]'
                  : ['info', 'identity', 'emergency', 'rules', 'signature'].indexOf(step) > i
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Step: Info & Preferences */}
        {step === 'info' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-[#0A4843]" />
                Arrival Information
              </CardTitle>
              <CardDescription>
                Let us know when you&apos;re arriving and any special requests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="arrivalTime">Expected Arrival Time</Label>
                <Select
                  value={formData.arrivalTime}
                  onValueChange={(v) => handleInputChange('arrivalTime', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select arrival time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="13:00-15:00">1:00 PM - 3:00 PM</SelectItem>
                    <SelectItem value="15:00-17:00">3:00 PM - 5:00 PM</SelectItem>
                    <SelectItem value="17:00-19:00">5:00 PM - 7:00 PM</SelectItem>
                    <SelectItem value="19:00-21:00">7:00 PM - 9:00 PM</SelectItem>
                    <SelectItem value="21:00-23:00">9:00 PM - 11:00 PM</SelectItem>
                    <SelectItem value="late">After 11:00 PM (please contact us)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dietary">Dietary Restrictions (optional)</Label>
                <Input
                  id="dietary"
                  placeholder="e.g., Vegetarian, Vegan, Allergies..."
                  value={formData.dietaryRestrictions}
                  onChange={(e) => handleInputChange('dietaryRestrictions', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requests">Special Requests (optional)</Label>
                <textarea
                  id="requests"
                  className="w-full border rounded-md p-3 text-sm min-h-[80px] focus:ring-2 focus:ring-[#0A4843] focus:border-transparent"
                  placeholder="Any special needs or requests?"
                  value={formData.specialRequests}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                />
              </div>

              <Button
                onClick={() => setStep('identity')}
                disabled={!canProceedFromInfo}
                className="w-full bg-[#0A4843] hover:bg-[#0A4843]/90"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step: Identity */}
        {step === 'identity' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[#0A4843]" />
                Identity Information
              </CardTitle>
              <CardDescription>
                Required for legal guest registration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality *</Label>
                <Select
                  value={formData.nationality}
                  onValueChange={(v) => handleInputChange('nationality', v)}
                >
                  <SelectTrigger>
                    <Globe className="h-4 w-4 mr-2 text-gray-400" />
                    <SelectValue placeholder="Select nationality" />
                  </SelectTrigger>
                  <SelectContent>
                    {NATIONALITIES.map((nat) => (
                      <SelectItem key={nat} value={nat}>{nat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth *</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passport">Passport / ID Number *</Label>
                <Input
                  id="passport"
                  placeholder="Enter passport or ID number"
                  value={formData.passportNumber}
                  onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passportExpiry">Passport Expiry Date</Label>
                <Input
                  id="passportExpiry"
                  type="date"
                  value={formData.passportExpiry}
                  onChange={(e) => handleInputChange('passportExpiry', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passportImage">
                  <Camera className="h-4 w-4 inline mr-2" />
                  Passport / ID Photo (optional)
                </Label>
                <Input
                  id="passportImage"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {formData.passportImage && (
                  <p className="text-sm text-green-600">
                    ✓ {formData.passportImage.name}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep('info')}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={() => setStep('emergency')}
                  disabled={!canProceedFromIdentity}
                  className="flex-1 bg-[#0A4843] hover:bg-[#0A4843]/90"
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Emergency Contact */}
        {step === 'emergency' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#0A4843]" />
                Emergency Contact
              </CardTitle>
              <CardDescription>
                Someone we can contact in case of emergency
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyName">Contact Name *</Label>
                <Input
                  id="emergencyName"
                  placeholder="Full name"
                  value={formData.emergencyName}
                  onChange={(e) => handleInputChange('emergencyName', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Contact Phone *</Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  placeholder="+1 234 567 890"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyRelation">Relationship</Label>
                <Select
                  value={formData.emergencyRelation}
                  onValueChange={(v) => handleInputChange('emergencyRelation', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="spouse">Spouse / Partner</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep('identity')}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={() => setStep('rules')}
                  disabled={!canProceedFromEmergency}
                  className="flex-1 bg-[#0A4843] hover:bg-[#0A4843]/90"
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Rules & Consent */}
        {step === 'rules' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#0A4843]" />
                Hostel Rules & Consent
              </CardTitle>
              <CardDescription>
                Please read and accept our policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Display hostel rules */}
              <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                <h4 className="font-semibold text-[#0A4843] mb-3">House Rules</h4>
                {rules.length > 0 ? (
                  <ul className="space-y-3 text-sm">
                    {rules.map((rule) => (
                      <li key={rule.id} className="flex gap-2">
                        <span className="text-[#F7B03D]">•</span>
                        <div>
                          <strong>{rule.title}:</strong> {rule.description}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="space-y-2 text-sm">
                    <li><strong>Quiet Hours:</strong> 11:00 PM - 8:00 AM</li>
                    <li><strong>No Smoking:</strong> Inside the hostel</li>
                    <li><strong>Visitors:</strong> Not allowed in rooms</li>
                    <li><strong>Check-out:</strong> By 12:00 PM</li>
                    <li><strong>Damages:</strong> Guest is responsible for any damages</li>
                  </ul>
                )}
              </div>

              {/* Consent checkboxes */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="rules"
                    checked={formData.rulesAccepted}
                    onCheckedChange={(checked) => handleInputChange('rulesAccepted', checked === true)}
                    className="mt-1"
                  />
                  <label htmlFor="rules" className="text-sm text-gray-600 cursor-pointer">
                    I have read and agree to the hostel rules and policies.
                    I understand that violation may result in removal without refund. *
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="gdpr"
                    checked={formData.gdprConsent}
                    onCheckedChange={(checked) => handleInputChange('gdprConsent', checked === true)}
                    className="mt-1"
                  />
                  <label htmlFor="gdpr" className="text-sm text-gray-600 cursor-pointer">
                    I consent to Mandioca Hostel storing and processing my personal data
                    for accommodation management purposes, in accordance with GDPR. *
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep('emergency')}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={() => setStep('signature')}
                  disabled={!canProceedFromRules}
                  className="flex-1 bg-[#0A4843] hover:bg-[#0A4843]/90"
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Signature */}
        {step === 'signature' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#0A4843]" />
                Digital Signature
              </CardTitle>
              <CardDescription>
                Sign to confirm your registration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SignaturePad
                onSave={(dataUrl) => handleInputChange('signatureDataUrl', dataUrl)}
                onClear={() => handleInputChange('signatureDataUrl', '')}
                width={Math.min(350, window.innerWidth - 80)}
                height={150}
                label="Your Signature"
                required
              />

              <p className="text-xs text-gray-500">
                By signing, I confirm that all information provided is accurate and
                I agree to the hostel rules and data processing terms.
              </p>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep('rules')}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceedFromSignature || isSubmitting}
                  className="flex-1 bg-[#F7B03D] hover:bg-[#e9a235] text-gray-900"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Complete Check-in
                      <CheckCircle className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}

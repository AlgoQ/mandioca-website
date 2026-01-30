'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Users, Bed, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const roomTypes = [
  { id: '1', name: '8 Bed Mixed Dorm', price: 12 },
  { id: '2', name: '12 Bed Mixed Dorm', price: 10 },
  { id: '3', name: 'Private Room - King Bed', price: 30 },
  { id: '4', name: 'Private Twin Room', price: 35 },
]

interface BookingFormProps {
  hostelId?: string
  hostelName?: string
}

export function BookingForm({
  hostelId = '1',
  hostelName = 'Ribeira ONEFAM Hostel Porto'
}: BookingFormProps) {
  const [checkIn, setCheckIn] = useState<Date>()
  const [checkOut, setCheckOut] = useState<Date>()
  const [guests, setGuests] = useState('1')
  const [roomType, setRoomType] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const selectedRoom = roomTypes.find((r) => r.id === roomType)
  const nights = checkIn && checkOut
    ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    : 0
  const totalPrice = selectedRoom ? selectedRoom.price * nights * parseInt(guests) : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      // Validate form
      if (!checkIn || !checkOut || !roomType || !guestName || !guestEmail || !guestPhone) {
        throw new Error('Please fill in all required fields')
      }

      if (checkOut <= checkIn) {
        throw new Error('Check-out date must be after check-in date')
      }

      // Submit to API
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostel_id: hostelId,
          room_id: roomType,
          guest_name: guestName,
          guest_email: guestEmail,
          guest_phone: guestPhone,
          check_in: format(checkIn, 'yyyy-MM-dd'),
          check_out: format(checkOut, 'yyyy-MM-dd'),
          guest_count: parseInt(guests),
          total_price: totalPrice,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Booking failed')
      }

      setIsSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <section id="booking" className="py-12 sm:py-20 bg-[#0A4843] overflow-hidden">
        <div className="container mx-auto px-4 max-w-full">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A4843] mb-4">
                Booking Request Received!
              </h3>
              <p className="text-gray-600 mb-6">
                Thank you, {guestName}! We&apos;ve received your booking request for {hostelName}.
                You&apos;ll receive a confirmation email at {guestEmail} shortly.
              </p>
              <div className="bg-gray-50 rounded-md p-6 text-left space-y-2">
                <p><span className="font-semibold">Check-in:</span> {checkIn && format(checkIn, 'PPP')}</p>
                <p><span className="font-semibold">Check-out:</span> {checkOut && format(checkOut, 'PPP')}</p>
                <p><span className="font-semibold">Room:</span> {selectedRoom?.name}</p>
                <p><span className="font-semibold">Guests:</span> {guests}</p>
                <p><span className="font-semibold">Total:</span> ${totalPrice}</p>
              </div>
              <Button
                className="mt-8 bg-[#0A4843] hover:bg-[#0A4843]/90"
                onClick={() => {
                  setIsSuccess(false)
                  setCheckIn(undefined)
                  setCheckOut(undefined)
                  setGuests('1')
                  setRoomType('')
                  setGuestName('')
                  setGuestEmail('')
                  setGuestPhone('')
                }}
              >
                Make Another Booking
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  return (
    <section id="booking" className="py-20 bg-[#0A4843]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[#F7B03D] font-semibold text-sm uppercase tracking-wider">
            Reserve Your Bed
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-4">
            Book Your Stay
          </h2>
          <p className="text-white/80 text-lg">
            Secure the best rates by booking directly with us
          </p>
        </div>

        {/* Booking Form */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="pb-4">
            <CardTitle className="text-[#0A4843]">{hostelName}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date & Room Selection */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Check-in */}
                <div className="space-y-2">
                  <Label>Check-in Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !checkIn && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkIn ? format(checkIn, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={checkIn}
                        onSelect={setCheckIn}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Check-out */}
                <div className="space-y-2">
                  <Label>Check-out Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !checkOut && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkOut ? format(checkOut, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={checkOut}
                        onSelect={setCheckOut}
                        disabled={(date) => date <= (checkIn || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Guests */}
                <div className="space-y-2">
                  <Label>Guests *</Label>
                  <Select value={guests} onValueChange={setGuests}>
                    <SelectTrigger className="w-full">
                      <Users className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Guests" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? 'Guest' : 'Guests'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Room Type */}
                <div className="space-y-2">
                  <Label>Room Type *</Label>
                  <Select value={roomType} onValueChange={setRoomType}>
                    <SelectTrigger className="w-full">
                      <Bed className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Select room" />
                    </SelectTrigger>
                    <SelectContent>
                      {roomTypes.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.name} - ${room.price}/night
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Guest Information */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 234 567 890"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Price Summary */}
              {selectedRoom && nights > 0 && (
                <div className="bg-[#0A4843]/5 rounded-md p-6">
                  <h4 className="font-semibold text-[#0A4843] mb-4">Booking Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {selectedRoom.name} x {nights} {nights === 1 ? 'night' : 'nights'}
                      </span>
                      <span>${selectedRoom.price * nights}</span>
                    </div>
                    {parseInt(guests) > 1 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">x {guests} guests</span>
                        <span>${totalPrice}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t font-semibold text-[#0A4843]">
                      <span>Total</span>
                      <span>${totalPrice}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-[#F7B03D] hover:bg-[#e9a235] text-gray-900 font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Complete Booking'
                )}
              </Button>

              <div className="text-center text-sm text-gray-500 space-y-1">
                <p>
                  By booking, you agree to our{' '}
                  <a href="/terms" className="text-[#0A4843] underline hover:text-[#F7B03D]">
                    Terms & Conditions
                  </a>
                </p>
                <p>Payment upon arrival by cash, credit and debit card</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

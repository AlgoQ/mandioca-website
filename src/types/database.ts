export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      hostels: {
        Row: {
          id: string
          name: string
          slug: string
          city: string
          country: string
          address: string
          description: string
          short_description: string | null
          rating: number | null
          hero_image: string | null
          latitude: number | null
          longitude: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          city: string
          country: string
          address: string
          description: string
          short_description?: string | null
          rating?: number | null
          hero_image?: string | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          city?: string
          country?: string
          address?: string
          description?: string
          short_description?: string | null
          rating?: number | null
          hero_image?: string | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          hostel_id: string
          name: string
          description: string | null
          bed_count: number
          room_type: 'dorm' | 'private' | 'suite'
          price_per_night: number
          max_guests: number
          image_url: string | null
          available: boolean
          display_order: number
          features: Json
          created_at: string
        }
        Insert: {
          id?: string
          hostel_id: string
          name: string
          description?: string | null
          bed_count?: number
          room_type?: 'dorm' | 'private' | 'suite'
          price_per_night?: number
          max_guests?: number
          image_url?: string | null
          available?: boolean
          display_order?: number
          features?: Json
          created_at?: string
        }
        Update: {
          id?: string
          hostel_id?: string
          name?: string
          description?: string | null
          bed_count?: number
          room_type?: 'dorm' | 'private' | 'suite'
          price_per_night?: number
          max_guests?: number
          image_url?: string | null
          available?: boolean
          display_order?: number
          features?: Json
          created_at?: string
        }
      }
      amenities: {
        Row: {
          id: string
          hostel_id: string
          name: string
          name_es: string | null
          icon: string | null
          category: 'facility' | 'service' | 'activity'
          description: string | null
          description_es: string | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          hostel_id: string
          name: string
          name_es?: string | null
          icon?: string | null
          category?: 'facility' | 'service' | 'activity'
          description?: string | null
          description_es?: string | null
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          hostel_id?: string
          name?: string
          name_es?: string | null
          icon?: string | null
          category?: 'facility' | 'service' | 'activity'
          description?: string | null
          description_es?: string | null
          display_order?: number
          created_at?: string
        }
      }
      hostel_images: {
        Row: {
          id: string
          hostel_id: string
          image_url: string
          alt_text: string | null
          alt_text_es: string | null
          width: number | null
          height: number | null
          file_size: number | null
          display_order: number
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          hostel_id: string
          image_url: string
          alt_text?: string | null
          alt_text_es?: string | null
          width?: number | null
          height?: number | null
          file_size?: number | null
          display_order?: number
          category?: string
          created_at?: string
        }
        Update: {
          id?: string
          hostel_id?: string
          image_url?: string
          alt_text?: string | null
          alt_text_es?: string | null
          width?: number | null
          height?: number | null
          file_size?: number | null
          display_order?: number
          category?: string
          created_at?: string
        }
      }
      hostel_videos: {
        Row: {
          id: string
          hostel_id: string
          video_url: string
          thumbnail_url: string | null
          title: string | null
          title_es: string | null
          description: string | null
          description_es: string | null
          duration: number | null
          file_size: number | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          hostel_id: string
          video_url: string
          thumbnail_url?: string | null
          title?: string | null
          title_es?: string | null
          description?: string | null
          description_es?: string | null
          duration?: number | null
          file_size?: number | null
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          hostel_id?: string
          video_url?: string
          thumbnail_url?: string | null
          title?: string | null
          title_es?: string | null
          description?: string | null
          description_es?: string | null
          duration?: number | null
          file_size?: number | null
          display_order?: number
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          hostel_id: string
          room_id: string
          guest_name: string
          guest_email: string
          guest_phone: string | null
          check_in: string
          check_out: string
          guest_count: number
          total_price: number
          status: 'pending' | 'confirmed' | 'cancelled'
          payment_status: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded'
          stripe_session_id: string | null
          stripe_payment_intent_id: string | null
          paid_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          hostel_id: string
          room_id: string
          guest_name: string
          guest_email: string
          guest_phone?: string | null
          check_in: string
          check_out: string
          guest_count?: number
          total_price?: number
          status?: 'pending' | 'confirmed' | 'cancelled'
          payment_status?: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded'
          stripe_session_id?: string | null
          stripe_payment_intent_id?: string | null
          paid_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          hostel_id?: string
          room_id?: string
          guest_name?: string
          guest_email?: string
          guest_phone?: string | null
          check_in?: string
          check_out?: string
          guest_count?: number
          total_price?: number
          status?: 'pending' | 'confirmed' | 'cancelled'
          payment_status?: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded'
          stripe_session_id?: string | null
          stripe_payment_intent_id?: string | null
          paid_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          hostel_id: string
          guest_name: string
          rating: number
          comment: string | null
          country: string | null
          review_date: string | null
          display_order: number
          visible: boolean
          created_at: string
        }
        Insert: {
          id?: string
          hostel_id: string
          guest_name: string
          rating?: number
          comment?: string | null
          country?: string | null
          review_date?: string | null
          display_order?: number
          visible?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          hostel_id?: string
          guest_name?: string
          rating?: number
          comment?: string | null
          country?: string | null
          review_date?: string | null
          display_order?: number
          visible?: boolean
          created_at?: string
        }
      }
      faq: {
        Row: {
          id: string
          hostel_id: string
          question: string
          question_es: string | null
          answer: string
          answer_es: string | null
          display_order: number
          visible: boolean
          created_at: string
        }
        Insert: {
          id?: string
          hostel_id: string
          question: string
          question_es?: string | null
          answer: string
          answer_es?: string | null
          display_order?: number
          visible?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          hostel_id?: string
          question?: string
          question_es?: string | null
          answer?: string
          answer_es?: string | null
          display_order?: number
          visible?: boolean
          created_at?: string
        }
      }
      content: {
        Row: {
          id: string
          hostel_id: string
          section: string
          key: string
          value_en: string
          value_es: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          hostel_id: string
          section: string
          key: string
          value_en: string
          value_es?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          hostel_id?: string
          section?: string
          key?: string
          value_en?: string
          value_es?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          hostel_id: string
          title: string
          title_es: string | null
          subtitle: string | null
          subtitle_es: string | null
          description: string | null
          description_es: string | null
          image_url: string | null
          display_order: number
          visible: boolean
          created_at: string
        }
        Insert: {
          id?: string
          hostel_id: string
          title: string
          title_es?: string | null
          subtitle?: string | null
          subtitle_es?: string | null
          description?: string | null
          description_es?: string | null
          image_url?: string | null
          display_order?: number
          visible?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          hostel_id?: string
          title?: string
          title_es?: string | null
          subtitle?: string | null
          subtitle_es?: string | null
          description?: string | null
          description_es?: string | null
          image_url?: string | null
          display_order?: number
          visible?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type Hostel = Database['public']['Tables']['hostels']['Row']
export type Room = Database['public']['Tables']['rooms']['Row']
export type Amenity = Database['public']['Tables']['amenities']['Row']
export type HostelImage = Database['public']['Tables']['hostel_images']['Row']
export type HostelVideo = Database['public']['Tables']['hostel_videos']['Row']
export type Booking = Database['public']['Tables']['bookings']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type FAQ = Database['public']['Tables']['faq']['Row']
export type Content = Database['public']['Tables']['content']['Row']
export type Activity = Database['public']['Tables']['activities']['Row']

export type NewBooking = Database['public']['Tables']['bookings']['Insert']
export type NewReview = Database['public']['Tables']['reviews']['Insert']
export type NewImage = Database['public']['Tables']['hostel_images']['Insert']
export type NewVideo = Database['public']['Tables']['hostel_videos']['Insert']

// ============================================
// GUEST CHECK-IN SYSTEM TYPES
// ============================================

export interface Guest {
  id: string
  full_name: string
  email: string
  phone: string | null
  nationality: string | null
  date_of_birth: string | null
  passport_number: string | null
  passport_expiry: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  emergency_contact_relation: string | null
  passport_image_url: string | null
  signature_image_url: string | null
  dietary_restrictions: string | null
  special_requests: string | null
  created_at: string
  updated_at: string
}

export interface GuestInsert {
  full_name: string
  email: string
  phone?: string | null
  nationality?: string | null
  date_of_birth?: string | null
  passport_number?: string | null
  passport_expiry?: string | null
  emergency_contact_name?: string | null
  emergency_contact_phone?: string | null
  emergency_contact_relation?: string | null
  passport_image_url?: string | null
  signature_image_url?: string | null
  dietary_restrictions?: string | null
  special_requests?: string | null
}

export interface CheckIn {
  id: string
  booking_id: string
  guest_id: string
  checked_in_at: string
  checked_in_by: string | null
  device_info: string | null
  ip_address: string | null
  signature_url: string | null
  passport_url: string | null
  rules_accepted: boolean
  rules_accepted_at: string | null
  gdpr_consent: boolean
  gdpr_consent_at: string | null
  arrival_notes: string | null
  created_at: string
}

export interface ConsentLog {
  id: string
  guest_id: string | null
  booking_id: string | null
  email: string
  consent_type: 'gdpr' | 'marketing' | 'rules' | 'cookies'
  consent_given: boolean
  consent_text: string | null
  consented_at: string
  ip_address: string | null
  user_agent: string | null
  withdrawn_at: string | null
  withdrawal_reason: string | null
}

export interface CleaningTask {
  id: string
  hostel_id: string
  room_id: string | null
  area_type: 'room' | 'bathroom' | 'kitchen' | 'pool' | 'terrace' | 'common'
  area_name: string
  task_type: 'daily' | 'checkout' | 'deep_clean' | 'maintenance'
  checklist: ChecklistItem[]
  assigned_to: string | null
  assigned_at: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'verified'
  started_at: string | null
  completed_at: string | null
  verified_by: string | null
  verified_at: string | null
  scheduled_date: string
  due_time: string | null
  notes: string | null
  photos: string[]
  created_at: string
  updated_at: string
}

export interface ChecklistItem {
  id: string
  task: string
  task_es?: string
  required: boolean
  completed?: boolean
  completed_at?: string
}

export interface CleaningTemplate {
  id: string
  hostel_id: string
  name: string
  name_es: string | null
  area_type: string
  task_type: string
  checklist: ChecklistItem[]
  active: boolean
  created_at: string
}

export interface EmailReminder {
  id: string
  booking_id: string
  reminder_type: 'checkin_1day' | 'checkout_morning' | 'review_request'
  scheduled_for: string
  sent_at: string | null
  status: 'pending' | 'sent' | 'failed' | 'cancelled'
  error_message: string | null
  created_at: string
}

export interface HostelRule {
  id: string
  hostel_id: string
  category: string
  title: string
  title_es: string | null
  description: string
  description_es: string | null
  icon: string | null
  display_order: number
  required_acceptance: boolean
  active: boolean
  created_at: string
}

// Extended Booking type with new fields
export interface BookingWithCheckin extends Booking {
  guest_id: string | null
  rules_accepted: boolean
  rules_accepted_at: string | null
  gdpr_consent: boolean
  gdpr_consent_at: string | null
  marketing_consent: boolean
  checkin_token: string | null
  checkin_completed_at: string | null
  arrival_time: string | null
  checkout_completed_at: string | null
}

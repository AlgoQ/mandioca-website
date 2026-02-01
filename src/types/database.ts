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

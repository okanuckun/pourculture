export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      countries: {
        Row: {
          flag_emoji: string | null
          id: string
          name: string
          slug: string
          venue_count: number | null
        }
        Insert: {
          flag_emoji?: string | null
          id?: string
          name: string
          slug: string
          venue_count?: number | null
        }
        Update: {
          flag_emoji?: string | null
          id?: string
          name?: string
          slug?: string
          venue_count?: number | null
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          event_id: string
          id: string
          registered_at: string
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          registered_at?: string
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          registered_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          address: string
          background_image_url: string
          created_by: string
          creator: string
          date: string
          description: string
          id: string
          target_date: string
          time: string
          title: string
        }
        Insert: {
          address: string
          background_image_url: string
          created_by?: string
          creator: string
          date: string
          description: string
          id?: string
          target_date: string
          time: string
          title: string
        }
        Update: {
          address?: string
          background_image_url?: string
          created_by?: string
          creator?: string
          date?: string
          description?: string
          id?: string
          target_date?: string
          time?: string
          title?: string
        }
        Relationships: []
      }
      forum_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          topic_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          topic_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          topic_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_comments_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_likes: {
        Row: {
          created_at: string
          id: string
          topic_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          topic_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          topic_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_likes_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_topics: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          image_url: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      glossary_terms: {
        Row: {
          created_at: string
          definition: string
          id: string
          term: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          definition: string
          id?: string
          term: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          definition?: string
          id?: string
          term?: string
          updated_at?: string
        }
        Relationships: []
      }
      guides: {
        Row: {
          category: string
          content: string | null
          created_at: string
          description: string
          id: string
          is_published: boolean
          read_time: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          content?: string | null
          created_at?: string
          description: string
          id?: string
          is_published?: boolean
          read_time?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string
          description?: string
          id?: string
          is_published?: boolean
          read_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      harvest_reports: {
        Row: {
          created_at: string
          highlights: string[] | null
          id: string
          is_published: boolean
          region: string
          summary: string
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          highlights?: string[] | null
          id?: string
          is_published?: boolean
          region: string
          summary: string
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          highlights?: string[] | null
          id?: string
          is_published?: boolean
          region?: string
          summary?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      knowledge_favorites: {
        Row: {
          created_at: string
          id: string
          resource_id: string
          resource_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          resource_id: string
          resource_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          resource_id?: string
          resource_type?: string
          user_id?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          author: string | null
          content: string | null
          created_at: string
          created_by: string | null
          excerpt: string | null
          id: string
          image_url: string | null
          is_published: boolean | null
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      pdf_resources: {
        Row: {
          created_at: string
          description: string
          file_size: string | null
          file_url: string | null
          id: string
          is_published: boolean
          pages: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          file_size?: string | null
          file_url?: string | null
          id?: string
          is_published?: boolean
          pages?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          file_size?: string | null
          file_url?: string | null
          id?: string
          is_published?: boolean
          pages?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          admin_notes: string | null
          created_at: string
          data: Json
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submission_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          data?: Json
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submission_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          data?: Json
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submission_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_route_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean | null
          route_id: string
          updated_at: string
          user_id: string
          visited_venue_ids: string[] | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean | null
          route_id: string
          updated_at?: string
          user_id: string
          visited_venue_ids?: string[] | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean | null
          route_id?: string
          updated_at?: string
          user_id?: string
          visited_venue_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "user_route_progress_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "wine_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_route_wishlist: {
        Row: {
          created_at: string
          id: string
          route_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          route_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          route_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_route_wishlist_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "wine_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_claims: {
        Row: {
          business_email: string
          business_name: string
          business_phone: string | null
          created_at: string
          google_place_id: string | null
          id: string
          message: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          role_at_venue: string
          status: string
          updated_at: string
          user_id: string
          venue_id: string | null
        }
        Insert: {
          business_email: string
          business_name: string
          business_phone?: string | null
          created_at?: string
          google_place_id?: string | null
          id?: string
          message?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role_at_venue: string
          status?: string
          updated_at?: string
          user_id: string
          venue_id?: string | null
        }
        Update: {
          business_email?: string
          business_name?: string
          business_phone?: string | null
          created_at?: string
          google_place_id?: string | null
          id?: string
          message?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role_at_venue?: string
          status?: string
          updated_at?: string
          user_id?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "venue_claims_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          updated_at: string
          user_id: string
          venue_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
          venue_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_reviews_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          address: string
          category: Database["public"]["Enums"]["venue_category"]
          city: string
          country: string
          created_at: string
          created_by: string | null
          description: string | null
          email: string | null
          events: Json | null
          google_place_id: string | null
          google_rating: number | null
          id: string
          image_url: string | null
          is_claimed: boolean | null
          is_featured: boolean | null
          is_open: boolean | null
          latitude: number | null
          longitude: number | null
          menu_url: string | null
          name: string
          opening_hours: Json | null
          owner_id: string | null
          phone: string | null
          photos: Json | null
          slug: string
          social_links: Json | null
          story: string | null
          updated_at: string
          website: string | null
          wine_list: Json | null
        }
        Insert: {
          address: string
          category: Database["public"]["Enums"]["venue_category"]
          city: string
          country: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          email?: string | null
          events?: Json | null
          google_place_id?: string | null
          google_rating?: number | null
          id?: string
          image_url?: string | null
          is_claimed?: boolean | null
          is_featured?: boolean | null
          is_open?: boolean | null
          latitude?: number | null
          longitude?: number | null
          menu_url?: string | null
          name: string
          opening_hours?: Json | null
          owner_id?: string | null
          phone?: string | null
          photos?: Json | null
          slug: string
          social_links?: Json | null
          story?: string | null
          updated_at?: string
          website?: string | null
          wine_list?: Json | null
        }
        Update: {
          address?: string
          category?: Database["public"]["Enums"]["venue_category"]
          city?: string
          country?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          email?: string | null
          events?: Json | null
          google_place_id?: string | null
          google_rating?: number | null
          id?: string
          image_url?: string | null
          is_claimed?: boolean | null
          is_featured?: boolean | null
          is_open?: boolean | null
          latitude?: number | null
          longitude?: number | null
          menu_url?: string | null
          name?: string
          opening_hours?: Json | null
          owner_id?: string | null
          phone?: string | null
          photos?: Json | null
          slug?: string
          social_links?: Json | null
          story?: string | null
          updated_at?: string
          website?: string | null
          wine_list?: Json | null
        }
        Relationships: []
      }
      wine_fairs: {
        Row: {
          city: string
          country: string
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          is_pro_only: boolean | null
          latitude: number | null
          longitude: number | null
          poster_url: string | null
          price: string | null
          slug: string
          start_date: string
          ticket_url: string | null
          title: string
          updated_at: string
          venue_name: string | null
        }
        Insert: {
          city: string
          country: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_pro_only?: boolean | null
          latitude?: number | null
          longitude?: number | null
          poster_url?: string | null
          price?: string | null
          slug: string
          start_date: string
          ticket_url?: string | null
          title: string
          updated_at?: string
          venue_name?: string | null
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_pro_only?: boolean | null
          latitude?: number | null
          longitude?: number | null
          poster_url?: string | null
          price?: string | null
          slug?: string
          start_date?: string
          ticket_url?: string | null
          title?: string
          updated_at?: string
          venue_name?: string | null
        }
        Relationships: []
      }
      wine_quiz_results: {
        Row: {
          answers: Json
          created_at: string
          id: string
          recommendation_grape: string | null
          recommendation_name: string
          recommendation_region: string | null
          user_id: string
        }
        Insert: {
          answers: Json
          created_at?: string
          id?: string
          recommendation_grape?: string | null
          recommendation_name: string
          recommendation_region?: string | null
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          recommendation_grape?: string | null
          recommendation_name?: string
          recommendation_region?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wine_routes: {
        Row: {
          country: string
          created_at: string
          created_by: string | null
          curator_id: string | null
          curator_name: string | null
          curator_title: string | null
          description: string | null
          difficulty: string | null
          estimated_days: number | null
          id: string
          image_url: string | null
          is_curated: boolean | null
          is_published: boolean | null
          region: string
          slug: string
          title: string
          updated_at: string
          venue_count: number | null
          venue_ids: string[] | null
        }
        Insert: {
          country: string
          created_at?: string
          created_by?: string | null
          curator_id?: string | null
          curator_name?: string | null
          curator_title?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_days?: number | null
          id?: string
          image_url?: string | null
          is_curated?: boolean | null
          is_published?: boolean | null
          region: string
          slug: string
          title: string
          updated_at?: string
          venue_count?: number | null
          venue_ids?: string[] | null
        }
        Update: {
          country?: string
          created_at?: string
          created_by?: string | null
          curator_id?: string | null
          curator_name?: string | null
          curator_title?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_days?: number | null
          id?: string
          image_url?: string | null
          is_curated?: boolean | null
          is_published?: boolean | null
          region?: string
          slug?: string
          title?: string
          updated_at?: string
          venue_count?: number | null
          venue_ids?: string[] | null
        }
        Relationships: []
      }
      winemaker_claims: {
        Row: {
          business_email: string
          business_name: string
          business_phone: string | null
          created_at: string
          id: string
          message: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          role_at_winemaker: string
          status: string
          updated_at: string
          user_id: string
          winemaker_id: string | null
        }
        Insert: {
          business_email: string
          business_name: string
          business_phone?: string | null
          created_at?: string
          id?: string
          message?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role_at_winemaker: string
          status?: string
          updated_at?: string
          user_id: string
          winemaker_id?: string | null
        }
        Update: {
          business_email?: string
          business_name?: string
          business_phone?: string | null
          created_at?: string
          id?: string
          message?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role_at_winemaker?: string
          status?: string
          updated_at?: string
          user_id?: string
          winemaker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "winemaker_claims_winemaker_id_fkey"
            columns: ["winemaker_id"]
            isOneToOne: false
            referencedRelation: "winemakers"
            referencedColumns: ["id"]
          },
        ]
      }
      winemaker_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          updated_at: string
          user_id: string
          winemaker_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
          winemaker_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
          winemaker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "winemaker_reviews_winemaker_id_fkey"
            columns: ["winemaker_id"]
            isOneToOne: false
            referencedRelation: "winemakers"
            referencedColumns: ["id"]
          },
        ]
      }
      winemakers: {
        Row: {
          bio: string | null
          country: string
          created_at: string
          created_by: string | null
          domain_name: string | null
          id: string
          image_url: string | null
          is_claimed: boolean | null
          is_featured: boolean | null
          is_new: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          owner_id: string | null
          photos: Json | null
          region: string | null
          slug: string
          social_links: Json | null
          story: string | null
          updated_at: string
          website: string | null
          wine_list: Json | null
        }
        Insert: {
          bio?: string | null
          country: string
          created_at?: string
          created_by?: string | null
          domain_name?: string | null
          id?: string
          image_url?: string | null
          is_claimed?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          owner_id?: string | null
          photos?: Json | null
          region?: string | null
          slug: string
          social_links?: Json | null
          story?: string | null
          updated_at?: string
          website?: string | null
          wine_list?: Json | null
        }
        Update: {
          bio?: string | null
          country?: string
          created_at?: string
          created_by?: string | null
          domain_name?: string | null
          id?: string
          image_url?: string | null
          is_claimed?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          owner_id?: string | null
          photos?: Json | null
          region?: string | null
          slug?: string
          social_links?: Json | null
          story?: string | null
          updated_at?: string
          website?: string | null
          wine_list?: Json | null
        }
        Relationships: []
      }
      wines: {
        Row: {
          acidity: string
          alcohol_percentage: number | null
          color: string
          country: string
          created_at: string
          description: string | null
          grape: string
          id: string
          image_url: string | null
          is_featured: boolean | null
          name: string
          occasion: string[] | null
          price_range: string | null
          region: string
          style: string
          updated_at: string
          winemaker: string | null
          year: number | null
        }
        Insert: {
          acidity: string
          alcohol_percentage?: number | null
          color: string
          country: string
          created_at?: string
          description?: string | null
          grape: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          name: string
          occasion?: string[] | null
          price_range?: string | null
          region: string
          style: string
          updated_at?: string
          winemaker?: string | null
          year?: number | null
        }
        Update: {
          acidity?: string
          alcohol_percentage?: number | null
          color?: string
          country?: string
          created_at?: string
          description?: string | null
          grape?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          name?: string
          occasion?: string[] | null
          price_range?: string | null
          region?: string
          style?: string
          updated_at?: string
          winemaker?: string | null
          year?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_is_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      venue_category:
        | "restaurant"
        | "bar"
        | "wine_shop"
        | "accommodation"
        | "winemaker"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      venue_category: [
        "restaurant",
        "bar",
        "wine_shop",
        "accommodation",
        "winemaker",
      ],
    },
  },
} as const

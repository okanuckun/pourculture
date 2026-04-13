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
      featured_people: {
        Row: {
          bio: string
          category: string
          created_at: string
          display_order: number | null
          id: string
          image_url: string | null
          instagram: string | null
          is_featured: boolean | null
          name: string
          title: string
          twitter: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          bio: string
          category?: string
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          instagram?: string | null
          is_featured?: boolean | null
          name: string
          title: string
          twitter?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          bio?: string
          category?: string
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          instagram?: string | null
          is_featured?: boolean | null
          name?: string
          title?: string
          twitter?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
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
      post_comments: {
        Row: {
          comment_text: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          comment_text: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          comment_text?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_views: {
        Row: {
          created_at: string
          id: string
          post_id: string
          viewer_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          viewer_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_views_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          caption: string | null
          city: string
          country: string
          created_at: string
          id: string
          image_url: string
          latitude: number | null
          longitude: number | null
          post_type: string
          rating: number | null
          user_id: string
          venue_id: string | null
          venue_name: string | null
          view_count: number
          vintage: string | null
          wine_name: string | null
          wine_type: string | null
          winery: string | null
        }
        Insert: {
          caption?: string | null
          city: string
          country: string
          created_at?: string
          id?: string
          image_url: string
          latitude?: number | null
          longitude?: number | null
          post_type?: string
          rating?: number | null
          user_id: string
          venue_id?: string | null
          venue_name?: string | null
          view_count?: number
          vintage?: string | null
          wine_name?: string | null
          wine_type?: string | null
          winery?: string | null
        }
        Update: {
          caption?: string | null
          city?: string
          country?: string
          created_at?: string
          id?: string
          image_url?: string
          latitude?: number | null
          longitude?: number | null
          post_type?: string
          rating?: number | null
          user_id?: string
          venue_id?: string | null
          venue_name?: string | null
          view_count?: number
          vintage?: string | null
          wine_name?: string | null
          wine_type?: string | null
          winery?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          instagram: string | null
          is_verified: boolean | null
          location: string | null
          twitter: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          instagram?: string | null
          is_verified?: boolean | null
          location?: string | null
          twitter?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          instagram?: string | null
          is_verified?: boolean | null
          location?: string | null
          twitter?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      recommended_books: {
        Row: {
          amazon_link: string | null
          author: string
          cover_url: string | null
          created_at: string
          description: string
          display_order: number | null
          id: string
          is_featured: boolean | null
          title: string
          updated_at: string
          year: number | null
        }
        Insert: {
          amazon_link?: string | null
          author: string
          cover_url?: string | null
          created_at?: string
          description: string
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          title: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          amazon_link?: string | null
          author?: string
          cover_url?: string | null
          created_at?: string
          description?: string
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          title?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      seo_audit_issues: {
        Row: {
          created_at: string
          description: string
          id: string
          is_resolved: boolean
          issue_type: string
          page_path: string
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          suggestion: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          is_resolved?: boolean
          issue_type: string
          page_path: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          suggestion?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_resolved?: boolean
          issue_type?: string
          page_path?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          suggestion?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      seo_change_log: {
        Row: {
          change_type: string
          changed_at: string
          changed_by: string
          field_name: string
          id: string
          is_reverted: boolean
          new_value: string | null
          old_value: string | null
          page_path: string
          reverted_at: string | null
          reverted_by: string | null
        }
        Insert: {
          change_type: string
          changed_at?: string
          changed_by: string
          field_name: string
          id?: string
          is_reverted?: boolean
          new_value?: string | null
          old_value?: string | null
          page_path: string
          reverted_at?: string | null
          reverted_by?: string | null
        }
        Update: {
          change_type?: string
          changed_at?: string
          changed_by?: string
          field_name?: string
          id?: string
          is_reverted?: boolean
          new_value?: string | null
          old_value?: string | null
          page_path?: string
          reverted_at?: string | null
          reverted_by?: string | null
        }
        Relationships: []
      }
      seo_global_settings: {
        Row: {
          created_at: string
          default_og_image: string | null
          default_robots_meta: string
          description_template: string | null
          id: string
          robots_txt_content: string
          sitemap_include_rules: Json
          title_template: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_og_image?: string | null
          default_robots_meta?: string
          description_template?: string | null
          id?: string
          robots_txt_content?: string
          sitemap_include_rules?: Json
          title_template?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_og_image?: string | null
          default_robots_meta?: string
          description_template?: string | null
          id?: string
          robots_txt_content?: string
          sitemap_include_rules?: Json
          title_template?: string
          updated_at?: string
        }
        Relationships: []
      }
      seo_page_settings: {
        Row: {
          canonical_mode: string
          canonical_url: string | null
          created_at: string
          created_by: string | null
          focus_keyword: string | null
          h1_text: string | null
          id: string
          include_in_sitemap: boolean
          is_published: boolean
          last_crawled_at: string | null
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          page_path: string
          page_type: string
          robots_meta: string
          schema_data: Json | null
          secondary_keywords: string[] | null
          seo_score: number | null
          status_code: number | null
          twitter_card_type: string | null
          twitter_image: string | null
          updated_at: string
          updated_by: string | null
          word_count: number | null
        }
        Insert: {
          canonical_mode?: string
          canonical_url?: string | null
          created_at?: string
          created_by?: string | null
          focus_keyword?: string | null
          h1_text?: string | null
          id?: string
          include_in_sitemap?: boolean
          is_published?: boolean
          last_crawled_at?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          page_path: string
          page_type?: string
          robots_meta?: string
          schema_data?: Json | null
          secondary_keywords?: string[] | null
          seo_score?: number | null
          status_code?: number | null
          twitter_card_type?: string | null
          twitter_image?: string | null
          updated_at?: string
          updated_by?: string | null
          word_count?: number | null
        }
        Update: {
          canonical_mode?: string
          canonical_url?: string | null
          created_at?: string
          created_by?: string | null
          focus_keyword?: string | null
          h1_text?: string | null
          id?: string
          include_in_sitemap?: boolean
          is_published?: boolean
          last_crawled_at?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          page_path?: string
          page_type?: string
          robots_meta?: string
          schema_data?: Json | null
          secondary_keywords?: string[] | null
          seo_score?: number | null
          status_code?: number | null
          twitter_card_type?: string | null
          twitter_image?: string | null
          updated_at?: string
          updated_by?: string | null
          word_count?: number | null
        }
        Relationships: []
      }
      seo_redirects: {
        Row: {
          created_at: string
          created_by: string | null
          hit_count: number
          id: string
          is_active: boolean
          last_hit_at: string | null
          redirect_type: number
          source_path: string
          target_path: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          hit_count?: number
          id?: string
          is_active?: boolean
          last_hit_at?: string | null
          redirect_type?: number
          source_path: string
          target_path: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          hit_count?: number
          id?: string
          is_active?: boolean
          last_hit_at?: string | null
          redirect_type?: number
          source_path?: string
          target_path?: string
          updated_at?: string
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
          source: string
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
          source?: string
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
          source?: string
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
          curator_user_id: string | null
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
          curator_user_id?: string | null
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
          curator_user_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "wine_routes_curator_user_id_fkey"
            columns: ["curator_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      wine_scan_history: {
        Row: {
          aging_potential: string | null
          country: string | null
          created_at: string
          detailed_description: string | null
          food_pairing: string[] | null
          grape_variety: string | null
          id: string
          image_url: string | null
          is_favorite: boolean | null
          price_range: string | null
          quick_summary: string | null
          rating: number | null
          region: string | null
          serving_temperature: string | null
          tasting_notes: Json | null
          terroir: Json | null
          updated_at: string
          user_id: string
          user_notes: string | null
          vintage: string | null
          wine_name: string
          wine_type: string | null
          winery: string | null
        }
        Insert: {
          aging_potential?: string | null
          country?: string | null
          created_at?: string
          detailed_description?: string | null
          food_pairing?: string[] | null
          grape_variety?: string | null
          id?: string
          image_url?: string | null
          is_favorite?: boolean | null
          price_range?: string | null
          quick_summary?: string | null
          rating?: number | null
          region?: string | null
          serving_temperature?: string | null
          tasting_notes?: Json | null
          terroir?: Json | null
          updated_at?: string
          user_id: string
          user_notes?: string | null
          vintage?: string | null
          wine_name: string
          wine_type?: string | null
          winery?: string | null
        }
        Update: {
          aging_potential?: string | null
          country?: string | null
          created_at?: string
          detailed_description?: string | null
          food_pairing?: string[] | null
          grape_variety?: string | null
          id?: string
          image_url?: string | null
          is_favorite?: boolean | null
          price_range?: string | null
          quick_summary?: string | null
          rating?: number | null
          region?: string | null
          serving_temperature?: string | null
          tasting_notes?: Json | null
          terroir?: Json | null
          updated_at?: string
          user_id?: string
          user_notes?: string | null
          vintage?: string | null
          wine_name?: string
          wine_type?: string | null
          winery?: string | null
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
      increment_view_count: { Args: { p_post_id: string }; Returns: undefined }
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

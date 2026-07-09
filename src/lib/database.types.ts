// Auto-generated-compatible database types for Joe's Shop.
// In production, regenerate with: supabase gen types typescript --project-id <id>

export type Database = {
  public: {
    Tables: {
      roles: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          avatar_url: string | null
          role: string
          banned: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: string
          banned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: string
          banned?: boolean
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          parent_id: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug?: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          updated_at?: string
        }
      }
      brands: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug?: string
          logo_url?: string | null
          description?: string | null
          is_active?: boolean
        }
        Update: {
          name?: string
          slug?: string
          logo_url?: string | null
          description?: string | null
          is_active?: boolean
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          short_description: string | null
          sku: string | null
          barcode: string | null
          brand_id: string | null
          cost_price: number
          selling_price: number
          sale_price: number | null
          discount_percentage: number | null
          stock_quantity: number
          low_stock_threshold: number
          weight: number | null
          dimensions: Record<string, unknown> | null
          seo_title: string | null
          seo_description: string | null
          status: string
          is_featured: boolean
          is_new_arrival: boolean
          is_best_seller: boolean
          average_rating: number
          review_count: number
          total_sold: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug?: string
          description?: string | null
          short_description?: string | null
          sku?: string | null
          barcode?: string | null
          brand_id?: string | null
          cost_price?: number
          selling_price: number
          sale_price?: number | null
          discount_percentage?: number | null
          stock_quantity?: number
          low_stock_threshold?: number
          weight?: number | null
          dimensions?: Record<string, unknown> | null
          seo_title?: string | null
          seo_description?: string | null
          status?: string
          is_featured?: boolean
          is_new_arrival?: boolean
          is_best_seller?: boolean
        }
        Update: {
          [key: string]: unknown
        }
      }
      product_categories: {
        Row: { id: string; product_id: string; category_id: string }
        Insert: { id?: string; product_id: string; category_id: string }
        Update: { product_id?: string; category_id?: string }
      }
      product_tags: {
        Row: { id: string; product_id: string; tag: string }
        Insert: { id?: string; product_id: string; tag: string }
        Update: { tag?: string }
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          url: string
          alt_text: string | null
          sort_order: number
          is_featured: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          url: string
          alt_text?: string | null
          sort_order?: number
          is_featured?: boolean
        }
        Update: {
          url?: string
          alt_text?: string | null
          sort_order?: number
          is_featured?: boolean
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          sku: string | null
          barcode: string | null
          price: number
          sale_price: number | null
          cost_price: number | null
          stock_quantity: number
          color: string | null
          size: string | null
          weight: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          sku?: string | null
          barcode?: string | null
          price: number
          sale_price?: number | null
          cost_price?: number | null
          stock_quantity?: number
          color?: string | null
          size?: string | null
          weight?: number | null
          is_active?: boolean
        }
        Update: { [key: string]: unknown }
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          rating: number
          title: string | null
          comment: string | null
          status: string
          admin_reply: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          rating: number
          title?: string | null
          comment?: string | null
          status?: string
          admin_reply?: string | null
        }
        Update: { [key: string]: unknown }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          variant_id: string | null
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          variant_id?: string | null
          quantity?: number
        }
        Update: { quantity?: number; variant_id?: string | null }
      }
      wishlist_items: {
        Row: { id: string; user_id: string; product_id: string; created_at: string }
        Insert: { id?: string; user_id: string; product_id: string }
        Update: {}
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          label: string
          first_name: string
          last_name: string
          street_address_1: string
          street_address_2: string | null
          city: string
          state: string
          postal_code: string
          country: string
          phone: string | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          label?: string
          first_name: string
          last_name: string
          street_address_1: string
          street_address_2?: string | null
          city: string
          state: string
          postal_code: string
          country?: string
          phone?: string | null
          is_default?: boolean
        }
        Update: { [key: string]: unknown }
      }
      coupons: {
        Row: {
          id: string
          code: string
          type: string
          value: number
          min_purchase: number | null
          max_uses: number | null
          used_count: number
          starts_at: string | null
          expires_at: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          type: string
          value?: number
          min_purchase?: number | null
          max_uses?: number | null
          starts_at?: string | null
          expires_at?: string | null
          is_active?: boolean
        }
        Update: { [key: string]: unknown }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          order_number: string
          status: string
          payment_status: string
          subtotal: number
          tax: number
          shipping_cost: number
          discount: number
          total: number
          coupon_id: string | null
          shipping_method: string | null
          shipping_address: Record<string, unknown> | null
          billing_address: Record<string, unknown> | null
          customer_note: string | null
          internal_note: string | null
          paid_at: string | null
          shipped_at: string | null
          delivered_at: string | null
          cancelled_at: string | null
          refunded_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_number?: string
          status?: string
          payment_status?: string
          subtotal?: number
          tax?: number
          shipping_cost?: number
          discount?: number
          total: number
          coupon_id?: string | null
          shipping_method?: string | null
          shipping_address?: Record<string, unknown> | null
          billing_address?: Record<string, unknown> | null
          customer_note?: string | null
          internal_note?: string | null
        }
        Update: { [key: string]: unknown }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          variant_id: string | null
          product_name: string
          product_image: string | null
          sku: string | null
          quantity: number
          unit_price: number
          total_price: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          variant_id?: string | null
          product_name: string
          product_image?: string | null
          sku?: string | null
          quantity: number
          unit_price: number
          total_price: number
        }
        Update: { [key: string]: unknown }
      }
      inventory_history: {
        Row: {
          id: string
          product_id: string
          variant_id: string | null
          action: string
          quantity: number
          note: string | null
          previous_stock: number
          new_stock: number
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          variant_id?: string | null
          action: string
          quantity: number
          note?: string | null
          previous_stock?: number
          new_stock?: number
          created_by?: string | null
        }
        Update: { [key: string]: unknown }
      }
      media: {
        Row: {
          id: string
          name: string
          url: string
          type: string
          size: number
          folder: string | null
          metadata: Record<string, unknown> | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          url: string
          type: string
          size?: number
          folder?: string | null
          metadata?: Record<string, unknown> | null
        }
        Update: { [key: string]: unknown }
      }
      settings: {
        Row: {
          id: number
          key: string
          value: string | null
          type: string
          updated_at: string
        }
        Insert: {
          id?: number
          key: string
          value?: string | null
          type?: string
        }
        Update: { value?: string | null; type?: string }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          is_read: boolean
          data: Record<string, unknown> | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type?: string
          title: string
          message: string
          is_read?: boolean
          data?: Record<string, unknown> | null
        }
        Update: { is_read?: boolean }
      }
    }
    Views: { [key: string]: never }
    Functions: {
      slugify: { Args: { raw: string }; Returns: string }
      is_staff: { Args: Record<string, never>; Returns: boolean }
      generate_order_number: { Args: Record<string, never>; Returns: string }
    }
    Enums: {
      product_status: 'active' | 'draft' | 'archived' | 'hidden'
      review_status: 'pending' | 'approved' | 'rejected'
      coupon_type: 'percentage' | 'fixed' | 'free_shipping'
    }
  }
}

export type Schema = Database['public']
export type Tables = Schema['Tables']

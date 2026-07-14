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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      account_connections: {
        Row: {
          connected_at: string
          id: string
          org_id: string | null
          provider: string
          user_id: string
        }
        Insert: {
          connected_at?: string
          id?: string
          org_id?: string | null
          provider: string
          user_id: string
        }
        Update: {
          connected_at?: string
          id?: string
          org_id?: string | null
          provider?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_connections_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_events: {
        Row: {
          actor_id: string
          created_at: string
          id: string
          metadata: Json
          org_id: string
          subject_id: string | null
          subject_type: string | null
          summary: string
          verb: string
        }
        Insert: {
          actor_id: string
          created_at?: string
          id?: string
          metadata?: Json
          org_id: string
          subject_id?: string | null
          subject_type?: string | null
          summary: string
          verb: string
        }
        Update: {
          actor_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          org_id?: string
          subject_id?: string | null
          subject_type?: string | null
          summary?: string
          verb?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_requests: {
        Row: {
          created_at: string
          decided_at: string | null
          decided_by: string | null
          decision_note: string | null
          id: string
          org_id: string
          rationale: string | null
          requester_id: string
          status: string
          subject_id: string | null
          subject_type: string | null
          title: string
        }
        Insert: {
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_note?: string | null
          id?: string
          org_id: string
          rationale?: string | null
          requester_id: string
          status?: string
          subject_id?: string | null
          subject_type?: string | null
          title: string
        }
        Update: {
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_note?: string | null
          id?: string
          org_id?: string
          rationale?: string | null
          requester_id?: string
          status?: string
          subject_id?: string | null
          subject_type?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_requests_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          org_id: string
          subject_id: string
          subject_type: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          org_id: string
          subject_id: string
          subject_type: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          org_id?: string
          subject_id?: string
          subject_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          alt_text: string | null
          created_at: string
          created_by: string
          duration_seconds: number | null
          filename: string | null
          height: number | null
          id: string
          kind: string
          mime_type: string | null
          org_id: string
          size_bytes: number | null
          tags: string[] | null
          thumbnail_url: string | null
          url: string
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          created_by: string
          duration_seconds?: number | null
          filename?: string | null
          height?: number | null
          id?: string
          kind: string
          mime_type?: string | null
          org_id: string
          size_bytes?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          url: string
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          created_by?: string
          duration_seconds?: number | null
          filename?: string | null
          height?: number | null
          id?: string
          kind?: string
          mime_type?: string | null
          org_id?: string
          size_bytes?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          url?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      mentions: {
        Row: {
          comment_id: string
          created_at: string
          mentioned_user_id: string
          org_id: string
          read_at: string | null
        }
        Insert: {
          comment_id: string
          created_at?: string
          mentioned_user_id: string
          org_id: string
          read_at?: string | null
        }
        Update: {
          comment_id?: string
          created_at?: string
          mentioned_user_id?: string
          org_id?: string
          read_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      metric_snapshots: {
        Row: {
          captured_at: string
          confidence: number
          created_at: string
          currency: string | null
          dimension_key: string
          dimensions: Json
          granularity: string
          id: string
          metric: string
          org_id: string | null
          period_start: string
          provider: string
          user_id: string
          value: number
        }
        Insert: {
          captured_at?: string
          confidence?: number
          created_at?: string
          currency?: string | null
          dimension_key?: string
          dimensions?: Json
          granularity: string
          id?: string
          metric: string
          org_id?: string | null
          period_start: string
          provider: string
          user_id: string
          value: number
        }
        Update: {
          captured_at?: string
          confidence?: number
          created_at?: string
          currency?: string | null
          dimension_key?: string
          dimensions?: Json
          granularity?: string
          id?: string
          metric?: string
          org_id?: string | null
          period_start?: string
          provider?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "metric_snapshots_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_events: {
        Row: {
          anon_id: string
          created_at: string
          event_type: string
          id: string
          step_id: string | null
        }
        Insert: {
          anon_id: string
          created_at?: string
          event_type: string
          id?: string
          step_id?: string | null
        }
        Update: {
          anon_id?: string
          created_at?: string
          event_type?: string
          id?: string
          step_id?: string | null
        }
        Relationships: []
      }
      onboarding_responses: {
        Row: {
          ai_features: string[]
          anon_id: string
          cadence: string | null
          completed: boolean
          connected_platforms: string[]
          country: string | null
          created_at: string
          device_type: string | null
          frustrations: string[]
          goals: string[]
          platforms: string[]
          referral_source: string | null
          timezone: string | null
          updated_at: string
          user_type: string[]
        }
        Insert: {
          ai_features?: string[]
          anon_id: string
          cadence?: string | null
          completed?: boolean
          connected_platforms?: string[]
          country?: string | null
          created_at?: string
          device_type?: string | null
          frustrations?: string[]
          goals?: string[]
          platforms?: string[]
          referral_source?: string | null
          timezone?: string | null
          updated_at?: string
          user_type?: string[]
        }
        Update: {
          ai_features?: string[]
          anon_id?: string
          cadence?: string | null
          completed?: boolean
          connected_platforms?: string[]
          country?: string | null
          created_at?: string
          device_type?: string | null
          frustrations?: string[]
          goals?: string[]
          platforms?: string[]
          referral_source?: string | null
          timezone?: string | null
          updated_at?: string
          user_type?: string[]
        }
        Relationships: []
      }
      onboarding_sessions: {
        Row: {
          ai_training: Json
          analysis: Json | null
          answers: Json
          brand: Json
          checklist: Json
          completed_at: string | null
          connections: Json
          created_at: string
          current_step: string
          marketing_plan: Json | null
          plan_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_training?: Json
          analysis?: Json | null
          answers?: Json
          brand?: Json
          checklist?: Json
          completed_at?: string | null
          connections?: Json
          created_at?: string
          current_step?: string
          marketing_plan?: Json | null
          plan_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_training?: Json
          analysis?: Json | null
          answers?: Json
          brand?: Json
          checklist?: Json
          completed_at?: string | null
          connections?: Json
          created_at?: string
          current_step?: string
          marketing_plan?: Json | null
          plan_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      org_invites: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          org_id: string
          role: Database["public"]["Enums"]["org_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          org_id: string
          role?: Database["public"]["Enums"]["org_role"]
          token: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          org_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_invites_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_memberships: {
        Row: {
          invited_by: string | null
          joined_at: string
          org_id: string
          role: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Insert: {
          invited_by?: string | null
          joined_at?: string
          org_id: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Update: {
          invited_by?: string | null
          joined_at?: string
          org_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          created_by: string
          id: string
          is_personal: boolean
          name: string
          plan: string
          plan_renews_at: string | null
          plan_status: string | null
          slug: string
          stripe_customer_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          is_personal?: boolean
          name: string
          plan?: string
          plan_renews_at?: string | null
          plan_status?: string | null
          slug: string
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          is_personal?: boolean
          name?: string
          plan?: string
          plan_renews_at?: string | null
          plan_status?: string | null
          slug?: string
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      platform_endpoints: {
        Row: {
          auth_override: Json
          body: string | null
          created_at: string
          example_response: Json | null
          headers: Json
          http_method: string
          id: string
          last_status: number | null
          last_tested_at: string | null
          name: string
          pagination: Json
          parser: Json
          path: string
          platform_id: string
          query_params: Json
          rate_limit: Json
          updated_at: string
          validation: Json
        }
        Insert: {
          auth_override?: Json
          body?: string | null
          created_at?: string
          example_response?: Json | null
          headers?: Json
          http_method?: string
          id?: string
          last_status?: number | null
          last_tested_at?: string | null
          name: string
          pagination?: Json
          parser?: Json
          path?: string
          platform_id: string
          query_params?: Json
          rate_limit?: Json
          updated_at?: string
          validation?: Json
        }
        Update: {
          auth_override?: Json
          body?: string | null
          created_at?: string
          example_response?: Json | null
          headers?: Json
          http_method?: string
          id?: string
          last_status?: number | null
          last_tested_at?: string | null
          name?: string
          pagination?: Json
          parser?: Json
          path?: string
          platform_id?: string
          query_params?: Json
          rate_limit?: Json
          updated_at?: string
          validation?: Json
        }
        Relationships: [
          {
            foreignKeyName: "platform_endpoints_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_field_mappings: {
        Row: {
          aggregation: string | null
          calculation_formula: string | null
          category: string | null
          chart_type: string | null
          confirmed: boolean
          created_at: string
          data_type: string
          description: string | null
          display_name: string | null
          endpoint_id: string | null
          example_value: Json | null
          formatting: string | null
          id: string
          json_path: string
          platform_id: string
          unit: string | null
          updated_at: string
          validation: Json
          ROTHME_kpi: string
        }
        Insert: {
          aggregation?: string | null
          calculation_formula?: string | null
          category?: string | null
          chart_type?: string | null
          confirmed?: boolean
          created_at?: string
          data_type?: string
          description?: string | null
          display_name?: string | null
          endpoint_id?: string | null
          example_value?: Json | null
          formatting?: string | null
          id?: string
          json_path?: string
          platform_id: string
          unit?: string | null
          updated_at?: string
          validation?: Json
          ROTHME_kpi: string
        }
        Update: {
          aggregation?: string | null
          calculation_formula?: string | null
          category?: string | null
          chart_type?: string | null
          confirmed?: boolean
          created_at?: string
          data_type?: string
          description?: string | null
          display_name?: string | null
          endpoint_id?: string | null
          example_value?: Json | null
          formatting?: string | null
          id?: string
          json_path?: string
          platform_id?: string
          unit?: string | null
          updated_at?: string
          validation?: Json
          ROTHME_kpi?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_field_mappings_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "platform_endpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_field_mappings_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_integration_logs: {
        Row: {
          actor: string | null
          created_at: string
          event_type: string
          id: string
          message: string | null
          platform: string
          request: Json | null
          response: Json | null
          status_code: number | null
          success: boolean | null
        }
        Insert: {
          actor?: string | null
          created_at?: string
          event_type: string
          id?: string
          message?: string | null
          platform: string
          request?: Json | null
          response?: Json | null
          status_code?: number | null
          success?: boolean | null
        }
        Update: {
          actor?: string | null
          created_at?: string
          event_type?: string
          id?: string
          message?: string | null
          platform?: string
          request?: Json | null
          response?: Json | null
          status_code?: number | null
          success?: boolean | null
        }
        Relationships: []
      }
      platform_integrations: {
        Row: {
          config: Json
          created_at: string
          display_name: string
          enabled: boolean
          last_tested_at: string | null
          platform: string
          secrets_ciphertext: string | null
          status: string
          status_message: string | null
          updated_at: string
          verified: boolean
        }
        Insert: {
          config?: Json
          created_at?: string
          display_name: string
          enabled?: boolean
          last_tested_at?: string | null
          platform: string
          secrets_ciphertext?: string | null
          status?: string
          status_message?: string | null
          updated_at?: string
          verified?: boolean
        }
        Update: {
          config?: Json
          created_at?: string
          display_name?: string
          enabled?: boolean
          last_tested_at?: string | null
          platform?: string
          secrets_ciphertext?: string | null
          status?: string
          status_message?: string | null
          updated_at?: string
          verified?: boolean
        }
        Relationships: []
      }
      platform_kpi_mappings: {
        Row: {
          confirmed: boolean
          created_at: string
          data_type: string
          description: string | null
          external_field: string
          id: string
          internal_kpi: string
          platform: string
          update_frequency: string
          updated_at: string
        }
        Insert: {
          confirmed?: boolean
          created_at?: string
          data_type?: string
          description?: string | null
          external_field: string
          id?: string
          internal_kpi: string
          platform: string
          update_frequency?: string
          updated_at?: string
        }
        Update: {
          confirmed?: boolean
          created_at?: string
          data_type?: string
          description?: string | null
          external_field?: string
          id?: string
          internal_kpi?: string
          platform?: string
          update_frequency?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_kpi_mappings_platform_fkey"
            columns: ["platform"]
            isOneToOne: false
            referencedRelation: "platform_integrations"
            referencedColumns: ["platform"]
          },
        ]
      }
      platforms: {
        Row: {
          api_version: string | null
          auth_type: string
          authorization_url: string | null
          base_url: string | null
          category: string | null
          created_at: string
          created_by: string | null
          default_headers: Json
          description: string | null
          enabled: boolean
          id: string
          logo_url: string | null
          name: string
          notes: string | null
          rate_limit: Json
          redirect_uri: string | null
          refresh_url: string | null
          retry_count: number
          scopes: string[]
          secrets_ciphertext: string | null
          slug: string
          status: string
          timeout_ms: number
          token_url: string | null
          updated_at: string
          verified: boolean
          webhook_endpoint: string | null
        }
        Insert: {
          api_version?: string | null
          auth_type?: string
          authorization_url?: string | null
          base_url?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          default_headers?: Json
          description?: string | null
          enabled?: boolean
          id?: string
          logo_url?: string | null
          name: string
          notes?: string | null
          rate_limit?: Json
          redirect_uri?: string | null
          refresh_url?: string | null
          retry_count?: number
          scopes?: string[]
          secrets_ciphertext?: string | null
          slug: string
          status?: string
          timeout_ms?: number
          token_url?: string | null
          updated_at?: string
          verified?: boolean
          webhook_endpoint?: string | null
        }
        Update: {
          api_version?: string | null
          auth_type?: string
          authorization_url?: string | null
          base_url?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          default_headers?: Json
          description?: string | null
          enabled?: boolean
          id?: string
          logo_url?: string | null
          name?: string
          notes?: string | null
          rate_limit?: Json
          redirect_uri?: string | null
          refresh_url?: string | null
          retry_count?: number
          scopes?: string[]
          secrets_ciphertext?: string | null
          slug?: string
          status?: string
          timeout_ms?: number
          token_url?: string | null
          updated_at?: string
          verified?: boolean
          webhook_endpoint?: string | null
        }
        Relationships: []
      }
      plugin_events: {
        Row: {
          actor: string | null
          created_at: string
          event_type: string
          id: string
          installation_id: string | null
          latency_ms: number | null
          message: string | null
          module: string | null
          payload: Json | null
          plugin_slug: string
          status_code: number | null
          success: boolean | null
        }
        Insert: {
          actor?: string | null
          created_at?: string
          event_type: string
          id?: string
          installation_id?: string | null
          latency_ms?: number | null
          message?: string | null
          module?: string | null
          payload?: Json | null
          plugin_slug: string
          status_code?: number | null
          success?: boolean | null
        }
        Update: {
          actor?: string | null
          created_at?: string
          event_type?: string
          id?: string
          installation_id?: string | null
          latency_ms?: number | null
          message?: string | null
          module?: string | null
          payload?: Json | null
          plugin_slug?: string
          status_code?: number | null
          success?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "plugin_events_installation_id_fkey"
            columns: ["installation_id"]
            isOneToOne: false
            referencedRelation: "plugin_installations"
            referencedColumns: ["id"]
          },
        ]
      }
      plugin_health: {
        Row: {
          auth_ok: boolean
          avg_latency_ms: number | null
          health_score: number
          installation_id: string
          last_error_at: string | null
          last_error_message: string | null
          last_success_at: string | null
          online: boolean
          rate_limit_remaining: number | null
          updated_at: string
          webhook_ok: boolean
        }
        Insert: {
          auth_ok?: boolean
          avg_latency_ms?: number | null
          health_score?: number
          installation_id: string
          last_error_at?: string | null
          last_error_message?: string | null
          last_success_at?: string | null
          online?: boolean
          rate_limit_remaining?: number | null
          updated_at?: string
          webhook_ok?: boolean
        }
        Update: {
          auth_ok?: boolean
          avg_latency_ms?: number | null
          health_score?: number
          installation_id?: string
          last_error_at?: string | null
          last_error_message?: string | null
          last_success_at?: string | null
          online?: boolean
          rate_limit_remaining?: number | null
          updated_at?: string
          webhook_ok?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "plugin_health_installation_id_fkey"
            columns: ["installation_id"]
            isOneToOne: true
            referencedRelation: "plugin_installations"
            referencedColumns: ["id"]
          },
        ]
      }
      plugin_installations: {
        Row: {
          config: Json
          created_at: string
          enabled_modules: string[]
          granted_permissions: string[]
          id: string
          installed_by: string | null
          last_verified_at: string | null
          org_id: string
          plugin_slug: string
          secrets_ciphertext: string | null
          status: string
          updated_at: string
          verified: boolean
        }
        Insert: {
          config?: Json
          created_at?: string
          enabled_modules?: string[]
          granted_permissions?: string[]
          id?: string
          installed_by?: string | null
          last_verified_at?: string | null
          org_id: string
          plugin_slug: string
          secrets_ciphertext?: string | null
          status?: string
          updated_at?: string
          verified?: boolean
        }
        Update: {
          config?: Json
          created_at?: string
          enabled_modules?: string[]
          granted_permissions?: string[]
          id?: string
          installed_by?: string | null
          last_verified_at?: string | null
          org_id?: string
          plugin_slug?: string
          secrets_ciphertext?: string | null
          status?: string
          updated_at?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "plugin_installations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plugin_installations_plugin_slug_fkey"
            columns: ["plugin_slug"]
            isOneToOne: false
            referencedRelation: "plugin_registry"
            referencedColumns: ["slug"]
          },
        ]
      }
      plugin_registry: {
        Row: {
          api_version: string | null
          category: string | null
          created_at: string
          declared_modules: string[]
          declared_permissions: string[]
          description: string | null
          developer: string
          docs_url: string | null
          icon: string | null
          id: string
          is_official: boolean
          manifest: Json
          name: string
          slug: string
          updated_at: string
          version: string
        }
        Insert: {
          api_version?: string | null
          category?: string | null
          created_at?: string
          declared_modules?: string[]
          declared_permissions?: string[]
          description?: string | null
          developer?: string
          docs_url?: string | null
          icon?: string | null
          id?: string
          is_official?: boolean
          manifest?: Json
          name: string
          slug: string
          updated_at?: string
          version?: string
        }
        Update: {
          api_version?: string | null
          category?: string | null
          created_at?: string
          declared_modules?: string[]
          declared_permissions?: string[]
          description?: string | null
          developer?: string
          docs_url?: string | null
          icon?: string | null
          id?: string
          is_official?: boolean
          manifest?: Json
          name?: string
          slug?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      post_schedules: {
        Row: {
          attempts: number
          created_at: string
          error: string | null
          external_id: string | null
          external_url: string | null
          id: string
          platform_id: string
          post_id: string
          published_at: string | null
          scheduled_at: string
          status: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          error?: string | null
          external_id?: string | null
          external_url?: string | null
          id?: string
          platform_id: string
          post_id: string
          published_at?: string | null
          scheduled_at: string
          status?: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          error?: string | null
          external_id?: string | null
          external_url?: string | null
          id?: string
          platform_id?: string
          post_id?: string
          published_at?: string | null
          scheduled_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_schedules_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_variants: {
        Row: {
          body: string
          created_at: string
          id: string
          media_ids: string[] | null
          platform_id: string
          platform_meta: Json | null
          post_id: string
          updated_at: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          media_ids?: string[] | null
          platform_id: string
          platform_meta?: Json | null
          post_id: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          media_ids?: string[] | null
          platform_id?: string
          platform_meta?: Json | null
          post_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_variants_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          ai_meta: Json | null
          approval_status: string
          body: string
          campaign_id: string | null
          created_at: string
          created_by: string
          id: string
          org_id: string
          status: string
          tags: string[] | null
          title: string | null
          updated_at: string
        }
        Insert: {
          ai_meta?: Json | null
          approval_status?: string
          body?: string
          campaign_id?: string | null
          created_at?: string
          created_by: string
          id?: string
          org_id: string
          status?: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          ai_meta?: Json | null
          approval_status?: string
          body?: string
          campaign_id?: string | null
          created_at?: string
          created_by?: string
          id?: string
          org_id?: string
          status?: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active_org_id: string | null
          business_name: string | null
          created_at: string
          full_name: string | null
          id: string
          onboarded_at: string | null
          updated_at: string
        }
        Insert: {
          active_org_id?: string | null
          business_name?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          onboarded_at?: string | null
          updated_at?: string
        }
        Update: {
          active_org_id?: string | null
          business_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          onboarded_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_active_org_id_fkey"
            columns: ["active_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      social_connections: {
        Row: {
          created_at: string
          external_account_id: string | null
          external_handle: string | null
          health_score: number
          health_updated_at: string
          id: string
          last_error_kind: string | null
          last_error_message: string | null
          last_synced_at: string | null
          org_id: string
          platform: string
          status: string
          tokens_ciphertext: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          external_account_id?: string | null
          external_handle?: string | null
          health_score?: number
          health_updated_at?: string
          id?: string
          last_error_kind?: string | null
          last_error_message?: string | null
          last_synced_at?: string | null
          org_id: string
          platform: string
          status?: string
          tokens_ciphertext: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          external_account_id?: string | null
          external_handle?: string | null
          health_score?: number
          health_updated_at?: string
          id?: string
          last_error_kind?: string | null
          last_error_message?: string | null
          last_synced_at?: string | null
          org_id?: string
          platform?: string
          status?: string
          tokens_ciphertext?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_connections_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      social_events: {
        Row: {
          connection_id: string | null
          created_at: string
          data: Json
          event: string
          id: string
          level: string
          org_id: string | null
          platform: string | null
          request_id: string | null
          scope: string
        }
        Insert: {
          connection_id?: string | null
          created_at?: string
          data?: Json
          event: string
          id?: string
          level?: string
          org_id?: string | null
          platform?: string | null
          request_id?: string | null
          scope?: string
        }
        Update: {
          connection_id?: string | null
          created_at?: string
          data?: Json
          event?: string
          id?: string
          level?: string
          org_id?: string | null
          platform?: string | null
          request_id?: string | null
          scope?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_events_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "social_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          org_id: string | null
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          org_id?: string | null
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          org_id?: string | null
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee_id: string | null
          assigner_id: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          org_id: string
          status: string
          subject_id: string | null
          subject_type: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          assigner_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          org_id: string
          status?: string
          subject_id?: string | null
          subject_type?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          assigner_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          org_id?: string
          status?: string
          subject_id?: string | null
          subject_type?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weekly_reports: {
        Row: {
          created_at: string
          id: string
          org_id: string | null
          payload: Json
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id?: string | null
          payload: Json
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string | null
          payload?: Json
          user_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_reports_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_first_admin: { Args: never; Returns: boolean }
      ensure_personal_org: {
        Args: { _name: string; _user: string }
        Returns: string
      }
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      has_org_role: {
        Args: { _min_role: string; _org: string; _user: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_member: { Args: { _org: string; _user: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      org_role: "owner" | "admin" | "member"
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
      app_role: ["admin", "moderator", "user"],
      org_role: ["owner", "admin", "member"],
    },
  },
} as const

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string;
          email: string;
          role: "student" | "recruiter" | "organizer";
          avatar_url: string | null;
          bio: string | null;
          university: string | null;
          program: string | null;
          graduation_year: number | null;
          gpa: number | null;
          gpa_public: boolean;
          available_for: string[];
          onboarding_completed: boolean;
          notification_preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name: string;
          email: string;
          role: "student" | "recruiter" | "organizer";
          avatar_url?: string | null;
          bio?: string | null;
          university?: string | null;
          program?: string | null;
          graduation_year?: number | null;
          gpa?: number | null;
          gpa_public?: boolean;
          available_for?: string[];
          onboarding_completed?: boolean;
          notification_preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string;
          email?: string;
          role?: "student" | "recruiter" | "organizer";
          avatar_url?: string | null;
          bio?: string | null;
          university?: string | null;
          program?: string | null;
          graduation_year?: number | null;
          gpa?: number | null;
          gpa_public?: boolean;
          available_for?: string[];
          onboarding_completed?: boolean;
          notification_preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          profile_id: string;
          title: string;
          description: string | null;
          tech_stack: string[];
          github_url: string | null;
          live_url: string | null;
          display_order: number;
          is_imported: boolean;
          github_repo_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          title: string;
          description?: string | null;
          tech_stack?: string[];
          github_url?: string | null;
          live_url?: string | null;
          display_order?: number;
          is_imported?: boolean;
          github_repo_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          title?: string;
          description?: string | null;
          tech_stack?: string[];
          github_url?: string | null;
          live_url?: string | null;
          display_order?: number;
          is_imported?: boolean;
          github_repo_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      project_screenshots: {
        Row: {
          id: string;
          project_id: string;
          image_url: string;
          alt_text: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          image_url: string;
          alt_text?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          image_url?: string;
          alt_text?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_screenshots_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      skills: {
        Row: {
          id: string;
          profile_id: string;
          name: string;
          source: "manual" | "github";
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          name: string;
          source?: "manual" | "github";
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          name?: string;
          source?: "manual" | "github";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "skills_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      certifications: {
        Row: {
          id: string;
          profile_id: string;
          name: string;
          issuer: string;
          issue_date: string | null;
          credential_url: string | null;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          name: string;
          issuer: string;
          issue_date?: string | null;
          credential_url?: string | null;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          name?: string;
          issuer?: string;
          issue_date?: string | null;
          credential_url?: string | null;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "certifications_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      education: {
        Row: {
          id: string;
          profile_id: string;
          institution: string;
          degree: string;
          field_of_study: string | null;
          start_date: string | null;
          end_date: string | null;
          gpa: number | null;
          courses: string[];
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          institution: string;
          degree: string;
          field_of_study?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          gpa?: number | null;
          courses?: string[];
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          institution?: string;
          degree?: string;
          field_of_study?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          gpa?: number | null;
          courses?: string[];
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "education_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      blog_posts: {
        Row: {
          id: string;
          profile_id: string;
          title: string;
          slug: string;
          content: Json;
          content_plain: string | null;
          status: "draft" | "published";
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          title: string;
          slug: string;
          content: Json;
          content_plain?: string | null;
          status?: "draft" | "published";
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          title?: string;
          slug?: string;
          content?: Json;
          content_plain?: string | null;
          status?: "draft" | "published";
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "blog_posts_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      portfolio_photos: {
        Row: {
          id: string;
          profile_id: string;
          image_url: string;
          caption: string | null;
          alt_text: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          image_url: string;
          caption?: string | null;
          alt_text?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          image_url?: string;
          caption?: string | null;
          alt_text?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "portfolio_photos_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      social_links: {
        Row: {
          id: string;
          profile_id: string;
          platform:
            | "github"
            | "linkedin"
            | "website"
            | "twitter"
            | "other";
          url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          platform:
            | "github"
            | "linkedin"
            | "website"
            | "twitter"
            | "other";
          url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          platform?:
            | "github"
            | "linkedin"
            | "website"
            | "twitter"
            | "other";
          url?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "social_links_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      portfolio_section_order: {
        Row: {
          id: string;
          profile_id: string;
          section_order: string[];
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          section_order?: string[];
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          section_order?: string[];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "portfolio_section_order_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      resumes: {
        Row: {
          id: string;
          profile_id: string;
          template: string;
          resume_data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          template?: string;
          resume_data?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          template?: string;
          resume_data?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resumes_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      portfolio_snapshots: {
        Row: {
          id: string;
          profile_id: string;
          snapshot_data: Json;
          trigger_type:
            | "monthly"
            | "project_added"
            | "certification_added"
            | "manual";
          trigger_description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          snapshot_data: Json;
          trigger_type:
            | "monthly"
            | "project_added"
            | "certification_added"
            | "manual";
          trigger_description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          snapshot_data?: Json;
          trigger_type?:
            | "monthly"
            | "project_added"
            | "certification_added"
            | "manual";
          trigger_description?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "portfolio_snapshots_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      comments: {
        Row: {
          id: string;
          profile_id: string;
          target_type: "project" | "blog_post";
          target_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          target_type: "project" | "blog_post";
          target_id: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          target_type?: "project" | "blog_post";
          target_id?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      conversations: {
        Row: {
          id: string;
          participant_one: string;
          participant_two: string;
          last_message_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          participant_one: string;
          participant_two: string;
          last_message_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          participant_one?: string;
          participant_two?: string;
          last_message_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_participant_one_fkey";
            columns: ["participant_one"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_participant_two_fkey";
            columns: ["participant_two"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          content?: string;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      forum_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      forum_posts: {
        Row: {
          id: string;
          profile_id: string;
          category_id: string;
          title: string;
          content: Json;
          content_plain: string | null;
          is_flagged: boolean;
          flag_count: number;
          upvote_count: number;
          reply_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          category_id: string;
          title: string;
          content: Json;
          content_plain?: string | null;
          is_flagged?: boolean;
          flag_count?: number;
          upvote_count?: number;
          reply_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          category_id?: string;
          title?: string;
          content?: Json;
          content_plain?: string | null;
          is_flagged?: boolean;
          flag_count?: number;
          upvote_count?: number;
          reply_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "forum_posts_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "forum_posts_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "forum_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      forum_replies: {
        Row: {
          id: string;
          post_id: string;
          profile_id: string;
          content: Json;
          is_flagged: boolean;
          flag_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          profile_id: string;
          content: Json;
          is_flagged?: boolean;
          flag_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          profile_id?: string;
          content?: Json;
          is_flagged?: boolean;
          flag_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "forum_replies_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "forum_posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "forum_replies_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      forum_post_votes: {
        Row: {
          id: string;
          post_id: string;
          profile_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          profile_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          profile_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "forum_post_votes_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "forum_posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "forum_post_votes_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      forum_post_flags: {
        Row: {
          id: string;
          target_type: "post" | "reply";
          target_id: string;
          profile_id: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          target_type: "post" | "reply";
          target_id: string;
          profile_id: string;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          target_type?: "post" | "reply";
          target_id?: string;
          profile_id?: string;
          reason?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "forum_post_flags_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      events: {
        Row: {
          id: string;
          organizer_id: string;
          title: string;
          description: string;
          event_type: "hackathon" | "academic" | "workshop" | "other";
          event_date: string;
          registration_deadline: string | null;
          location_type: "online" | "offline" | "hybrid";
          location_details: string | null;
          required_skills: string[];
          registration_url: string | null;
          interest_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organizer_id: string;
          title: string;
          description: string;
          event_type: "hackathon" | "academic" | "workshop" | "other";
          event_date: string;
          registration_deadline?: string | null;
          location_type: "online" | "offline" | "hybrid";
          location_details?: string | null;
          required_skills?: string[];
          registration_url?: string | null;
          interest_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organizer_id?: string;
          title?: string;
          description?: string;
          event_type?: "hackathon" | "academic" | "workshop" | "other";
          event_date?: string;
          registration_deadline?: string | null;
          location_type?: "online" | "offline" | "hybrid";
          location_details?: string | null;
          required_skills?: string[];
          registration_url?: string | null;
          interest_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey";
            columns: ["organizer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      event_interests: {
        Row: {
          id: string;
          event_id: string;
          profile_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          profile_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          profile_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_interests_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_interests_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      team_posts: {
        Row: {
          id: string;
          profile_id: string;
          event_id: string | null;
          title: string;
          description: string;
          required_skills: string[];
          team_size_needed: number;
          contact_preference: "dm" | "comment" | "both";
          is_open: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          event_id?: string | null;
          title: string;
          description: string;
          required_skills?: string[];
          team_size_needed?: number;
          contact_preference?: "dm" | "comment" | "both";
          is_open?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          event_id?: string | null;
          title?: string;
          description?: string;
          required_skills?: string[];
          team_size_needed?: number;
          contact_preference?: "dm" | "comment" | "both";
          is_open?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "team_posts_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_posts_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
      team_post_comments: {
        Row: {
          id: string;
          team_post_id: string;
          profile_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          team_post_id: string;
          profile_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          team_post_id?: string;
          profile_id?: string;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "team_post_comments_team_post_id_fkey";
            columns: ["team_post_id"];
            isOneToOne: false;
            referencedRelation: "team_posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_post_comments_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      recruiter_bookmarks: {
        Row: {
          id: string;
          recruiter_id: string;
          student_id: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          recruiter_id: string;
          student_id: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          recruiter_id?: string;
          student_id?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recruiter_bookmarks_recruiter_id_fkey";
            columns: ["recruiter_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recruiter_bookmarks_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      job_postings: {
        Row: {
          id: string;
          recruiter_id: string;
          title: string;
          company: string;
          type: "job" | "internship";
          location: string | null;
          location_type: "onsite" | "remote" | "hybrid";
          salary_min: number | null;
          salary_max: number | null;
          description: string;
          required_skills: string[];
          application_deadline: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          recruiter_id: string;
          title: string;
          company: string;
          type: "job" | "internship";
          location?: string | null;
          location_type: "onsite" | "remote" | "hybrid";
          salary_min?: number | null;
          salary_max?: number | null;
          description: string;
          required_skills: string[];
          application_deadline?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          recruiter_id?: string;
          title?: string;
          company?: string;
          type?: "job" | "internship";
          location?: string | null;
          location_type?: "onsite" | "remote" | "hybrid";
          salary_min?: number | null;
          salary_max?: number | null;
          description?: string;
          required_skills?: string[];
          application_deadline?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "job_postings_recruiter_id_fkey";
            columns: ["recruiter_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      job_applications: {
        Row: {
          id: string;
          job_id: string;
          student_id: string;
          cover_letter: string | null;
          status: "pending" | "reviewing" | "accepted" | "rejected";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          student_id: string;
          cover_letter?: string | null;
          status?: "pending" | "reviewing" | "accepted" | "rejected";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          student_id?: string;
          cover_letter?: string | null;
          status?: "pending" | "reviewing" | "accepted" | "rejected";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "job_postings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "job_applications_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          profile_id: string;
          type:
            | "comment"
            | "dm"
            | "team_match"
            | "event_new"
            | "forum_reply"
            | "application"
            | "job_post";
          title: string;
          body: string | null;
          link: string | null;
          is_read: boolean;
          email_sent: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          type:
            | "comment"
            | "dm"
            | "team_match"
            | "event_new"
            | "forum_reply"
            | "application"
            | "job_post";
          title: string;
          body?: string | null;
          link?: string | null;
          is_read?: boolean;
          email_sent?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          type?:
            | "comment"
            | "dm"
            | "team_match"
            | "event_new"
            | "forum_reply"
            | "application"
            | "job_post";
          title?: string;
          body?: string | null;
          link?: string | null;
          is_read?: boolean;
          email_sent?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      github_connections: {
        Row: {
          id: string;
          profile_id: string;
          github_username: string;
          access_token: string;
          token_expires_at: string | null;
          last_synced_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          github_username: string;
          access_token: string;
          token_expires_at?: string | null;
          last_synced_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          github_username?: string;
          access_token?: string;
          token_expires_at?: string | null;
          last_synced_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "github_connections_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      connections: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "connections_follower_id_fkey";
            columns: ["follower_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "connections_following_id_fkey";
            columns: ["following_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      recruiter_subscriptions: {
        Row: {
          id: string;
          student_id: string;
          recruiter_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          recruiter_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          recruiter_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recruiter_subscriptions_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recruiter_subscriptions_recruiter_id_fkey";
            columns: ["recruiter_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Convenience type helpers
type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

import 'package:supabase_flutter/supabase_flutter.dart';

/// Same project the Next.js web app uses (see src/lib/supabase.ts).
/// The anon key is safe to embed in a client app — access is enforced by
/// Postgres Row Level Security policies on the Supabase project, not by
/// keeping this key secret.
class SupabaseConfig {
  static const String url = 'https://lfwguyfgyyemdkpdobij.supabase.co';
  static const String anonKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmd2d1eWZneXllbWRrcGRvYmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwMzg3OTQsImV4cCI6MjEwMTYxNDc5NH0.WFOAwMvWj00OYaqJFOrixXapXQ-KRkW00dTs_peuHRs';

  static Future<void> init() async {
    await Supabase.initialize(
      url: url,
      anonKey: anonKey,
    );
  }
}

SupabaseClient get supabase => Supabase.instance.client;

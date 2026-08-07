import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/supabase_config.dart';

class AuthRepository {
  Stream<AuthState> get authStateChanges => supabase.auth.onAuthStateChange;

  User? get currentUser => supabase.auth.currentUser;

  Future<void> signInWithPassword({required String email, required String password}) async {
    await supabase.auth.signInWithPassword(email: email, password: password);
  }

  Future<void> signUp({
    required String email,
    required String password,
    required String fullName,
  }) async {
    await supabase.auth.signUp(
      email: email,
      password: password,
      data: {'full_name': fullName},
    );
  }

  /// Requires Google OAuth to be configured in the Supabase Auth dashboard
  /// (redirect URL) and a matching OAuth client set up in Google Cloud
  /// Console for this app's package name / bundle id + SHA-1 fingerprint.
  ///
  /// On web there's no app-scheme handler to catch the redirect, so it goes
  /// back to the current page origin instead (same as the Next.js web app).
  Future<void> signInWithGoogle() async {
    await supabase.auth.signInWithOAuth(
      OAuthProvider.google,
      redirectTo: kIsWeb ? Uri.base.origin : 'io.supabase.guyubgowes://login-callback',
    );
  }

  Future<void> signOut() async {
    await supabase.auth.signOut();
  }
}

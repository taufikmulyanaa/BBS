import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../data/models/profile.dart';
import '../data/repositories/auth_repository.dart';
import '../data/repositories/profile_repository.dart';

final authRepositoryProvider = Provider((ref) => AuthRepository());
final profileRepositoryProvider = Provider((ref) => ProfileRepository());

/// Emits whenever Supabase's auth state changes (sign in / sign out / token refresh).
final authStateProvider = StreamProvider<AuthState>((ref) {
  return ref.watch(authRepositoryProvider).authStateChanges;
});

/// The current signed-in user, or null when signed out.
final currentUserProvider = Provider<User?>((ref) {
  final authState = ref.watch(authStateProvider).valueOrNull;
  return authState?.session?.user ?? ref.watch(authRepositoryProvider).currentUser;
});

/// The current user's `profiles` row (nama_lengkap, role, avatar, ...).
final currentProfileProvider = FutureProvider<Profile?>((ref) async {
  final user = ref.watch(currentUserProvider);
  if (user == null) return null;
  return ref.watch(profileRepositoryProvider).getProfile(user.id);
});

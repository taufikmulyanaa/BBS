import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../providers/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(currentProfileProvider);
    final user = ref.watch(currentUserProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Profil')),
      body: profileAsync.when(
        data: (profile) {
          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              Center(
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 40,
                      backgroundColor: AppTheme.primary,
                      backgroundImage: profile?.fotoProfilUrl != null && profile!.fotoProfilUrl!.isNotEmpty
                          ? NetworkImage(profile.fotoProfilUrl!)
                          : null,
                      child: (profile?.fotoProfilUrl == null || profile!.fotoProfilUrl!.isEmpty)
                          ? Text(
                              (profile?.namaLengkap ?? user?.email ?? 'U').substring(0, 1).toUpperCase(),
                              style: const TextStyle(color: Colors.black, fontSize: 28, fontWeight: FontWeight.bold),
                            )
                          : null,
                    ),
                    const SizedBox(height: 14),
                    Text(
                      profile?.namaLengkap ?? 'Anggota Gowes',
                      style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.bold, fontSize: 18),
                    ),
                    const SizedBox(height: 4),
                    Text(user?.email ?? '', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                    if (profile?.isAdmin == true) ...[
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppTheme.primary.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(999),
                          border: Border.all(color: AppTheme.primary.withValues(alpha: 0.4)),
                        ),
                        child: const Text('ADMIN', style: TextStyle(color: AppTheme.primary, fontSize: 10, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 32),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.surface,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppTheme.border),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.info_outline, color: AppTheme.textMuted, size: 18),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Edit profil, verifikasi rute, dan panel admin akan hadir di update berikutnya.',
                        style: TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              OutlinedButton.icon(
                onPressed: () => ref.read(authRepositoryProvider).signOut(),
                icon: const Icon(Icons.logout, size: 18, color: AppTheme.error),
                label: const Text('Keluar', style: TextStyle(color: AppTheme.error)),
                style: OutlinedButton.styleFrom(side: const BorderSide(color: AppTheme.error)),
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.primary)),
        error: (e, _) => Center(child: Text('Gagal memuat profil: $e', style: const TextStyle(color: AppTheme.error))),
      ),
    );
  }
}

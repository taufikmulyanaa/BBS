import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/state_views.dart';
import '../../../data/models/app_route.dart';
import '../../../data/models/open_ride.dart';
import '../../../data/models/forum_post_preview.dart';
import '../../../providers/home_provider.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final stats = ref.watch(homeStatsProvider);
    final routes = ref.watch(featuredRoutesProvider);
    final rides = ref.watch(upcomingRidesProvider);
    final posts = ref.watch(recentForumPostsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('GUYUB GOWES')),
      body: RefreshIndicator(
        color: AppTheme.primary,
        onRefresh: () async {
          ref.invalidate(homeStatsProvider);
          ref.invalidate(featuredRoutesProvider);
          ref.invalidate(upcomingRidesProvider);
          ref.invalidate(recentForumPostsProvider);
        },
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            stats.when(
              data: (s) => Row(
                children: [
                  Expanded(child: _StatCard(label: 'Anggota Aktif', value: s.anggotaAktif.toString())),
                  const SizedBox(width: 10),
                  Expanded(child: _StatCard(label: 'Rute Terverifikasi', value: s.ruteTerverifikasi.toString())),
                  const SizedBox(width: 10),
                  Expanded(child: _StatCard(label: 'Open Ride', value: s.openRideAktif.toString())),
                ],
              ),
              loading: () => const SizedBox(height: 80, child: LoadingView()),
              error: (e, _) => const SizedBox.shrink(),
            ),
            const SizedBox(height: 28),
            _SectionHeader(title: 'Rute Unggulan', onSeeAll: () => context.push('/routes')),
            const SizedBox(height: 12),
            routes.when(
              data: (list) => list.isEmpty
                  ? const _InlineEmpty(text: 'Belum ada rute.')
                  : SizedBox(
                      height: 150,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: list.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 12),
                        itemBuilder: (context, i) => _RoutePreviewCard(route: list[i]),
                      ),
                    ),
              loading: () => const SizedBox(height: 150, child: LoadingView()),
              error: (e, _) => const _InlineEmpty(text: 'Gagal memuat rute.'),
            ),
            const SizedBox(height: 28),
            _SectionHeader(title: 'Open Ride Terdekat', onSeeAll: () => context.push('/open-rides')),
            const SizedBox(height: 12),
            rides.when(
              data: (list) => list.isEmpty
                  ? const _InlineEmpty(text: 'Belum ada Open Ride mendatang.')
                  : Column(children: list.map((r) => _RidePreviewTile(ride: r)).toList()),
              loading: () => const SizedBox(height: 80, child: LoadingView()),
              error: (e, _) => const _InlineEmpty(text: 'Gagal memuat Open Ride.'),
            ),
            const SizedBox(height: 28),
            const _SectionHeader(title: 'Diskusi Forum Terbaru'),
            const SizedBox(height: 4),
            const Text(
              'Fitur Forum lengkap segera hadir di aplikasi mobile.',
              style: TextStyle(color: AppTheme.textMuted, fontSize: 11),
            ),
            const SizedBox(height: 12),
            posts.when(
              data: (list) => list.isEmpty
                  ? const _InlineEmpty(text: 'Belum ada diskusi.')
                  : Column(children: list.map((p) => _ForumPreviewTile(post: p)).toList()),
              loading: () => const SizedBox(height: 60, child: LoadingView()),
              error: (e, _) => const _InlineEmpty(text: 'Gagal memuat forum.'),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        children: [
          Text(value, style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 20)),
          const SizedBox(height: 4),
          Text(
            label,
            textAlign: TextAlign.center,
            style: const TextStyle(color: AppTheme.textSecondary, fontSize: 10),
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title, this.onSeeAll});

  final String title;
  final VoidCallback? onSeeAll;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.bold, fontSize: 15)),
        if (onSeeAll != null)
          TextButton(
            onPressed: onSeeAll,
            child: const Text('Lihat Semua', style: TextStyle(color: AppTheme.primary, fontSize: 12)),
          ),
      ],
    );
  }
}

class _InlineEmpty extends StatelessWidget {
  const _InlineEmpty({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(text, style: const TextStyle(color: AppTheme.textMuted, fontSize: 12));
  }
}

class _RoutePreviewCard extends StatelessWidget {
  const _RoutePreviewCard({required this.route});

  final AppRoute route;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/routes/${route.id}'),
      child: Container(
        width: 200,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppTheme.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppTheme.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            LevelBadge(level: route.level),
            const SizedBox(height: 8),
            Text(
              route.nama,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.bold, fontSize: 13),
            ),
            const Spacer(),
            Row(
              children: [
                const Icon(Icons.route, size: 13, color: AppTheme.textMuted),
                const SizedBox(width: 4),
                Text('${route.jarakKm} km', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11)),
                const Spacer(),
                const Icon(Icons.star, size: 13, color: AppTheme.primary),
                const SizedBox(width: 2),
                Text(route.ratingAvg.toStringAsFixed(1), style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _RidePreviewTile extends StatelessWidget {
  const _RidePreviewTile({required this.ride});

  final OpenRide ride;

  @override
  Widget build(BuildContext context) {
    final date = ride.tanggalWaktuDate;
    final dateLabel = date != null ? DateFormat('EEE, d MMM · HH:mm', 'id_ID').format(date) : '';

    return GestureDetector(
      onTap: () => context.push('/open-rides/${ride.id}'),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppTheme.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppTheme.border),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(dateLabel, style: const TextStyle(color: AppTheme.primary, fontSize: 11, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text(
                    ride.judul,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    ride.titikKumpul,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: AppTheme.textMuted),
          ],
        ),
      ),
    );
  }
}

class _ForumPreviewTile extends StatelessWidget {
  const _ForumPreviewTile({required this.post});

  final ForumPostPreview post;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 14,
            backgroundColor: AppTheme.primary,
            backgroundImage: post.authorAvatar != null && post.authorAvatar!.isNotEmpty
                ? NetworkImage(post.authorAvatar!)
                : null,
            child: (post.authorAvatar == null || post.authorAvatar!.isEmpty)
                ? Text(post.authorName.substring(0, 1).toUpperCase(), style: const TextStyle(color: Colors.black, fontSize: 11))
                : null,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(post.authorName, style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.bold, fontSize: 12)),
                const SizedBox(height: 2),
                Text(
                  post.isi,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

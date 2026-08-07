import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/state_views.dart';
import '../../../data/models/app_route.dart';
import '../../../data/models/open_ride.dart';
import '../../../providers/home_provider.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final routes = ref.watch(featuredRoutesProvider);
    final rides = ref.watch(upcomingRidesProvider);

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: RefreshIndicator(
          color: AppTheme.primary,
          onRefresh: () async {
            ref.invalidate(featuredRoutesProvider);
            ref.invalidate(upcomingRidesProvider);
          },
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _buildHeader(context),
              const SizedBox(height: 24),
              _buildShortcuts(context),
              const SizedBox(height: 32),
              _SectionHeader(title: 'Rute Populer', onSeeAll: () => context.push('/routes')),
              const SizedBox(height: 16),
              routes.when(
                data: (list) => list.isEmpty
                    ? const _InlineEmpty(text: 'Belum ada rute.')
                    : SizedBox(
                        height: 220,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          itemCount: list.length,
                          separatorBuilder: (_, __) => const SizedBox(width: 16),
                          itemBuilder: (context, i) => _RoutePreviewCard(route: list[i]),
                        ),
                      ),
                loading: () => const SizedBox(height: 220, child: LoadingView()),
                error: (e, _) => const _InlineEmpty(text: 'Gagal memuat rute.'),
              ),
              const SizedBox(height: 32),
              _SectionHeader(title: 'Open Ride Terdekat', onSeeAll: () => context.push('/open-rides')),
              const SizedBox(height: 16),
              rides.when(
                data: (list) => list.isEmpty
                    ? const _InlineEmpty(text: 'Belum ada Open Ride mendatang.')
                    : Column(children: list.map((r) => _RidePreviewTile(ride: r)).toList()),
                loading: () => const SizedBox(height: 120, child: LoadingView()),
                error: (e, _) => const _InlineEmpty(text: 'Gagal memuat Open Ride.'),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return const Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Halo, Ogie! 👋',
              style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 4),
            Text(
              'Selamat gowes hari ini!',
              style: TextStyle(color: AppTheme.textSecondary, fontSize: 13),
            ),
          ],
        ),
        CircleAvatar(
          radius: 20,
          backgroundColor: AppTheme.surfaceAlt,
          child: Icon(Icons.person, color: AppTheme.textSecondary),
        ),
      ],
    );
  }

  Widget _buildShortcuts(BuildContext context) {
    final items = [
      {'icon': Icons.directions_bike, 'label': 'Ride', 'route': '/home'},
      {'icon': Icons.map, 'label': 'Rute', 'route': '/routes'},
      {'icon': Icons.forum, 'label': 'Forum', 'route': '/forum'},
      {'icon': Icons.event, 'label': 'Event', 'route': '/open-rides'},
      {'icon': Icons.group, 'label': 'Chapter', 'route': '/home'},
    ];

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: items.map((item) {
        return GestureDetector(
          onTap: () => context.push(item['route'] as String),
          child: Column(
            children: [
              CircleAvatar(
                radius: 28,
                backgroundColor: AppTheme.surface,
                child: Icon(item['icon'] as IconData, color: Colors.white, size: 24),
              ),
              const SizedBox(height: 8),
              Text(
                item['label'] as String,
                style: const TextStyle(color: Colors.white, fontSize: 12),
              ),
            ],
          ),
        );
      }).toList(),
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
        Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
        if (onSeeAll != null)
          TextButton(
            onPressed: onSeeAll,
            child: const Text('Lihat semua', style: TextStyle(color: AppTheme.primary, fontSize: 12)),
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
    final hasImage = route.coverImageUrl != null && route.coverImageUrl!.isNotEmpty;
    
    return GestureDetector(
      onTap: () => context.push('/routes/${route.id}'),
      child: Container(
        width: 280,
        decoration: BoxDecoration(
          color: AppTheme.surfaceAlt,
          borderRadius: BorderRadius.circular(16),
          image: hasImage
              ? DecorationImage(image: NetworkImage(route.coverImageUrl!), fit: BoxFit.cover)
              : null,
        ),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            gradient: const LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Colors.transparent, Color(0xCC000000)],
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: route.level.toLowerCase() == 'easy' ? AppTheme.success : AppTheme.primary,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  route.level.toUpperCase(),
                  style: const TextStyle(color: Colors.black, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
              const Spacer(),
              Text(
                route.nama,
                style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.route, size: 14, color: AppTheme.textSecondary),
                  const SizedBox(width: 4),
                  Text('${route.jarakKm} km', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                  const SizedBox(width: 12),
                  const Icon(Icons.landscape, size: 14, color: AppTheme.textSecondary),
                  const SizedBox(width: 4),
                  Text('${route.elevasiM ?? 0} m elevasi', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.star, size: 14, color: AppTheme.primary),
                  const SizedBox(width: 4),
                  Text(route.ratingAvg.toStringAsFixed(1), style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                  const Text(' (120)', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10)),
                ],
              ),
            ],
          ),
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
    final day = date != null ? DateFormat('dd').format(date) : '--';
    final month = date != null ? DateFormat('MMM').format(date).toUpperCase() : '---';
    final fullDate = date != null ? DateFormat('EEEE, dd MMM yyyy • HH:mm', 'id_ID').format(date) : '';

    return GestureDetector(
      onTap: () => context.push('/open-rides/${ride.id}'),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppTheme.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.border, width: 0.5),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: AppTheme.background,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  Text(day, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                  Text(month, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 10)),
                ],
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(ride.judul, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text(fullDate, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.route, size: 14, color: AppTheme.textSecondary),
                      const SizedBox(width: 4),
                      Text('${ride.jarakKm} km', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                      const SizedBox(width: 16),
                      Icon(Icons.terrain, size: 14, color: ride.level.toLowerCase() == 'easy' ? AppTheme.success : AppTheme.primary),
                      const SizedBox(width: 4),
                      Text(ride.level, style: TextStyle(color: ride.level.toLowerCase() == 'easy' ? AppTheme.success : AppTheme.primary, fontSize: 12)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.location_on_outlined, size: 14, color: AppTheme.textSecondary),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(ride.titikKumpul, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12), overflow: TextOverflow.ellipsis),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.people_outline, size: 14, color: AppTheme.textSecondary),
                          const SizedBox(width: 4),
                          Text('${ride.participantCount} / ${ride.kuotaMaks} peserta', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppTheme.primary,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text('Join', style: TextStyle(color: Colors.black, fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

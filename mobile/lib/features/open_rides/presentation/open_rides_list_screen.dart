import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/state_views.dart';
import '../../../data/models/open_ride.dart';
import '../../../providers/open_rides_provider.dart';

class OpenRidesListScreen extends ConsumerStatefulWidget {
  const OpenRidesListScreen({super.key});

  @override
  ConsumerState<OpenRidesListScreen> createState() => _OpenRidesListScreenState();
}

class _OpenRidesListScreenState extends ConsumerState<OpenRidesListScreen> {
  String _search = '';
  String _levelFilter = 'all';

  @override
  Widget build(BuildContext context) {
    final ridesAsync = ref.watch(openRidesListProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Open Ride Bareng')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/open-rides/create'),
        backgroundColor: AppTheme.primary,
        foregroundColor: Colors.black,
        icon: const Icon(Icons.add),
        label: const Text('Buat Open Ride'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: TextField(
              style: const TextStyle(color: AppTheme.textPrimary),
              decoration: const InputDecoration(
                hintText: 'Cari ajakan gowes atau titik kumpul...',
                prefixIcon: Icon(Icons.search, color: AppTheme.textMuted),
              ),
              onChanged: (v) => setState(() => _search = v),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: ['all', 'easy', 'medium', 'hard'].map((level) {
                final selected = _levelFilter == level;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(level == 'all' ? 'Semua' : level.toUpperCase()),
                    selected: selected,
                    onSelected: (_) => setState(() => _levelFilter = level),
                    selectedColor: AppTheme.primary,
                    backgroundColor: AppTheme.surface,
                    labelStyle: TextStyle(color: selected ? Colors.black : AppTheme.textSecondary, fontSize: 11),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: RefreshIndicator(
              color: AppTheme.primary,
              onRefresh: () async => ref.invalidate(openRidesListProvider),
              child: ridesAsync.when(
                data: (rides) {
                  final filtered = rides.where((r) {
                    final matchesSearch = r.judul.toLowerCase().contains(_search.toLowerCase()) ||
                        r.titikKumpul.toLowerCase().contains(_search.toLowerCase());
                    final matchesLevel = _levelFilter == 'all' || r.level == _levelFilter;
                    return matchesSearch && matchesLevel;
                  }).toList();

                  if (filtered.isEmpty) {
                    return ListView(
                      children: const [
                        SizedBox(height: 80),
                        EmptyView(icon: Icons.event_busy, title: 'Belum Ada Ajakan Gowes', subtitle: 'Jadilah yang pertama membuat Open Ride!'),
                      ],
                    );
                  }

                  return ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 90),
                    itemCount: filtered.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, i) => _RideCard(ride: filtered[i]),
                  );
                },
                loading: () => const LoadingView(),
                error: (e, _) => ErrorView(message: 'Gagal memuat Open Ride: $e', onRetry: () => ref.invalidate(openRidesListProvider)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _RideCard extends StatelessWidget {
  const _RideCard({required this.ride});

  final OpenRide ride;

  @override
  Widget build(BuildContext context) {
    final date = ride.tanggalWaktuDate;
    final dateLabel = date != null ? DateFormat('EEEE, d MMM yyyy · HH:mm', 'id_ID').format(date) : '';

    return GestureDetector(
      onTap: () => context.push('/open-rides/${ride.id}'),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppTheme.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(dateLabel, style: const TextStyle(color: AppTheme.primary, fontSize: 11, fontWeight: FontWeight.bold)),
                ),
                LevelBadge(level: ride.level),
              ],
            ),
            const SizedBox(height: 10),
            Text(ride.judul, style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(Icons.location_on, size: 14, color: AppTheme.textMuted),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    ride.titikKumpul,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                const Icon(Icons.people, size: 14, color: AppTheme.primary),
                const SizedBox(width: 4),
                Text('${ride.participantCount} / ${ride.kuotaMaks}', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                const Spacer(),
                if (ride.isFull)
                  const Text('Kuota Penuh', style: TextStyle(color: AppTheme.error, fontSize: 11, fontWeight: FontWeight.bold)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

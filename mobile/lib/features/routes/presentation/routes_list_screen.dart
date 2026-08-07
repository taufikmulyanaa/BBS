import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/state_views.dart';
import '../../../data/models/app_route.dart';
import '../../../providers/routes_provider.dart';

class RoutesListScreen extends ConsumerStatefulWidget {
  const RoutesListScreen({super.key});

  @override
  ConsumerState<RoutesListScreen> createState() => _RoutesListScreenState();
}

class _RoutesListScreenState extends ConsumerState<RoutesListScreen> {
  String _search = '';
  String _levelFilter = 'all';

  @override
  Widget build(BuildContext context) {
    final routesAsync = ref.watch(routesListProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Direktori Rute')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: TextField(
              style: const TextStyle(color: AppTheme.textPrimary),
              decoration: const InputDecoration(
                hintText: 'Cari rute...',
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
              onRefresh: () async => ref.invalidate(routesListProvider),
              child: routesAsync.when(
                data: (routes) {
                  final filtered = routes.where((r) {
                    final matchesSearch = r.nama.toLowerCase().contains(_search.toLowerCase());
                    final matchesLevel = _levelFilter == 'all' || r.level == _levelFilter;
                    return matchesSearch && matchesLevel;
                  }).toList();

                  if (filtered.isEmpty) {
                    return ListView(
                      children: const [
                        SizedBox(height: 80),
                        EmptyView(icon: Icons.map_outlined, title: 'Belum Ada Rute', subtitle: 'Coba kata kunci atau filter lain.'),
                      ],
                    );
                  }

                  return ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: filtered.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, i) => _RouteCard(route: filtered[i]),
                  );
                },
                loading: () => const LoadingView(),
                error: (e, _) => ErrorView(message: 'Gagal memuat rute: $e', onRetry: () => ref.invalidate(routesListProvider)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _RouteCard extends StatelessWidget {
  const _RouteCard({required this.route});

  final AppRoute route;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/routes/${route.id}'),
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
                LevelBadge(level: route.level),
                const Spacer(),
                if (route.isVerified)
                  const Icon(Icons.verified, color: AppTheme.success, size: 16),
              ],
            ),
            const SizedBox(height: 10),
            Text(route.nama, style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.bold, fontSize: 15)),
            if (route.deskripsi != null && route.deskripsi!.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(
                route.deskripsi!,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
              ),
            ],
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(Icons.route, size: 14, color: AppTheme.textMuted),
                const SizedBox(width: 4),
                Text('${route.jarakKm} km', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                if (route.elevasiM != null) ...[
                  const SizedBox(width: 12),
                  const Icon(Icons.terrain, size: 14, color: AppTheme.textMuted),
                  const SizedBox(width: 4),
                  Text('${route.elevasiM} m', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                ],
                const Spacer(),
                const Icon(Icons.star, size: 14, color: AppTheme.primary),
                const SizedBox(width: 3),
                Text(
                  '${route.ratingAvg.toStringAsFixed(1)} (${route.ratingCount})',
                  style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

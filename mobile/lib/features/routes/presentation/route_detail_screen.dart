import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/state_views.dart';
import '../../../data/models/app_route.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/routes_provider.dart';

class RouteDetailScreen extends ConsumerStatefulWidget {
  const RouteDetailScreen({super.key, required this.routeId});

  final String routeId;

  @override
  ConsumerState<RouteDetailScreen> createState() => _RouteDetailScreenState();
}

class _RouteDetailScreenState extends ConsumerState<RouteDetailScreen> {
  bool? _saved;
  bool _savingToggle = false;
  int _newRating = 5;
  final _commentController = TextEditingController();
  bool _submitting = false;

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _checkSaved() async {
    final user = ref.read(currentUserProvider);
    if (user == null) return;
    final saved = await ref.read(routesRepositoryProvider).isRouteSaved(user.id, widget.routeId);
    if (mounted) setState(() => _saved = saved);
  }

  Future<void> _toggleSave() async {
    final user = ref.read(currentUserProvider);
    if (user == null) {
      _showLoginRequired();
      return;
    }
    setState(() => _savingToggle = true);
    try {
      final repo = ref.read(routesRepositoryProvider);
      if (_saved == true) {
        await repo.unsaveRoute(user.id, widget.routeId);
        setState(() => _saved = false);
      } else {
        await repo.saveRoute(user.id, widget.routeId);
        setState(() => _saved = true);
      }
    } finally {
      if (mounted) setState(() => _savingToggle = false);
    }
  }

  void _showLoginRequired() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Silakan masuk terlebih dahulu.')),
    );
  }

  Future<void> _openGpx(String url) async {
    final uri = Uri.tryParse(url);
    if (uri != null && await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  Future<void> _submitReview() async {
    final user = ref.read(currentUserProvider);
    if (user == null) {
      _showLoginRequired();
      return;
    }
    if (_commentController.text.trim().isEmpty) return;

    setState(() => _submitting = true);
    try {
      final profile = await ref.read(currentProfileProvider.future);
      await ref.read(routesRepositoryProvider).submitReview(
            routeId: widget.routeId,
            userId: user.id,
            userName: profile?.namaLengkap ?? 'Anggota Gowes',
            userAvatar: profile?.fotoProfilUrl,
            rating: _newRating,
            comment: _commentController.text.trim(),
          );
      _commentController.clear();
      setState(() => _newRating = 5);
      ref.invalidate(routeReviewsProvider(widget.routeId));
      ref.invalidate(routeDetailProvider(widget.routeId));
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal mengirim ulasan: $e')));
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _checkSaved());
  }

  @override
  Widget build(BuildContext context) {
    final routeAsync = ref.watch(routeDetailProvider(widget.routeId));
    final reviewsAsync = ref.watch(routeReviewsProvider(widget.routeId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detail Rute'),
        actions: [
          IconButton(
            onPressed: _savingToggle ? null : _toggleSave,
            icon: Icon(
              _saved == true ? Icons.bookmark : Icons.bookmark_border,
              color: _saved == true ? AppTheme.primary : AppTheme.textSecondary,
            ),
          ),
        ],
      ),
      body: routeAsync.when(
        data: (route) {
          if (route == null) {
            return const EmptyView(icon: Icons.map_outlined, title: 'Rute Tidak Ditemukan');
          }
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Row(
                children: [
                  LevelBadge(level: route.level),
                  const SizedBox(width: 8),
                  if (route.isVerified)
                    const Icon(Icons.verified, color: AppTheme.success, size: 16),
                ],
              ),
              const SizedBox(height: 10),
              Text(route.nama, style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.bold, fontSize: 20)),
              const SizedBox(height: 6),
              Row(
                children: [
                  const Icon(Icons.star, size: 16, color: AppTheme.primary),
                  const SizedBox(width: 4),
                  Text(
                    '${route.ratingAvg.toStringAsFixed(1)} (${route.ratingCount} ulasan)',
                    style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              _InfoRow(icon: Icons.route, label: 'Jarak', value: '${route.jarakKm} km'),
              if (route.elevasiM != null) _InfoRow(icon: Icons.terrain, label: 'Elevasi', value: '${route.elevasiM} m'),
              if (route.deskripsi != null && route.deskripsi!.isNotEmpty) ...[
                const SizedBox(height: 16),
                const Text('Deskripsi', style: TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.bold, fontSize: 14)),
                const SizedBox(height: 6),
                Text(route.deskripsi!, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13, height: 1.5)),
              ],
              if (route.gpxFileUrl != null && route.gpxFileUrl!.isNotEmpty) ...[
                const SizedBox(height: 20),
                OutlinedButton.icon(
                  onPressed: () => _openGpx(route.gpxFileUrl!),
                  icon: const Icon(Icons.download, size: 18),
                  label: const Text('Buka File GPX'),
                ),
              ],
              const SizedBox(height: 28),
              const Text('Ulasan', style: TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.bold, fontSize: 15)),
              const SizedBox(height: 12),
              _ReviewForm(
                rating: _newRating,
                onRatingChanged: (r) => setState(() => _newRating = r),
                controller: _commentController,
                submitting: _submitting,
                onSubmit: _submitReview,
              ),
              const SizedBox(height: 16),
              reviewsAsync.when(
                data: (reviews) {
                  if (reviews.isEmpty) {
                    return const Text('Belum ada ulasan untuk rute ini.', style: TextStyle(color: AppTheme.textMuted, fontSize: 12));
                  }
                  return Column(children: reviews.map((r) => _ReviewTile(review: r)).toList());
                },
                loading: () => const LoadingView(),
                error: (e, _) => Text('Gagal memuat ulasan: $e', style: const TextStyle(color: AppTheme.error, fontSize: 12)),
              ),
              const SizedBox(height: 24),
            ],
          );
        },
        loading: () => const LoadingView(),
        error: (e, _) => ErrorView(message: 'Gagal memuat rute: $e', onRetry: () => ref.invalidate(routeDetailProvider(widget.routeId))),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.icon, required this.label, required this.value});

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppTheme.primary),
          const SizedBox(width: 8),
          Text('$label:', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
          const SizedBox(width: 6),
          Text(value, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

class _ReviewForm extends StatelessWidget {
  const _ReviewForm({
    required this.rating,
    required this.onRatingChanged,
    required this.controller,
    required this.submitting,
    required this.onSubmit,
  });

  final int rating;
  final ValueChanged<int> onRatingChanged;
  final TextEditingController controller;
  final bool submitting;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: List.generate(5, (i) {
              final star = i + 1;
              return IconButton(
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
                onPressed: () => onRatingChanged(star),
                icon: Icon(
                  star <= rating ? Icons.star : Icons.star_border,
                  color: AppTheme.primary,
                  size: 22,
                ),
              );
            }),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: controller,
            maxLines: 3,
            style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13),
            decoration: const InputDecoration(hintText: 'Bagikan pengalaman gowes di rute ini...'),
          ),
          const SizedBox(height: 10),
          Align(
            alignment: Alignment.centerRight,
            child: ElevatedButton(
              onPressed: submitting ? null : onSubmit,
              child: Text(submitting ? 'Mengirim...' : 'Kirim Ulasan'),
            ),
          ),
        ],
      ),
    );
  }
}

class _ReviewTile extends StatelessWidget {
  const _ReviewTile({required this.review});

  final RouteReview review;

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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 14,
                backgroundColor: AppTheme.primary,
                backgroundImage: review.userAvatar != null && review.userAvatar!.isNotEmpty
                    ? NetworkImage(review.userAvatar!)
                    : null,
                child: (review.userAvatar == null || review.userAvatar!.isEmpty)
                    ? Text(
                        (review.userName ?? 'A').substring(0, 1).toUpperCase(),
                        style: const TextStyle(color: Colors.black, fontSize: 11),
                      )
                    : null,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(review.userName ?? 'Anggota Gowes', style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.bold, fontSize: 12)),
              ),
              Row(
                children: List.generate(
                  5,
                  (i) => Icon(
                    i < review.rating ? Icons.star : Icons.star_border,
                    size: 12,
                    color: AppTheme.primary,
                  ),
                ),
              ),
            ],
          ),
          if (review.comment != null && review.comment!.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(review.comment!, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
          ],
        ],
      ),
    );
  }
}

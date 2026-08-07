import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/state_views.dart';
import '../../../data/models/app_route.dart';
import '../../../data/models/forum_post_preview.dart';
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

  void _openMap(AppRoute route) {
    context.push('/routes/${route.id}/map', extra: route);
  }

  void _share(AppRoute route) {
    final elevasi = route.elevasiM != null ? ', ${route.elevasiM} m elevasi' : '';
    Share.share('Cek rute "${route.nama}" di Guyub Gowes! ${route.jarakKm} km$elevasi.');
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
    final discussionAsync = ref.watch(routeLatestDiscussionProvider(widget.routeId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detail Rute'),
        actions: [
          routeAsync.maybeWhen(
            data: (route) => route == null
                ? const SizedBox.shrink()
                : IconButton(
                    onPressed: () => _share(route),
                    icon: const Icon(Icons.share, color: AppTheme.textSecondary),
                  ),
            orElse: () => const SizedBox.shrink(),
          ),
        ],
      ),
      body: routeAsync.when(
        data: (route) {
          if (route == null) {
            return const EmptyView(icon: Icons.map_outlined, title: 'Rute Tidak Ditemukan');
          }
          return ListView(
            padding: EdgeInsets.zero,
            children: [
              _HeroImage(route: route),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      route.nama,
                      style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.bold, fontSize: 22),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.route, size: 16, color: AppTheme.textSecondary),
                        const SizedBox(width: 4),
                        Text('${route.jarakKm} km', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                        if (route.elevasiM != null) ...[
                          const SizedBox(width: 16),
                          const Icon(Icons.terrain, size: 16, color: AppTheme.textSecondary),
                          const SizedBox(width: 4),
                          Text('${route.elevasiM} m elevasi', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                        ],
                        const SizedBox(width: 16),
                        const Icon(Icons.star, size: 16, color: AppTheme.primary),
                        const SizedBox(width: 4),
                        Text(
                          '${route.ratingAvg.toStringAsFixed(1)} (${route.ratingCount})',
                          style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                        ),
                      ],
                    ),
                    if (route.tags.isNotEmpty) ...[
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: route.tags
                            .map((tag) => Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: AppTheme.surfaceAlt,
                                    borderRadius: BorderRadius.circular(999),
                                  ),
                                  child: Text(tag, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 12)),
                                ))
                            .toList(),
                      ),
                    ],
                    if (route.deskripsi != null && route.deskripsi!.isNotEmpty) ...[
                      const SizedBox(height: 14),
                      Text(
                        route.deskripsi!,
                        style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13, height: 1.5),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 12),
              _ActionRow(
                route: route,
                saved: _saved == true,
                savingToggle: _savingToggle,
                onToggleSave: _toggleSave,
                onDownloadGpx: () => _openGpx(route.gpxFileUrl!),
                onViewMap: () => _openMap(route),
                onShare: () => _share(route),
              ),
              const Divider(height: 1),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (route.hasRouteInfo) ...[
                      const _SectionTitle('Info Rute'),
                      const SizedBox(height: 12),
                      _InfoRuteCard(route: route),
                      const SizedBox(height: 24),
                    ],
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const _SectionTitle('Diskusi Terbaru'),
                        TextButton(
                          onPressed: () => context.push('/forum'),
                          child: const Text('Lihat Semua', style: TextStyle(color: AppTheme.primary, fontSize: 12)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    discussionAsync.when(
                      data: (post) => post == null
                          ? const Text(
                              'Belum ada diskusi untuk rute ini.',
                              style: TextStyle(color: AppTheme.textMuted, fontSize: 12),
                            )
                          : _DiscussionCard(post: post),
                      loading: () => const SizedBox(height: 60, child: LoadingView()),
                      error: (e, _) => Text('Gagal memuat diskusi: $e', style: const TextStyle(color: AppTheme.error, fontSize: 12)),
                    ),
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
                ),
              ),
            ],
          );
        },
        loading: () => const LoadingView(),
        error: (e, _) => ErrorView(message: 'Gagal memuat rute: $e', onRetry: () => ref.invalidate(routeDetailProvider(widget.routeId))),
      ),
    );
  }
}

class _HeroImage extends StatelessWidget {
  const _HeroImage({required this.route});

  final AppRoute route;

  @override
  Widget build(BuildContext context) {
    final hasImage = route.coverImageUrl != null && route.coverImageUrl!.isNotEmpty;

    return SizedBox(
      height: 220,
      child: Stack(
        fit: StackFit.expand,
        children: [
          if (hasImage)
            CachedNetworkImage(
              imageUrl: route.coverImageUrl!,
              fit: BoxFit.cover,
              placeholder: (context, url) => Container(color: AppTheme.surfaceAlt),
              errorWidget: (context, url, error) => Container(
                color: AppTheme.surfaceAlt,
                child: const Icon(Icons.image_not_supported_outlined, color: AppTheme.textMuted),
              ),
            )
          else
            Container(
              color: AppTheme.surfaceAlt,
              child: const Center(child: Icon(Icons.landscape_outlined, color: AppTheme.textMuted, size: 48)),
            ),
          Positioned(
            left: 12,
            top: 12,
            child: LevelBadge(level: route.level),
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            height: 80,
            child: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Colors.transparent, Color(0xE6141415)],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  const _ActionButton({
    required this.icon,
    required this.label,
    required this.onTap,
    this.highlighted = false,
  });

  final IconData icon;
  final String label;
  final VoidCallback? onTap;
  final bool highlighted;

  @override
  Widget build(BuildContext context) {
    final color = highlighted ? AppTheme.primary : AppTheme.textSecondary;
    final disabled = onTap == null;
    return GestureDetector(
      onTap: onTap,
      child: Opacity(
        opacity: disabled ? 0.4 : 1,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: highlighted ? AppTheme.primary.withValues(alpha: 0.15) : AppTheme.surfaceAlt,
              ),
              child: Icon(icon, color: color),
            ),
            const SizedBox(height: 6),
            Text(label, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }
}

class _ActionRow extends StatelessWidget {
  const _ActionRow({
    required this.route,
    required this.saved,
    required this.savingToggle,
    required this.onToggleSave,
    required this.onDownloadGpx,
    required this.onViewMap,
    required this.onShare,
  });

  final AppRoute route;
  final bool saved;
  final bool savingToggle;
  final VoidCallback onToggleSave;
  final VoidCallback onDownloadGpx;
  final VoidCallback onViewMap;
  final VoidCallback onShare;

  @override
  Widget build(BuildContext context) {
    final hasGpx = route.gpxFileUrl != null && route.gpxFileUrl!.isNotEmpty;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _ActionButton(
            icon: Icons.download,
            label: 'Unduh GPX',
            highlighted: hasGpx,
            onTap: hasGpx ? onDownloadGpx : null,
          ),
          _ActionButton(
            icon: saved ? Icons.bookmark : Icons.bookmark_border,
            label: 'Simpan',
            highlighted: saved,
            onTap: savingToggle ? null : onToggleSave,
          ),
          _ActionButton(
            icon: Icons.map_outlined,
            label: 'Lihat Peta',
            onTap: hasGpx ? onViewMap : null,
          ),
          _ActionButton(
            icon: Icons.share,
            label: 'Bagikan',
            onTap: onShare,
          ),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.only(left: 12),
      decoration: const BoxDecoration(
        border: Border(left: BorderSide(color: AppTheme.primary, width: 3)),
      ),
      child: Text(text, style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.bold, fontSize: 16)),
    );
  }
}

class _InfoRuteCard extends StatelessWidget {
  const _InfoRuteCard({required this.route});

  final AppRoute route;

  @override
  Widget build(BuildContext context) {
    final rows = <MapEntry<String, String>>[
      if (route.titikAwal != null) MapEntry('Titik Awal', route.titikAwal!),
      if (route.titikAkhir != null) MapEntry('Titik Akhir', route.titikAkhir!),
      if (route.permukaan != null) MapEntry('Permukaan', route.permukaan!),
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surfaceAlt,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        children: [
          for (var i = 0; i < rows.length; i++)
            Padding(
              padding: EdgeInsets.only(bottom: i == rows.length - 1 ? 0 : 12),
              child: Container(
                padding: EdgeInsets.only(bottom: i == rows.length - 1 ? 0 : 12),
                decoration: i == rows.length - 1
                    ? null
                    : const BoxDecoration(border: Border(bottom: BorderSide(color: AppTheme.border, width: 0.5))),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(rows[i].key, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                    Flexible(
                      child: Text(
                        rows[i].value,
                        textAlign: TextAlign.right,
                        style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _DiscussionCard extends StatelessWidget {
  const _DiscussionCard({required this.post});

  final ForumPostPreview post;

  static String _timeAgo(String iso) {
    final dt = DateTime.tryParse(iso);
    if (dt == null) return '';
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 1) return 'Baru saja';
    if (diff.inMinutes < 60) return '${diff.inMinutes} menit lalu';
    if (diff.inHours < 24) return '${diff.inHours} jam lalu';
    if (diff.inDays < 30) return '${diff.inDays} hari lalu';
    return DateFormat('dd MMM yyyy').format(dt);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: AppTheme.surfaceAlt, borderRadius: BorderRadius.circular(14)),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 18,
            backgroundColor: AppTheme.primary,
            backgroundImage: post.authorAvatar != null && post.authorAvatar!.isNotEmpty
                ? NetworkImage(post.authorAvatar!)
                : null,
            child: (post.authorAvatar == null || post.authorAvatar!.isEmpty)
                ? Text(post.authorName.substring(0, 1).toUpperCase(), style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold))
                : null,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        post.authorName,
                        style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.bold, fontSize: 13),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(_timeAgo(post.createdAt), style: const TextStyle(color: AppTheme.textMuted, fontSize: 11)),
                  ],
                ),
                const SizedBox(height: 4),
                Text(post.isi, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                const SizedBox(height: 10),
                Row(
                  children: [
                    const Icon(Icons.thumb_up_outlined, size: 14, color: AppTheme.textMuted),
                    const SizedBox(width: 4),
                    Text('${post.likeCount}', style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                    const SizedBox(width: 16),
                    const Icon(Icons.chat_bubble_outline, size: 14, color: AppTheme.textMuted),
                    const SizedBox(width: 4),
                    Text('${post.commentCount}', style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                  ],
                ),
              ],
            ),
          ),
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

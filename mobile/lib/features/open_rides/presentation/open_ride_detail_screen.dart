import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/state_views.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/open_rides_provider.dart';

class OpenRideDetailScreen extends ConsumerStatefulWidget {
  const OpenRideDetailScreen({super.key, required this.rideId});

  final String rideId;

  @override
  ConsumerState<OpenRideDetailScreen> createState() => _OpenRideDetailScreenState();
}

class _OpenRideDetailScreenState extends ConsumerState<OpenRideDetailScreen> {
  bool? _joined;
  bool _toggling = false;
  bool _deleting = false;

  Future<void> _checkJoined() async {
    final user = ref.read(currentUserProvider);
    if (user == null) return;
    final joined = await ref.read(openRideRepositoryProvider).hasJoined(widget.rideId, user.id);
    if (mounted) setState(() => _joined = joined);
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _checkJoined());
  }

  Future<void> _toggleJoin() async {
    final user = ref.read(currentUserProvider);
    if (user == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Silakan masuk terlebih dahulu.')));
      return;
    }
    setState(() => _toggling = true);
    try {
      final repo = ref.read(openRideRepositoryProvider);
      if (_joined == true) {
        await repo.leaveRide(widget.rideId, user.id);
        setState(() => _joined = false);
      } else {
        await repo.joinRide(widget.rideId, user.id);
        setState(() => _joined = true);
      }
      ref.invalidate(openRideDetailProvider(widget.rideId));
      ref.invalidate(rideParticipantsProvider(widget.rideId));
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal: $e')));
      }
    } finally {
      if (mounted) setState(() => _toggling = false);
    }
  }

  Future<void> _delete() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppTheme.surface,
        title: const Text('Hapus Open Ride?', style: TextStyle(color: AppTheme.textPrimary)),
        content: const Text('Tindakan ini tidak bisa dibatalkan.', style: TextStyle(color: AppTheme.textSecondary)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Batal')),
          TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Hapus', style: TextStyle(color: AppTheme.error))),
        ],
      ),
    );
    if (confirmed != true) return;

    setState(() => _deleting = true);
    try {
      await ref.read(openRideRepositoryProvider).deleteOpenRide(widget.rideId);
      if (mounted) context.pop();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal menghapus: $e')));
      }
    } finally {
      if (mounted) setState(() => _deleting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final rideAsync = ref.watch(openRideDetailProvider(widget.rideId));
    final participantsAsync = ref.watch(rideParticipantsProvider(widget.rideId));
    final currentUser = ref.watch(currentUserProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Detail Open Ride')),
      body: rideAsync.when(
        data: (ride) {
          if (ride == null) {
            return const EmptyView(icon: Icons.event_busy, title: 'Open Ride Tidak Ditemukan');
          }

          final date = ride.tanggalWaktuDate;
          final dateLabel = date != null ? DateFormat('EEEE, d MMMM yyyy', 'id_ID').format(date) : '';
          final timeLabel = date != null ? DateFormat('HH:mm', 'id_ID').format(date) : '';
          final isCreator = currentUser != null && currentUser.id == ride.dibuatOleh;

          return ListView(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
            children: [
              Row(
                children: [
                  LevelBadge(level: ride.level),
                  const Spacer(),
                  if (isCreator)
                    Row(
                      children: [
                        IconButton(
                          onPressed: () => context.push('/open-rides/${ride.id}/edit', extra: ride),
                          icon: const Icon(Icons.edit, color: AppTheme.textSecondary, size: 20),
                        ),
                        IconButton(
                          onPressed: _deleting ? null : _delete,
                          icon: const Icon(Icons.delete_outline, color: AppTheme.error, size: 20),
                        ),
                      ],
                    ),
                ],
              ),
              const SizedBox(height: 8),
              Text(ride.judul, style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.bold, fontSize: 20)),
              const SizedBox(height: 16),
              _InfoRow(icon: Icons.calendar_today, label: 'Tanggal', value: dateLabel),
              _InfoRow(icon: Icons.access_time, label: 'Jam Kumpul', value: '$timeLabel WIB'),
              _InfoRow(icon: Icons.location_on, label: 'Titik Kumpul', value: ride.titikKumpul),
              _InfoRow(icon: Icons.route, label: 'Jarak', value: '${ride.jarakKm} km'),
              if (ride.catatan != null && ride.catatan!.isNotEmpty) ...[
                const SizedBox(height: 12),
                const Text('Catatan', style: TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.bold, fontSize: 13)),
                const SizedBox(height: 4),
                Text(ride.catatan!, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13, height: 1.5)),
              ],
              const SizedBox(height: 24),
              Row(
                children: [
                  const Text('Peserta', style: TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.bold, fontSize: 15)),
                  const SizedBox(width: 8),
                  Text('${ride.participantCount} / ${ride.kuotaMaks}', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                ],
              ),
              const SizedBox(height: 12),
              participantsAsync.when(
                data: (participants) {
                  if (participants.isEmpty) {
                    return const Text('Belum ada peserta.', style: TextStyle(color: AppTheme.textMuted, fontSize: 12));
                  }
                  return Column(
                    children: participants.map((p) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Row(
                          children: [
                            CircleAvatar(
                              radius: 14,
                              backgroundColor: AppTheme.primary,
                              backgroundImage: p.fotoProfilUrl != null && p.fotoProfilUrl!.isNotEmpty
                                  ? NetworkImage(p.fotoProfilUrl!)
                                  : null,
                              child: (p.fotoProfilUrl == null || p.fotoProfilUrl!.isEmpty)
                                  ? Text(
                                      (p.namaLengkap ?? 'A').substring(0, 1).toUpperCase(),
                                      style: const TextStyle(color: Colors.black, fontSize: 11),
                                    )
                                  : null,
                            ),
                            const SizedBox(width: 10),
                            Text(p.namaLengkap ?? 'Anggota Gowes', style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13)),
                          ],
                        ),
                      );
                    }).toList(),
                  );
                },
                loading: () => const LoadingView(),
                error: (e, _) => Text('Gagal memuat peserta: $e', style: const TextStyle(color: AppTheme.error, fontSize: 12)),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: (_toggling || (ride.isFull && _joined != true)) ? null : _toggleJoin,
                icon: Icon(_joined == true ? Icons.check_circle : Icons.person_add, size: 18),
                label: Text(
                  _joined == true
                      ? 'Terdaftar (Klik untuk Batal)'
                      : ride.isFull
                          ? 'Kuota Penuh'
                          : 'Gabung Gowes Bareng',
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _joined == true ? AppTheme.success : AppTheme.primary,
                ),
              ),
            ],
          );
        },
        loading: () => const LoadingView(),
        error: (e, _) => ErrorView(message: 'Gagal memuat Open Ride: $e', onRetry: () => ref.invalidate(openRideDetailProvider(widget.rideId))),
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
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: AppTheme.primary),
          const SizedBox(width: 8),
          SizedBox(
            width: 90,
            child: Text(label, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
          ),
          Expanded(
            child: Text(value, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }
}

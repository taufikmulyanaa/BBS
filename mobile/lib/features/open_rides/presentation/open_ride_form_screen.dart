import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/models/open_ride.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/open_rides_provider.dart';

/// Handles both create (existing == null) and edit (existing != null).
class OpenRideFormScreen extends ConsumerStatefulWidget {
  const OpenRideFormScreen({super.key, this.existing});

  final OpenRide? existing;

  @override
  ConsumerState<OpenRideFormScreen> createState() => _OpenRideFormScreenState();
}

class _OpenRideFormScreenState extends ConsumerState<OpenRideFormScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _judul;
  late final TextEditingController _titikKumpul;
  late final TextEditingController _jarakKm;
  late final TextEditingController _kuotaMaks;
  late final TextEditingController _catatan;
  String _level = 'easy';
  DateTime? _date;
  TimeOfDay? _time;
  bool _saving = false;
  String? _errorMsg;

  bool get _isEditing => widget.existing != null;

  @override
  void initState() {
    super.initState();
    final e = widget.existing;
    _judul = TextEditingController(text: e?.judul ?? '');
    _titikKumpul = TextEditingController(text: e?.titikKumpul ?? '');
    _jarakKm = TextEditingController(text: e != null ? e.jarakKm.toString() : '25');
    _kuotaMaks = TextEditingController(text: e != null ? e.kuotaMaks.toString() : '15');
    _catatan = TextEditingController(text: e?.catatan ?? '');
    _level = e?.level ?? 'easy';
    final existingDate = e?.tanggalWaktuDate;
    if (existingDate != null) {
      _date = DateTime(existingDate.year, existingDate.month, existingDate.day);
      _time = TimeOfDay(hour: existingDate.hour, minute: existingDate.minute);
    }
  }

  @override
  void dispose() {
    _judul.dispose();
    _titikKumpul.dispose();
    _jarakKm.dispose();
    _kuotaMaks.dispose();
    _catatan.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _date ?? DateTime.now(),
      firstDate: DateTime.now().subtract(const Duration(days: 1)),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) setState(() => _date = picked);
  }

  Future<void> _pickTime() async {
    final picked = await showTimePicker(context: context, initialTime: _time ?? const TimeOfDay(hour: 6, minute: 0));
    if (picked != null) setState(() => _time = picked);
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_date == null || _time == null) {
      setState(() => _errorMsg = 'Pilih tanggal dan jam kumpul.');
      return;
    }

    final user = ref.read(currentUserProvider);
    if (user == null) {
      setState(() => _errorMsg = 'Silakan masuk terlebih dahulu.');
      return;
    }

    setState(() {
      _saving = true;
      _errorMsg = null;
    });

    final tanggalWaktu = DateTime(_date!.year, _date!.month, _date!.day, _time!.hour, _time!.minute);

    try {
      final repo = ref.read(openRideRepositoryProvider);
      if (_isEditing) {
        await repo.updateOpenRide(
          id: widget.existing!.id,
          judul: _judul.text.trim(),
          titikKumpul: _titikKumpul.text.trim(),
          tanggalWaktu: tanggalWaktu,
          jarakKm: double.tryParse(_jarakKm.text) ?? 0,
          level: _level,
          kuotaMaks: int.tryParse(_kuotaMaks.text) ?? 1,
          catatan: _catatan.text.trim(),
        );
        ref.invalidate(openRideDetailProvider(widget.existing!.id));
      } else {
        await repo.createOpenRide(
          judul: _judul.text.trim(),
          titikKumpul: _titikKumpul.text.trim(),
          tanggalWaktu: tanggalWaktu,
          jarakKm: double.tryParse(_jarakKm.text) ?? 0,
          level: _level,
          kuotaMaks: int.tryParse(_kuotaMaks.text) ?? 1,
          catatan: _catatan.text.trim(),
          userId: user.id,
        );
      }
      ref.invalidate(openRidesListProvider);
      if (mounted) context.pop();
    } catch (e) {
      setState(() => _errorMsg = 'Gagal menyimpan: $e');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_isEditing ? 'Edit Open Ride' : 'Buat Open Ride Baru')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (_errorMsg != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 14),
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.error.withValues(alpha: 0.1),
                      border: Border.all(color: AppTheme.error.withValues(alpha: 0.3)),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(_errorMsg!, style: const TextStyle(color: AppTheme.error, fontSize: 12)),
                  ),
                ),
              TextFormField(
                controller: _judul,
                style: const TextStyle(color: AppTheme.textPrimary),
                decoration: const InputDecoration(labelText: 'Judul Ajakan Gowes *'),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Wajib diisi' : null,
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _pickDate,
                      icon: const Icon(Icons.calendar_today, size: 16),
                      label: Text(_date == null ? 'Tanggal' : '${_date!.day}/${_date!.month}/${_date!.year}'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _pickTime,
                      icon: const Icon(Icons.access_time, size: 16),
                      label: Text(_time == null ? 'Jam' : _time!.format(context)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: _titikKumpul,
                style: const TextStyle(color: AppTheme.textPrimary),
                decoration: const InputDecoration(labelText: 'Titik Kumpul *'),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Wajib diisi' : null,
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _jarakKm,
                      keyboardType: TextInputType.number,
                      style: const TextStyle(color: AppTheme.textPrimary),
                      decoration: const InputDecoration(labelText: 'Jarak (KM)'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      initialValue: _level,
                      dropdownColor: AppTheme.surface,
                      style: const TextStyle(color: AppTheme.textPrimary),
                      decoration: const InputDecoration(labelText: 'Level'),
                      items: const [
                        DropdownMenuItem(value: 'easy', child: Text('Easy')),
                        DropdownMenuItem(value: 'medium', child: Text('Medium')),
                        DropdownMenuItem(value: 'hard', child: Text('Hard')),
                      ],
                      onChanged: (v) => setState(() => _level = v ?? 'easy'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: _kuotaMaks,
                keyboardType: TextInputType.number,
                style: const TextStyle(color: AppTheme.textPrimary),
                decoration: const InputDecoration(labelText: 'Kuota Maksimal'),
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: _catatan,
                maxLines: 3,
                style: const TextStyle(color: AppTheme.textPrimary),
                decoration: const InputDecoration(labelText: 'Catatan (opsional)'),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _saving ? null : _submit,
                child: Text(_saving ? 'Menyimpan...' : (_isEditing ? 'Simpan Perubahan' : 'Terbitkan Open Ride')),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

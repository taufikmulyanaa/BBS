class OpenRide {
  final String id;
  final String judul;
  final String titikKumpul;
  final String tanggalWaktu;
  final double jarakKm;
  final String level; // easy | medium | hard
  final int kuotaMaks;
  final String? catatan;
  final String status; // akan_datang | selesai | dibatalkan
  final String? dibuatOleh;
  final String createdAt;
  final int participantCount;

  OpenRide({
    required this.id,
    required this.judul,
    required this.titikKumpul,
    required this.tanggalWaktu,
    required this.jarakKm,
    required this.level,
    required this.kuotaMaks,
    this.catatan,
    required this.status,
    this.dibuatOleh,
    required this.createdAt,
    this.participantCount = 0,
  });

  DateTime? get tanggalWaktuDate {
    try {
      return DateTime.parse(tanggalWaktu).toLocal();
    } catch (_) {
      return null;
    }
  }

  bool get isFull => participantCount >= kuotaMaks;

  factory OpenRide.fromJson(Map<String, dynamic> json) {
    return OpenRide(
      id: json['id'] as String,
      judul: json['judul'] as String? ?? 'Open Ride',
      titikKumpul: json['titik_kumpul'] as String? ?? '',
      tanggalWaktu: json['tanggal_waktu'] as String? ?? '',
      jarakKm: (json['jarak_km'] as num?)?.toDouble() ?? 0,
      level: json['level'] as String? ?? 'easy',
      kuotaMaks: (json['kuota_maks'] as num?)?.toInt() ?? 0,
      catatan: json['catatan'] as String?,
      status: json['status'] as String? ?? 'akan_datang',
      dibuatOleh: json['dibuat_oleh'] as String?,
      createdAt: json['created_at'] as String? ?? '',
    );
  }

  OpenRide copyWith({int? participantCount}) {
    return OpenRide(
      id: id,
      judul: judul,
      titikKumpul: titikKumpul,
      tanggalWaktu: tanggalWaktu,
      jarakKm: jarakKm,
      level: level,
      kuotaMaks: kuotaMaks,
      catatan: catatan,
      status: status,
      dibuatOleh: dibuatOleh,
      createdAt: createdAt,
      participantCount: participantCount ?? this.participantCount,
    );
  }
}

class RideParticipant {
  final String openRideId;
  final String userId;
  final String statusKonfirmasi; // terdaftar | hadir | tidak_hadir
  final String joinedAt;
  final String? namaLengkap;
  final String? fotoProfilUrl;

  RideParticipant({
    required this.openRideId,
    required this.userId,
    required this.statusKonfirmasi,
    required this.joinedAt,
    this.namaLengkap,
    this.fotoProfilUrl,
  });

  factory RideParticipant.fromJson(Map<String, dynamic> json) {
    final profile = json['profiles'] as Map<String, dynamic>?;
    return RideParticipant(
      openRideId: json['open_ride_id'] as String,
      userId: json['user_id'] as String,
      statusKonfirmasi: json['status_konfirmasi'] as String? ?? 'terdaftar',
      joinedAt: json['joined_at'] as String? ?? '',
      namaLengkap: profile?['nama_lengkap'] as String?,
      fotoProfilUrl: profile?['foto_profil_url'] as String?,
    );
  }
}

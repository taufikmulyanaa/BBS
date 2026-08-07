class AppRoute {
  final String id;
  final String nama;
  final String? deskripsi;
  final double jarakKm;
  final int? elevasiM;
  final String level; // easy | medium | hard
  final String? gpxFileUrl;
  final String? coverImageUrl;
  final List<String> tags;
  final String statusVerifikasi; // belum_diverifikasi | terverifikasi
  final double ratingAvg;
  final int ratingCount;
  final String? dibuatOleh;
  final String createdAt;

  AppRoute({
    required this.id,
    required this.nama,
    this.deskripsi,
    required this.jarakKm,
    this.elevasiM,
    required this.level,
    this.gpxFileUrl,
    this.coverImageUrl,
    required this.tags,
    required this.statusVerifikasi,
    required this.ratingAvg,
    required this.ratingCount,
    this.dibuatOleh,
    required this.createdAt,
  });

  bool get isVerified => statusVerifikasi == 'terverifikasi';

  factory AppRoute.fromJson(Map<String, dynamic> json) {
    return AppRoute(
      id: json['id'] as String,
      nama: json['nama'] as String? ?? 'Rute Tanpa Nama',
      deskripsi: json['deskripsi'] as String?,
      jarakKm: (json['jarak_km'] as num?)?.toDouble() ?? 0,
      elevasiM: (json['elevasi_m'] as num?)?.toInt(),
      level: json['level'] as String? ?? 'easy',
      gpxFileUrl: json['gpx_file_url'] as String?,
      coverImageUrl: json['cover_image_url'] as String?,
      tags: (json['tags'] as List?)?.map((e) => e.toString()).toList() ?? const [],
      statusVerifikasi: json['status_verifikasi'] as String? ?? 'belum_diverifikasi',
      ratingAvg: (json['rating_avg'] as num?)?.toDouble() ?? 0,
      ratingCount: (json['rating_count'] as num?)?.toInt() ?? 0,
      dibuatOleh: json['dibuat_oleh'] as String?,
      createdAt: json['created_at'] as String? ?? '',
    );
  }
}

class RouteReview {
  final String id;
  final String routeId;
  final String userId;
  final String? userName;
  final String? userAvatar;
  final int rating;
  final String? comment;
  final String createdAt;

  RouteReview({
    required this.id,
    required this.routeId,
    required this.userId,
    this.userName,
    this.userAvatar,
    required this.rating,
    this.comment,
    required this.createdAt,
  });

  factory RouteReview.fromJson(Map<String, dynamic> json) {
    return RouteReview(
      id: json['id'] as String,
      routeId: json['route_id'] as String,
      userId: json['user_id'] as String,
      userName: json['user_name'] as String?,
      userAvatar: json['user_avatar'] as String?,
      rating: (json['rating'] as num?)?.toInt() ?? 5,
      comment: json['comment'] as String?,
      createdAt: json['created_at'] as String? ?? '',
    );
  }
}

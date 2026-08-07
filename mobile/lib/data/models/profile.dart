class Profile {
  final String id;
  final String namaLengkap;
  final String? fotoProfilUrl;
  final String role;
  final String? bio;
  final String? kotaBasecamp;
  final String createdAt;

  Profile({
    required this.id,
    required this.namaLengkap,
    this.fotoProfilUrl,
    required this.role,
    this.bio,
    this.kotaBasecamp,
    required this.createdAt,
  });

  bool get isAdmin => role == 'admin';

  factory Profile.fromJson(Map<String, dynamic> json) {
    return Profile(
      id: json['id'] as String,
      namaLengkap: json['nama_lengkap'] as String? ?? 'Anggota Gowes',
      fotoProfilUrl: json['foto_profil_url'] as String?,
      role: json['role'] as String? ?? 'member',
      bio: json['bio'] as String?,
      kotaBasecamp: json['kota_basecamp'] as String?,
      createdAt: json['created_at'] as String? ?? '',
    );
  }
}

/// Minimal read-only shape used for the Beranda forum preview.
/// Full Forum feature (like/comment/create) lands in a later iteration.
class ForumPostPreview {
  final String id;
  final String judul;
  final String isi;
  final String authorName;
  final String? authorAvatar;
  final String createdAt;

  ForumPostPreview({
    required this.id,
    required this.judul,
    required this.isi,
    required this.authorName,
    this.authorAvatar,
    required this.createdAt,
  });

  factory ForumPostPreview.fromJson(Map<String, dynamic> json) {
    final profile = json['profiles'] as Map<String, dynamic>?;
    return ForumPostPreview(
      id: json['id'] as String,
      judul: json['judul'] as String? ?? '',
      isi: json['isi'] as String? ?? '',
      authorName: profile?['nama_lengkap'] as String? ?? 'Anggota Gowes',
      authorAvatar: profile?['foto_profil_url'] as String?,
      createdAt: json['created_at'] as String? ?? '',
    );
  }
}

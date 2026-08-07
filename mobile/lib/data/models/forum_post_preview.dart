/// Minimal read-only shape used for the Beranda forum preview.
/// Full Forum feature (like/comment/create) lands in a later iteration.
class ForumPostPreview {
  final String id;
  final String judul;
  final String isi;
  final String authorName;
  final String? authorAvatar;
  final String createdAt;
  final int likeCount;
  final int commentCount;

  ForumPostPreview({
    required this.id,
    required this.judul,
    required this.isi,
    required this.authorName,
    this.authorAvatar,
    required this.createdAt,
    this.likeCount = 0,
    this.commentCount = 0,
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
      likeCount: (json['like_count'] as num?)?.toInt() ?? 0,
      commentCount: (json['comment_count'] as num?)?.toInt() ?? 0,
    );
  }
}

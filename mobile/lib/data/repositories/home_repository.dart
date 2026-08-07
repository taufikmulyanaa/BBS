import '../../core/supabase_config.dart';
import '../models/app_route.dart';
import '../models/forum_post_preview.dart';
import '../models/open_ride.dart';

class HomeStats {
  final int anggotaAktif;
  final int ruteTerverifikasi;
  final int openRideAktif;

  HomeStats({required this.anggotaAktif, required this.ruteTerverifikasi, required this.openRideAktif});
}

class HomeRepository {
  Future<HomeStats> fetchStats() async {
    // Plain select + length instead of the .count() API — keeps this working
    // across supabase_flutter/postgrest minor versions without depending on
    // an API shape I can't verify without a local Flutter toolchain.
    final anggota = await supabase.from('profiles').select('id');
    // Fixes a web-app label bug: the count now actually matches "Rute Terverifikasi".
    final rute = await supabase.from('routes').select('id').eq('status_verifikasi', 'terverifikasi');
    final rides = await supabase.from('open_rides').select('id').eq('status', 'akan_datang');

    return HomeStats(
      anggotaAktif: (anggota as List).length,
      ruteTerverifikasi: (rute as List).length,
      openRideAktif: (rides as List).length,
    );
  }

  Future<List<AppRoute>> fetchFeaturedRoutes({int limit = 3}) async {
    final data = await supabase.from('routes').select().order('rating_avg', ascending: false).limit(limit);
    return (data as List).map((e) => AppRoute.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<OpenRide>> fetchUpcomingRides({int limit = 3}) async {
    final data = await supabase
        .from('open_rides')
        .select()
        .eq('status', 'akan_datang')
        .order('tanggal_waktu', ascending: true)
        .limit(limit);
    return (data as List).map((e) => OpenRide.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<ForumPostPreview>> fetchRecentForumPosts({int limit = 2}) async {
    final data = await supabase
        .from('forum_posts')
        .select('*, profiles:user_id(nama_lengkap, foto_profil_url)')
        .order('created_at', ascending: false)
        .limit(limit);
    return (data as List).map((e) => ForumPostPreview.fromJson(e as Map<String, dynamic>)).toList();
  }
}

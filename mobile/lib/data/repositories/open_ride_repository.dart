import '../../core/supabase_config.dart';
import '../models/open_ride.dart';

class OpenRideRepository {
  Future<List<OpenRide>> fetchOpenRides({int? limit}) async {
    var query = supabase.from('open_rides').select().order('tanggal_waktu', ascending: true);
    final data = limit != null ? await query.limit(limit) : await query;
    final rides = (data as List).map((e) => OpenRide.fromJson(e as Map<String, dynamic>)).toList();
    return Future.wait(rides.map((r) async {
      final count = await countParticipants(r.id);
      return r.copyWith(participantCount: count);
    }));
  }

  Future<OpenRide?> fetchOpenRide(String id) async {
    final data = await supabase.from('open_rides').select().eq('id', id).maybeSingle();
    if (data == null) return null;
    final ride = OpenRide.fromJson(data);
    final count = await countParticipants(id);
    return ride.copyWith(participantCount: count);
  }

  Future<int> countParticipants(String openRideId) async {
    final data = await supabase.from('ride_participants').select('user_id').eq('open_ride_id', openRideId);
    return (data as List).length;
  }

  Future<List<RideParticipant>> fetchParticipants(String openRideId) async {
    final data = await supabase
        .from('ride_participants')
        .select('*, profiles:user_id(nama_lengkap, foto_profil_url)')
        .eq('open_ride_id', openRideId)
        .order('joined_at', ascending: true);
    return (data as List).map((e) => RideParticipant.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<bool> hasJoined(String openRideId, String userId) async {
    final data = await supabase
        .from('ride_participants')
        .select('user_id')
        .eq('open_ride_id', openRideId)
        .eq('user_id', userId)
        .maybeSingle();
    return data != null;
  }

  Future<void> joinRide(String openRideId, String userId) async {
    await supabase.from('ride_participants').insert({'open_ride_id': openRideId, 'user_id': userId});
  }

  Future<void> leaveRide(String openRideId, String userId) async {
    await supabase.from('ride_participants').delete().match({'open_ride_id': openRideId, 'user_id': userId});
  }

  Future<String> createOpenRide({
    required String judul,
    required String titikKumpul,
    required DateTime tanggalWaktu,
    required double jarakKm,
    required String level,
    required int kuotaMaks,
    String? catatan,
    required String userId,
  }) async {
    final data = await supabase.from('open_rides').insert({
      'judul': judul,
      'titik_kumpul': titikKumpul,
      'tanggal_waktu': tanggalWaktu.toUtc().toIso8601String(),
      'jarak_km': jarakKm,
      'level': level,
      'kuota_maks': kuotaMaks,
      'catatan': catatan,
      'dibuat_oleh': userId,
      'status': 'akan_datang',
    }).select().single();

    final id = data['id'] as String;
    await joinRide(id, userId);
    return id;
  }

  Future<void> updateOpenRide({
    required String id,
    required String judul,
    required String titikKumpul,
    required DateTime tanggalWaktu,
    required double jarakKm,
    required String level,
    required int kuotaMaks,
    String? catatan,
  }) async {
    await supabase.from('open_rides').update({
      'judul': judul,
      'titik_kumpul': titikKumpul,
      'tanggal_waktu': tanggalWaktu.toUtc().toIso8601String(),
      'jarak_km': jarakKm,
      'level': level,
      'kuota_maks': kuotaMaks,
      'catatan': catatan,
    }).eq('id', id);
  }

  Future<void> deleteOpenRide(String id) async {
    await supabase.from('ride_participants').delete().eq('open_ride_id', id);
    await supabase.from('open_rides').delete().eq('id', id);
  }
}

import '../../core/supabase_config.dart';
import '../models/profile.dart';

class ProfileRepository {
  Future<Profile?> getProfile(String userId) async {
    final data = await supabase.from('profiles').select().eq('id', userId).maybeSingle();
    if (data == null) return null;
    return Profile.fromJson(data);
  }
}

import '../../core/supabase_config.dart';
import '../models/app_route.dart';

class RoutesRepository {
  Future<List<AppRoute>> fetchRoutes({int? limit}) async {
    var query = supabase.from('routes').select().order('created_at', ascending: false);
    final data = limit != null ? await query.limit(limit) : await query;
    return (data as List).map((e) => AppRoute.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<AppRoute?> fetchRoute(String id) async {
    final data = await supabase.from('routes').select().eq('id', id).maybeSingle();
    if (data == null) return null;
    return AppRoute.fromJson(data);
  }

  Future<List<RouteReview>> fetchReviews(String routeId) async {
    final data = await supabase
        .from('route_reviews')
        .select()
        .eq('route_id', routeId)
        .order('created_at', ascending: false);
    return (data as List).map((e) => RouteReview.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<void> submitReview({
    required String routeId,
    required String userId,
    required String userName,
    String? userAvatar,
    required int rating,
    required String comment,
  }) async {
    // routes.rating_avg / rating_count are recalculated server-side by
    // trg_route_reviews_rating (see 08_add_route_reviews.sql) — no manual
    // update needed here.
    await supabase.from('route_reviews').insert({
      'route_id': routeId,
      'user_id': userId,
      'user_name': userName,
      'user_avatar': userAvatar,
      'rating': rating,
      'comment': comment,
    });
  }

  Future<bool> isRouteSaved(String userId, String routeId) async {
    final data = await supabase
        .from('saved_routes')
        .select('route_id')
        .eq('user_id', userId)
        .eq('route_id', routeId)
        .maybeSingle();
    return data != null;
  }

  Future<void> saveRoute(String userId, String routeId) async {
    await supabase.from('saved_routes').insert({'user_id': userId, 'route_id': routeId});
  }

  Future<void> unsaveRoute(String userId, String routeId) async {
    await supabase.from('saved_routes').delete().match({'user_id': userId, 'route_id': routeId});
  }
}

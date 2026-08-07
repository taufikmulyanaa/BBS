import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/models/app_route.dart';
import '../data/models/forum_post_preview.dart';
import '../data/repositories/routes_repository.dart';

final routesRepositoryProvider = Provider((ref) => RoutesRepository());

final routesListProvider = FutureProvider.autoDispose<List<AppRoute>>((ref) {
  return ref.watch(routesRepositoryProvider).fetchRoutes();
});

final routeDetailProvider = FutureProvider.autoDispose.family<AppRoute?, String>((ref, routeId) {
  return ref.watch(routesRepositoryProvider).fetchRoute(routeId);
});

final routeReviewsProvider = FutureProvider.autoDispose.family<List<RouteReview>, String>((ref, routeId) {
  return ref.watch(routesRepositoryProvider).fetchReviews(routeId);
});

final routeLatestDiscussionProvider = FutureProvider.autoDispose.family<ForumPostPreview?, String>((ref, routeId) {
  return ref.watch(routesRepositoryProvider).fetchLatestDiscussion(routeId);
});

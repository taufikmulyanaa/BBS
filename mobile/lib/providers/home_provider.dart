import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/repositories/home_repository.dart';

final homeRepositoryProvider = Provider((ref) => HomeRepository());

final homeStatsProvider = FutureProvider.autoDispose((ref) {
  return ref.watch(homeRepositoryProvider).fetchStats();
});

final featuredRoutesProvider = FutureProvider.autoDispose((ref) {
  return ref.watch(homeRepositoryProvider).fetchFeaturedRoutes();
});

final upcomingRidesProvider = FutureProvider.autoDispose((ref) {
  return ref.watch(homeRepositoryProvider).fetchUpcomingRides();
});

final recentForumPostsProvider = FutureProvider.autoDispose((ref) {
  return ref.watch(homeRepositoryProvider).fetchRecentForumPosts();
});

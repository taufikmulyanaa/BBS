import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../data/models/open_ride.dart';
import '../../features/auth/presentation/auth_screen.dart';
import '../../features/forum/presentation/forum_placeholder_screen.dart';
import '../../features/home/presentation/home_screen.dart';
import '../../features/open_rides/presentation/open_ride_detail_screen.dart';
import '../../features/open_rides/presentation/open_ride_form_screen.dart';
import '../../features/open_rides/presentation/open_rides_list_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../../features/routes/presentation/route_detail_screen.dart';
import '../../features/routes/presentation/routes_list_screen.dart';
import '../../providers/auth_provider.dart';
import '../widgets/main_shell.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  final authRepository = ref.read(authRepositoryProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/home',
    refreshListenable: GoRouterRefreshStream(authRepository.authStateChanges),
    redirect: (context, state) {
      final loggedIn = Supabase.instance.client.auth.currentSession != null;
      final loggingIn = state.matchedLocation == '/auth';

      if (!loggedIn && !loggingIn) return '/auth';
      if (loggedIn && loggingIn) return '/home';
      return null;
    },
    routes: [
      GoRoute(path: '/auth', builder: (context, state) => const AuthScreen()),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) => MainShell(navigationShell: navigationShell),
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(path: '/home', builder: (context, state) => const HomeScreen()),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/routes',
                builder: (context, state) => const RoutesListScreen(),
                routes: [
                  GoRoute(
                    path: ':id',
                    builder: (context, state) => RouteDetailScreen(routeId: state.pathParameters['id']!),
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/open-rides',
                builder: (context, state) => const OpenRidesListScreen(),
                routes: [
                  GoRoute(path: 'create', builder: (context, state) => const OpenRideFormScreen()),
                  GoRoute(
                    path: ':id',
                    builder: (context, state) => OpenRideDetailScreen(rideId: state.pathParameters['id']!),
                    routes: [
                      GoRoute(
                        path: 'edit',
                        builder: (context, state) => OpenRideFormScreen(existing: state.extra as OpenRide?),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(path: '/forum', builder: (context, state) => const ForumPlaceholderScreen()),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(path: '/profile', builder: (context, state) => const ProfileScreen()),
            ],
          ),
        ],
      ),
    ],
  );
});

/// Bridges a Stream (Supabase auth state changes) to go_router's
/// [Listenable]-based `refreshListenable`, so the router re-evaluates
/// `redirect` whenever the user signs in or out.
class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream(Stream<dynamic> stream) {
    notifyListeners();
    _subscription = stream.asBroadcastStream().listen((_) => notifyListeners());
  }

  late final StreamSubscription<dynamic> _subscription;

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}

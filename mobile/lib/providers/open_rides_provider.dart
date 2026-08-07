import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/models/open_ride.dart';
import '../data/repositories/open_ride_repository.dart';

final openRideRepositoryProvider = Provider((ref) => OpenRideRepository());

final openRidesListProvider = FutureProvider.autoDispose<List<OpenRide>>((ref) {
  return ref.watch(openRideRepositoryProvider).fetchOpenRides();
});

final openRideDetailProvider = FutureProvider.autoDispose.family<OpenRide?, String>((ref, id) {
  return ref.watch(openRideRepositoryProvider).fetchOpenRide(id);
});

final rideParticipantsProvider = FutureProvider.autoDispose.family<List<RideParticipant>, String>((ref, id) {
  return ref.watch(openRideRepositoryProvider).fetchParticipants(id);
});

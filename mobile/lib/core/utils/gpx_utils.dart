import 'package:flutter_map/flutter_map.dart' show LatLngBounds;
import 'package:gpx/gpx.dart';
import 'package:http/http.dart' as http;
import 'package:latlong2/latlong.dart';

/// The parsed shape a map screen needs: the route's points (for the polyline)
/// plus its start/end, so callers don't have to know about the `gpx` package.
class RouteTrack {
  RouteTrack(this.points)
      : start = points.first,
        end = points.last;

  final List<LatLng> points;
  final LatLng start;
  final LatLng end;

  LatLngBounds get bounds => LatLngBounds.fromPoints(points);
}

/// Downloads and parses a GPX file into a [RouteTrack].
///
/// Falls back from track points (`trk`/`trkseg`) to route points (`rte`) to
/// plain waypoints (`wpt`) — whichever the uploaded file actually used.
/// Throws if the file has no usable points.
Future<RouteTrack> fetchRouteTrack(String gpxUrl) async {
  final response = await http.get(Uri.parse(gpxUrl));
  if (response.statusCode != 200) {
    throw Exception('Gagal mengunduh file GPX (${response.statusCode})');
  }

  final gpx = GpxReader().fromString(response.body);

  final points = <LatLng>[
    for (final trk in gpx.trks)
      for (final seg in trk.trksegs)
        for (final pt in seg.trkpts)
          if (pt.lat != null && pt.lon != null) LatLng(pt.lat!, pt.lon!),
  ];

  if (points.isEmpty) {
    for (final rte in gpx.rtes) {
      for (final pt in rte.rtepts) {
        if (pt.lat != null && pt.lon != null) points.add(LatLng(pt.lat!, pt.lon!));
      }
    }
  }

  if (points.isEmpty) {
    for (final pt in gpx.wpts) {
      if (pt.lat != null && pt.lon != null) points.add(LatLng(pt.lat!, pt.lon!));
    }
  }

  if (points.isEmpty) {
    throw Exception('File GPX tidak berisi titik koordinat.');
  }

  return RouteTrack(points);
}

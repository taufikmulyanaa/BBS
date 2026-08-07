import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/utils/gpx_utils.dart';
import '../../../core/widgets/state_views.dart';

/// Full-screen "Lihat Peta" view: downloads the route's GPX file and draws
/// its track on an OpenStreetMap-tiled map.
class RouteMapScreen extends StatefulWidget {
  const RouteMapScreen({super.key, required this.routeName, required this.gpxFileUrl});

  final String routeName;
  final String gpxFileUrl;

  @override
  State<RouteMapScreen> createState() => _RouteMapScreenState();
}

class _RouteMapScreenState extends State<RouteMapScreen> {
  late Future<RouteTrack> _trackFuture;

  @override
  void initState() {
    super.initState();
    _trackFuture = fetchRouteTrack(widget.gpxFileUrl);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Peta: ${widget.routeName}')),
      body: FutureBuilder<RouteTrack>(
        future: _trackFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const LoadingView(message: 'Memuat rute...');
          }
          if (snapshot.hasError || !snapshot.hasData) {
            return ErrorView(
              message: 'Gagal memuat peta rute: ${snapshot.error}',
              onRetry: () => setState(() => _trackFuture = fetchRouteTrack(widget.gpxFileUrl)),
            );
          }

          final track = snapshot.data!;
          return FlutterMap(
            options: MapOptions(
              initialCameraFit: CameraFit.bounds(
                bounds: track.bounds,
                padding: const EdgeInsets.all(40),
              ),
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.guyubgowes.bapak_bapak_sepedahan',
              ),
              PolylineLayer(
                polylines: [
                  Polyline(points: track.points, strokeWidth: 4, color: AppTheme.primary),
                ],
              ),
              MarkerLayer(
                markers: [
                  _endpointMarker(track.start, Icons.trip_origin, AppTheme.success),
                  _endpointMarker(track.end, Icons.flag, AppTheme.error),
                ],
              ),
              const RichAttributionWidget(
                attributions: [TextSourceAttribution('OpenStreetMap contributors')],
              ),
            ],
          );
        },
      ),
    );
  }

  Marker _endpointMarker(LatLng point, IconData icon, Color color) {
    return Marker(
      point: point,
      width: 32,
      height: 32,
      child: Icon(icon, color: color, size: 28, shadows: const [Shadow(blurRadius: 4, color: Colors.black)]),
    );
  }
}

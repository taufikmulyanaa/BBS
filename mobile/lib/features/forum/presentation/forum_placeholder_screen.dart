import 'package:flutter/material.dart';
import '../../../core/widgets/state_views.dart';

/// Full Forum (post, like, comment) lands in the next mobile iteration.
/// Kept as a real tab (not removed) so the bottom nav matches the web app's
/// feature set and the tab is ready to be filled in later.
class ForumPlaceholderScreen extends StatelessWidget {
  const ForumPlaceholderScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Forum Komunitas')),
      body: const EmptyView(
        icon: Icons.forum_outlined,
        title: 'Forum Segera Hadir di Mobile',
        subtitle: 'Untuk saat ini, buka forum lewat versi web Guyub Gowes.',
      ),
    );
  }
}

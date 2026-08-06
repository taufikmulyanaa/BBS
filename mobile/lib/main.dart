import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';

void main() {
  runApp(const GuyubGowesApp());
}

class GuyubGowesApp extends StatelessWidget {
  const GuyubGowesApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Guyub Gowes',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const MainNavigationShell(),
    );
  }
}

class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({super.key});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    HomeScreen(),
    RoutesScreen(),
    OpenRideScreen(),
    ForumScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        type: BottomNavigationBarType.fixed,
        backgroundColor: AppTheme.surface,
        selectedItemColor: AppTheme.primary,
        unselectedItemColor: AppTheme.textSecondary,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.directions_bike), label: 'Beranda'),
          BottomNavigationBarItem(icon: Icon(Icons.explore), label: 'Rute'),
          BottomNavigationBarItem(icon: Icon(Icons.event), label: 'Open Ride'),
          BottomNavigationBarItem(icon: Icon(Icons.forum), label: 'Forum'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profil'),
        ],
      ),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('GUYUB GOWES'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppTheme.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.primary.withOpacity(0.4)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppTheme.primary,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.directions_bike, color: Colors.black),
                      ),
                      const SizedBox(width: 12),
                      const Text(
                        'Open Ride Minggu Ini',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Gowes Tipis-Tipis Amber Peak Loop',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.primaryLight),
                  ),
                  const SizedBox(height: 8),
                  const Text('Titik Kumpul: Pos Polisi Alun-Alun (06:00 WIB)'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class RoutesScreen extends StatelessWidget {
  const RoutesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Direktori Rute GPX')),
      body: const Center(child: Text('Katalog Rute Gowes & File GPX')),
    );
  }
}

class OpenRideScreen extends StatelessWidget {
  const OpenRideScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Open Ride Bareng')),
      body: const Center(child: Text('Daftar Ajakan Gowes Bareng')),
    );
  }
}

class ForumScreen extends StatelessWidget {
  const ForumScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Forum Komunitas')),
      body: const Center(child: Text('Diskusi Rute & Laporan Jalan')),
    );
  }
}

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profil Anggota')),
      body: const Center(child: Text('Detail Akun & Rute Favorit')),
    );
  }
}

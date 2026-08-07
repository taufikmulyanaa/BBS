import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../providers/auth_provider.dart';

class AuthScreen extends ConsumerStatefulWidget {
  const AuthScreen({super.key});

  @override
  ConsumerState<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends ConsumerState<AuthScreen> with SingleTickerProviderStateMixin {
  late final TabController _tabController;
  final _loginFormKey = GlobalKey<FormState>();
  final _signupFormKey = GlobalKey<FormState>();

  final _loginEmail = TextEditingController();
  final _loginPassword = TextEditingController();

  final _signupName = TextEditingController();
  final _signupEmail = TextEditingController();
  final _signupPassword = TextEditingController();

  bool _loading = false;
  String? _errorMsg;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _loginEmail.dispose();
    _loginPassword.dispose();
    _signupName.dispose();
    _signupEmail.dispose();
    _signupPassword.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_loginFormKey.currentState!.validate()) return;
    setState(() {
      _loading = true;
      _errorMsg = null;
    });
    try {
      await ref.read(authRepositoryProvider).signInWithPassword(
            email: _loginEmail.text.trim(),
            password: _loginPassword.text,
          );
    } catch (e) {
      setState(() => _errorMsg = 'Gagal masuk: ${e.toString()}');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _handleSignUp() async {
    if (!_signupFormKey.currentState!.validate()) return;
    setState(() {
      _loading = true;
      _errorMsg = null;
    });
    try {
      await ref.read(authRepositoryProvider).signUp(
            email: _signupEmail.text.trim(),
            password: _signupPassword.text,
            fullName: _signupName.text.trim(),
          );
    } catch (e) {
      setState(() => _errorMsg = 'Gagal daftar: ${e.toString()}');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _handleGoogle() async {
    setState(() {
      _loading = true;
      _errorMsg = null;
    });
    try {
      await ref.read(authRepositoryProvider).signInWithGoogle();
    } catch (e) {
      setState(() => _errorMsg = 'Google Sign-In belum dikonfigurasi di project ini.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 24),
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: AppTheme.primary,
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Icon(Icons.directions_bike, color: Colors.black, size: 32),
            ),
            const SizedBox(height: 12),
            const Text(
              'GUYUB GOWES',
              style: TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.bold, fontSize: 18, letterSpacing: 1),
            ),
            const Text(
              'Komunitas Bapak-Bapak Sepedahan',
              style: TextStyle(color: AppTheme.textSecondary, fontSize: 12),
            ),
            const SizedBox(height: 20),
            TabBar(
              controller: _tabController,
              tabs: const [
                Tab(text: 'Masuk'),
                Tab(text: 'Daftar'),
              ],
            ),
            if (_errorMsg != null)
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppTheme.error.withValues(alpha: 0.1),
                    border: Border.all(color: AppTheme.error.withValues(alpha: 0.3)),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(_errorMsg!, style: const TextStyle(color: AppTheme.error, fontSize: 12)),
                ),
              ),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildLoginForm(),
                  _buildSignupForm(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLoginForm() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Form(
        key: _loginFormKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextFormField(
              controller: _loginEmail,
              keyboardType: TextInputType.emailAddress,
              style: const TextStyle(color: AppTheme.textPrimary),
              decoration: const InputDecoration(labelText: 'Email'),
              validator: (v) => (v == null || !v.contains('@')) ? 'Email tidak valid' : null,
            ),
            const SizedBox(height: 14),
            TextFormField(
              controller: _loginPassword,
              obscureText: true,
              style: const TextStyle(color: AppTheme.textPrimary),
              decoration: const InputDecoration(labelText: 'Password'),
              validator: (v) => (v == null || v.length < 6) ? 'Minimal 6 karakter' : null,
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _loading ? null : _handleLogin,
              child: _loading ? const _ButtonSpinner() : const Text('Masuk'),
            ),
            const SizedBox(height: 12),
            _buildGoogleButton(),
          ],
        ),
      ),
    );
  }

  Widget _buildSignupForm() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Form(
        key: _signupFormKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextFormField(
              controller: _signupName,
              style: const TextStyle(color: AppTheme.textPrimary),
              decoration: const InputDecoration(labelText: 'Nama Lengkap'),
              validator: (v) => (v == null || v.trim().isEmpty) ? 'Nama wajib diisi' : null,
            ),
            const SizedBox(height: 14),
            TextFormField(
              controller: _signupEmail,
              keyboardType: TextInputType.emailAddress,
              style: const TextStyle(color: AppTheme.textPrimary),
              decoration: const InputDecoration(labelText: 'Email'),
              validator: (v) => (v == null || !v.contains('@')) ? 'Email tidak valid' : null,
            ),
            const SizedBox(height: 14),
            TextFormField(
              controller: _signupPassword,
              obscureText: true,
              style: const TextStyle(color: AppTheme.textPrimary),
              decoration: const InputDecoration(labelText: 'Password'),
              validator: (v) => (v == null || v.length < 6) ? 'Minimal 6 karakter' : null,
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _loading ? null : _handleSignUp,
              child: _loading ? const _ButtonSpinner() : const Text('Daftar'),
            ),
            const SizedBox(height: 12),
            _buildGoogleButton(),
          ],
        ),
      ),
    );
  }

  Widget _buildGoogleButton() {
    return OutlinedButton.icon(
      onPressed: _loading ? null : _handleGoogle,
      icon: const Icon(Icons.g_mobiledata, size: 22),
      label: const Text('Lanjutkan dengan Google'),
    );
  }
}

class _ButtonSpinner extends StatelessWidget {
  const _ButtonSpinner();

  @override
  Widget build(BuildContext context) {
    return const SizedBox(
      width: 18,
      height: 18,
      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
    );
  }
}

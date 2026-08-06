import 'package:flutter/material.dart';

class AppTheme {
  static const Color primary = Color(0xFFEA9B28);
  static const Color primaryLight = Color(0xFFF7C56A);
  static const Color background = Color(0xFF141415);
  static const Color surface = Color(0xFF232322);
  static const Color surfaceAlt = Color(0xFF2A2A2A);
  static const Color border = Color(0xFF42403B);
  static const Color textPrimary = Color(0xFFF5F5F5);
  static const Color textSecondary = Color(0xFFB9BEC3);

  static ThemeData get darkTheme {
    return ThemeData.dark().copyWith(
      scaffoldBackgroundColor: background,
      primaryColor: primary,
      colorScheme: const ColorScheme.dark(
        primary: primary,
        secondary: primaryLight,
        surface: surface,
      ),
      cardTheme: const CardTheme(
        color: surface,
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(16)),
          side: BorderSide(color: border),
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: background,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: textPrimary,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}

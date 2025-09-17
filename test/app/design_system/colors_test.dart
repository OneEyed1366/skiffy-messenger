import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:skiffy/app/design_system/colors.dart';

void main() {
  group('AppColors', () {
    test('has correct primary color values', () {
      expect(AppColors.primary, const Color(0xFFFF7F50));
      expect(AppColors.primaryHover, const Color(0xFFFFAB76));
      expect(AppColors.primaryFocus, const Color(0xFFFFCC99));
      expect(AppColors.primaryPressed, const Color(0xFFE55A2B));
    });

    test('has correct secondary color values', () {
      expect(AppColors.secondary, const Color(0xFF008B8B));
      expect(AppColors.secondaryHover, const Color(0xFF26A69A));
      expect(AppColors.secondaryFocus, const Color(0xFF4DB6AC));
      expect(AppColors.secondaryPressed, const Color(0xFF00695C));
    });

    test('has correct interaction state methods', () {
      expect(
        AppColors.getPrimaryStateColor(InteractionState.normal),
        AppColors.primary,
      );
      expect(
        AppColors.getPrimaryStateColor(InteractionState.hovered),
        AppColors.primaryHover,
      );
      expect(
        AppColors.getPrimaryStateColor(InteractionState.focused),
        AppColors.primaryFocus,
      );
      expect(
        AppColors.getPrimaryStateColor(InteractionState.pressed),
        AppColors.primaryPressed,
      );
    });

    test('has correct metadata', () {
      expect(AppColors.version, '1.0.0');
      expect(AppColors.totalColorCount, 50);
    });
  });
}
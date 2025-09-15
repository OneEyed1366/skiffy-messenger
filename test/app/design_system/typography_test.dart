import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:skiffy/app/design_system/typography.dart';

void main() {
  group('AppTextStyles', () {
    test('has correct headline styles', () {
      expect(AppTextStyles.headlineLarge.fontSize, 32.0);
      expect(AppTextStyles.headlineLarge.fontWeight, FontWeight.w700);

      expect(AppTextStyles.headlineMedium.fontSize, 24.0);
      expect(AppTextStyles.headlineMedium.fontWeight, FontWeight.w600);

      expect(AppTextStyles.headlineSmall.fontSize, 20.0);
      expect(AppTextStyles.headlineSmall.fontWeight, FontWeight.w600);
    });

    test('has correct body styles', () {
      expect(AppTextStyles.bodyLarge.fontSize, 16.0);
      expect(AppTextStyles.bodyLarge.fontWeight, FontWeight.w400);

      expect(AppTextStyles.bodyMedium.fontSize, 14.0);
      expect(AppTextStyles.bodyMedium.fontWeight, FontWeight.w400);

      expect(AppTextStyles.bodySmall.fontSize, 12.0);
      expect(AppTextStyles.bodySmall.fontWeight, FontWeight.w400);
    });

    test('has correct button styles', () {
      expect(AppTextStyles.buttonLarge.fontSize, 16.0);
      expect(AppTextStyles.buttonLarge.fontWeight, FontWeight.w600);

      expect(AppTextStyles.buttonMedium.fontSize, 14.0);
      expect(AppTextStyles.buttonMedium.fontWeight, FontWeight.w500);

      expect(AppTextStyles.buttonSmall.fontSize, 12.0);
      expect(AppTextStyles.buttonSmall.fontWeight, FontWeight.w500);
    });

    test('utility methods work correctly', () {
      const testStyle = TextStyle(fontSize: 16);
      const testColor = Color(0xFF000000);

      final styledText = AppTextStyles.withColor(testStyle, testColor);
      expect(styledText.color, testColor);

      final resizedText = AppTextStyles.withFontSize(testStyle, 20);
      expect(resizedText.fontSize, 20.0);
    });

    test('has correct metadata', () {
      expect(AppTextStyles.version, '1.0.0');
      expect(AppTextStyles.totalStylesCount, 24);
      expect(AppTextStyles.allStyles.length, 20);
    });
  });
}

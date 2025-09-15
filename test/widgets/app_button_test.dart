import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:skiffy/app/design_system/theme.dart';
import 'package:skiffy/widgets/app_button.dart';

void main() {
  group('AppButton', () {
    testWidgets('displays text correctly', (tester) async {
      const buttonText = 'Test Button';

      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.lightTheme,
          home: Scaffold(
            body: AppButton.primary(
              text: buttonText,
              onPressed: () {},
            ),
          ),
        ),
      );

      expect(find.text(buttonText), findsOneWidget);
    });

    testWidgets('calls onPressed when tapped', (tester) async {
      var wasPressed = false;

      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.lightTheme,
          home: Scaffold(
            body: AppButton.primary(
              text: 'Test Button',
              onPressed: () {
                wasPressed = true;
              },
            ),
          ),
        ),
      );

      await tester.tap(find.byType(AppButton));
      expect(wasPressed, isTrue);
    });

    testWidgets('shows loading state correctly', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.lightTheme,
          home: Scaffold(
            body: AppButton.primary(
              text: 'Test Button',
              onPressed: () {},
              isLoading: true,
            ),
          ),
        ),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      expect(find.text('Test Button'), findsOneWidget);
    });

    testWidgets('creates different button variants correctly', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.lightTheme,
          home: const Scaffold(
            body: Column(
              children: [
                AppButton.primary(text: 'Primary', onPressed: null),
                AppButton.secondary(text: 'Secondary', onPressed: null),
                AppButton.tertiary(text: 'Tertiary', onPressed: null),
              ],
            ),
          ),
        ),
      );

      expect(find.byType(AppButton), findsNWidgets(3));
      expect(find.text('Primary'), findsOneWidget);
      expect(find.text('Secondary'), findsOneWidget);
      expect(find.text('Tertiary'), findsOneWidget);
    });

    testWidgets('handles disabled state correctly', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.lightTheme,
          home: const Scaffold(
            body: AppButton.primary(
              text: 'Disabled Button',
              onPressed: null,
            ),
          ),
        ),
      );

      // Button should be present but not responsive
      expect(find.byType(AppButton), findsOneWidget);
      await tester.tap(find.byType(AppButton));
      // Should not crash or throw
    });

    testWidgets('icon button works correctly', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.lightTheme,
          home: Scaffold(
            body: AppButton.icon(
              icon: const Icon(Icons.add),
              onPressed: () {},
            ),
          ),
        ),
      );

      expect(find.byIcon(Icons.add), findsOneWidget);
    });
  });
}

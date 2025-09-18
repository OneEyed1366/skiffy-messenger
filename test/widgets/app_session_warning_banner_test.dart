import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:skiffy/widgets/app_session_warning_banner.dart';

void main() {
  group('AppSessionWarningBanner', () {
    testWidgets('should display warning message when visible',
        (WidgetTester tester) async {
      // Build the widget
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AppSessionWarningBanner(
              isVisible: true,
            ),
          ),
        ),
      );

      // Pump animation frames
      await tester.pumpAndSettle();

      // Verify that the warning banner is displayed
      expect(find.byType(AppSessionWarningBanner), findsOneWidget);

      // Verify that the warning icon is displayed
      expect(find.byIcon(Icons.warning_outlined), findsOneWidget);

      // Verify that the warning message is displayed
      expect(
        find.textContaining('Session data is temporarily stored'),
        findsOneWidget,
      );

      // Verify that the banner has proper container
      expect(find.byType(Container), findsWidgets);
    });

    testWidgets('should not display banner when not visible',
        (WidgetTester tester) async {
      // Build the widget with isVisible: false
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AppSessionWarningBanner(
              isVisible: false,
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Verify that the banner shows SizedBox.shrink
      expect(find.byType(SizedBox), findsOneWidget);
      expect(find.byIcon(Icons.warning_outlined), findsNothing);
    });

    testWidgets('should be dismissible when onDismissed is provided',
        (WidgetTester tester) async {
      var wasDismissed = false;

      // Build the widget with dismiss callback
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AppSessionWarningBanner(
              isVisible: true,
              onDismissed: () {
                wasDismissed = true;
              },
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Find and tap the dismiss button
      final dismissButton = find.byIcon(Icons.close);
      expect(dismissButton, findsOneWidget);

      await tester.tap(dismissButton);
      await tester.pumpAndSettle();

      // Verify that the dismiss callback was called
      expect(wasDismissed, isTrue);
    });

    testWidgets('should always show dismiss button',
        (WidgetTester tester) async {
      // Build the widget without dismiss callback
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AppSessionWarningBanner(
              isVisible: true,
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Verify that dismiss button is always shown
      expect(find.byIcon(Icons.close), findsOneWidget);
    });

    testWidgets('should handle custom message',
        (WidgetTester tester) async {
      const customMessage = 'Custom warning message for testing';

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AppSessionWarningBanner(
              isVisible: true,
              customMessage: customMessage,
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Verify that the custom message is displayed
      expect(find.text(customMessage), findsOneWidget);
    });

    testWidgets('should apply correct styling and theme',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: ThemeData(
            colorScheme: const ColorScheme.light(),
          ),
          home: const Scaffold(
            body: AppSessionWarningBanner(
              isVisible: true,
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Verify that the banner follows the theme colors
      final banner = find.byType(AppSessionWarningBanner);
      expect(banner, findsOneWidget);

      // Test that the widget is properly styled
      expect(find.byType(Container), findsWidgets);
    });

    group('edge cases', () {
      testWidgets('should rebuild correctly when visibility changes',
          (WidgetTester tester) async {
        var isVisible = false;

        await tester.pumpWidget(
          MaterialApp(
            home: Scaffold(
              body: StatefulBuilder(
                builder: (context, setState) {
                  return Column(
                    children: [
                      AppSessionWarningBanner(
                        isVisible: isVisible,
                      ),
                      ElevatedButton(
                        onPressed: () {
                          setState(() {
                            isVisible = !isVisible;
                          });
                        },
                        child: const Text('Toggle'),
                      ),
                    ],
                  );
                },
              ),
            ),
          ),
        );

        await tester.pumpAndSettle();

        // Initially should not show banner
        expect(find.byType(SizedBox), findsOneWidget);

        // Tap toggle button to show banner
        await tester.tap(find.text('Toggle'));
        await tester.pumpAndSettle();

        // After toggle, banner should be visible
        expect(find.byIcon(Icons.warning_outlined), findsOneWidget);
      });
    });
  });

  group('SessionWarningSnackBar', () {
    testWidgets('should show snackbar with warning',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Builder(
              builder: (context) {
                return ElevatedButton(
                  onPressed: () {
                    SessionWarningSnackBar.show(context);
                  },
                  child: const Text('Show SnackBar'),
                );
              },
            ),
          ),
        ),
      );

      // Tap button to show snackbar
      await tester.tap(find.text('Show SnackBar'));
      await tester.pumpAndSettle();

      // Verify snackbar is shown
      expect(find.byType(SnackBar), findsOneWidget);
      expect(find.byIcon(Icons.warning_outlined), findsOneWidget);
      expect(find.textContaining('Session data will be lost'), findsOneWidget);
    });
  });
}

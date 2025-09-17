import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:skiffy/app/design_system/theme.dart';
import 'package:skiffy/widgets/app_card.dart';

void main() {
  group('AppCard', () {
    testWidgets('displays child content correctly', (tester) async {
      const testText = 'Test Card Content';

      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.lightTheme,
          home: const Scaffold(
            body: AppCard(
              child: Text(testText),
            ),
          ),
        ),
      );

      expect(find.text(testText), findsOneWidget);
    });

    testWidgets('handles tap events correctly', (tester) async {
      var wasTapped = false;

      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.lightTheme,
          home: Scaffold(
            body: AppCard.interactive(
              onTap: () {
                wasTapped = true;
              },
              child: const Text('Tappable Card'),
            ),
          ),
        ),
      );

      await tester.tap(find.byType(AppCard));
      expect(wasTapped, isTrue);
    });

    testWidgets('creates different variants correctly', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.lightTheme,
          home: const Scaffold(
            body: Column(
              children: [
                AppCard.elevated(child: Text('Elevated')),
                AppCard.outlined(child: Text('Outlined')),
                AppCard.filled(child: Text('Filled')),
              ],
            ),
          ),
        ),
      );

      expect(find.byType(AppCard), findsNWidgets(3));
      expect(find.text('Elevated'), findsOneWidget);
      expect(find.text('Outlined'), findsOneWidget);
      expect(find.text('Filled'), findsOneWidget);
    });

    testWidgets('displays header and footer correctly', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.lightTheme,
          home: const Scaffold(
            body: AppCard(
              header: Text('Header'),
              footer: Text('Footer'),
              child: Text('Content'),
            ),
          ),
        ),
      );

      expect(find.text('Header'), findsOneWidget);
      expect(find.text('Content'), findsOneWidget);
      expect(find.text('Footer'), findsOneWidget);
    });

    testWidgets('shows loading state correctly', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.lightTheme,
          home: const Scaffold(
            body: AppCard(
              isLoading: true,
              child: Text('Loading Card'),
            ),
          ),
        ),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      expect(find.text('Loading Card'), findsOneWidget);
    });

    group('AppCardLayouts', () {
      testWidgets('list item layout works correctly', (tester) async {
        await tester.pumpWidget(
          MaterialApp(
            theme: AppTheme.lightTheme,
            home: Scaffold(
              body: AppCardLayouts.listItem(
                title: const Text('List Item'),
                subtitle: const Text('Subtitle'),
                leading: const Icon(Icons.person),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {},
              ),
            ),
          ),
        );

        expect(find.text('List Item'), findsOneWidget);
        expect(find.text('Subtitle'), findsOneWidget);
        expect(find.byIcon(Icons.person), findsOneWidget);
        expect(find.byIcon(Icons.chevron_right), findsOneWidget);
      });

      testWidgets('settings item layout works correctly', (tester) async {
        await tester.pumpWidget(
          MaterialApp(
            theme: AppTheme.lightTheme,
            home: Scaffold(
              body: AppCardLayouts.settingsItem(
                title: 'Settings Item',
                subtitle: 'Settings subtitle',
                leading: const Icon(Icons.settings),
                onTap: () {},
              ),
            ),
          ),
        );

        expect(find.text('Settings Item'), findsOneWidget);
        expect(find.text('Settings subtitle'), findsOneWidget);
        expect(find.byIcon(Icons.settings), findsOneWidget);
        expect(find.byIcon(Icons.chevron_right), findsOneWidget);
      });

      testWidgets('info layout works correctly', (tester) async {
        await tester.pumpWidget(
          MaterialApp(
            theme: AppTheme.lightTheme,
            home: Scaffold(
              body: AppCardLayouts.info(
                title: 'Info Title',
                description: 'Info description',
                icon: const Icon(Icons.info),
              ),
            ),
          ),
        );

        expect(find.text('Info Title'), findsOneWidget);
        expect(find.text('Info description'), findsOneWidget);
        expect(find.byIcon(Icons.info), findsOneWidget);
      });
    });
  });
}

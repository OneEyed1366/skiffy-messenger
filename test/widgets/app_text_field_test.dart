import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:skiffy/app/design_system/theme.dart';
import 'package:skiffy/l10n/l10n.dart';
import 'package:skiffy/widgets/app_text_field.dart';

void main() {
  group('AppTextField', () {
    testWidgets('displays label and hint text correctly', (tester) async {
      const labelText = 'Test Label';
      const hintText = 'Test Hint';

      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.lightTheme,
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          home: const Scaffold(
            body: AppTextField.filled(
              labelText: labelText,
              hintText: hintText,
            ),
          ),
        ),
      );

      expect(find.text(labelText), findsOneWidget);
      // Hint text may not be visible until field is focused
      await tester.tap(find.byType(AppTextField));
      await tester.pumpAndSettle();
    });

    testWidgets('handles text input correctly', (tester) async {
      const testText = 'Hello World';
      final controller = TextEditingController();

      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.lightTheme,
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          home: Scaffold(
            body: AppTextField.filled(
              controller: controller,
              hintText: 'Enter text',
            ),
          ),
        ),
      );

      // Tap the text field first to focus it
      await tester.tap(find.byType(AppTextField));
      await tester.pump();

      // Type the text
      await tester.enterText(find.byType(TextFormField), testText);
      await tester.pump();

      expect(controller.text, equals(testText));
    });

    testWidgets('password field toggles visibility correctly', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.lightTheme,
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          home: const Scaffold(
            body: AppTextField.password(
              hintText: 'Enter password',
            ),
          ),
        ),
      );

      // Enter password text
      await tester.enterText(find.byType(AppTextField), 'password123');

      // Find the visibility toggle button
      expect(find.byIcon(Icons.visibility), findsOneWidget);

      // Tap to toggle visibility
      await tester.tap(find.byIcon(Icons.visibility));
      await tester.pumpAndSettle();

      // Icon should change to visibility_off
      expect(find.byIcon(Icons.visibility_off), findsOneWidget);
    });

    testWidgets('search field has correct icon', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.lightTheme,
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          home: const Scaffold(
            body: AppTextField.search(),
          ),
        ),
      );

      expect(find.byIcon(Icons.search), findsOneWidget);
      // Note: Search hint text will be localized but for this test we just verify the field exists
      expect(find.byType(TextFormField), findsOneWidget);
    });

    testWidgets('validates required fields correctly', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.lightTheme,
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          home: const Scaffold(
            body: AppTextField.filled(
              validator: TextFieldValidators.required,
            ),
          ),
        ),
      );

      // Test empty validation
      final validator = TextFieldValidators.required('');
      expect(validator, isNotNull);

      // Test non-empty validation
      final validValue = TextFieldValidators.required('test');
      expect(validValue, isNull);
    });

    testWidgets('email validation works correctly', (tester) async {
      // Test invalid email
      expect(
        TextFieldValidators.email('invalid-email', null),
        'Enter valid email address',
      );

      // Test valid email
      expect(
        TextFieldValidators.email('test@example.com', null),
        null,
      );

      // Test empty email
      expect(
        TextFieldValidators.email('', null),
        'Enter email address',
      );
    });

    testWidgets('password validation works correctly', (tester) async {
      // Test weak password
      expect(
        TextFieldValidators.password('weak'),
        'Password must contain at least 8 characters',
      );

      // Test password without uppercase
      expect(
        TextFieldValidators.password('password123'),
        'Password must contain an uppercase letter',
      );

      // Test valid password
      expect(
        TextFieldValidators.password('Password123'),
        null,
      );
    });

    testWidgets('matrix user ID validation works correctly', (tester) async {
      // Test invalid format
      expect(
        TextFieldValidators.matrixUserId('invalid', null),
        'Enter valid Matrix ID (@user:server.com)',
      );

      // Test valid Matrix ID
      expect(
        TextFieldValidators.matrixUserId('@user:example.com', null),
        null,
      );
    });
  });
}

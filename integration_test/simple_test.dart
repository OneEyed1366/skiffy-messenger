import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:skiffy/api/api.dart';
import 'package:skiffy/app/view/app.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  setUpAll(() async => RustLib.init());
  testWidgets('Can call rust function', (WidgetTester tester) async {
    await tester.pumpWidget(App());
    expect(find.textContaining('Result: `Hello, Tom!`'), findsOneWidget);
  });
}

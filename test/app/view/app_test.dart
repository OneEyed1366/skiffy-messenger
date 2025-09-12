import 'package:flutter_test/flutter_test.dart';
import 'package:skiffy/app/app.dart';
import 'package:skiffy/features/counter/counter.dart';

void main() {
  group('App', () {
    testWidgets('renders CounterPage', (tester) async {
      await tester.pumpWidget(App());
      expect(find.byType(CounterPage), findsOneWidget);
    });
  });
}

import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:skiffy/app/config/config.dart';

void main() {
  group('Environment', () {
    tearDown(() {
      // Clear dotenv after each test
      dotenv.testLoad();
    });

    test(
      'should create Environment with default values when no env vars set',
      () {
        dotenv.testLoad();

        final env = Environment.fromDotEnv();

        expect(env.enableDebugLogs, false);
        expect(env.enableAnalytics, false);
        expect(env.enableCrashReporting, false);
        expect(env.enableFlutterInspector, false);
        expect(env.enablePerformanceOverlay, false);
        expect(env.enableTestFeatures, false);
        expect(env.enablePerformanceMonitoring, false);
        expect(env.enableErrorTracking, false);
        expect(env.enforceTls, true); // default is true
        expect(env.logLevel, 'info');
      },
    );

    test('should parse boolean environment variables correctly', () {
      dotenv.testLoad(
        fileInput: '''
ENABLE_DEBUG_LOGS=true
ENABLE_ANALYTICS=false
ENABLE_CRASH_REPORTING=TRUE
ENABLE_FLUTTER_INSPECTOR=False
ENFORCE_TLS=false
''',
      );

      final env = Environment.fromDotEnv();

      expect(env.enableDebugLogs, true);
      expect(env.enableAnalytics, false);
      expect(env.enableCrashReporting, true);
      expect(env.enableFlutterInspector, false);
      expect(env.enforceTls, false);
    });

    test('should parse string environment variables correctly', () {
      dotenv.testLoad(
        fileInput: '''
LOG_LEVEL=debug
''',
      );

      final env = Environment.fromDotEnv();

      expect(env.logLevel, 'debug');
    });

    test('should handle mixed case boolean values', () {
      dotenv.testLoad(
        fileInput: '''
ENABLE_DEBUG_LOGS=True
ENABLE_ANALYTICS=FALSE
ENABLE_CRASH_REPORTING=tRuE
''',
      );

      final env = Environment.fromDotEnv();

      expect(env.enableDebugLogs, true);
      expect(env.enableAnalytics, false);
      expect(env.enableCrashReporting, true);
    });

    test('should maintain static utility methods', () {
      dotenv.testLoad(
        fileInput: '''
TEST_KEY=test_value
BOOL_KEY=true
''',
      );

      expect(Environment.hasVariable('TEST_KEY'), true);
      expect(Environment.hasVariable('MISSING_KEY'), false);
      expect(Environment.getVariable('TEST_KEY'), 'test_value');
      expect(Environment.getVariable('MISSING_KEY'), null);

      final allVars = Environment.getAllVariables();
      expect(allVars['TEST_KEY'], 'test_value');
      expect(allVars['BOOL_KEY'], 'true');
    });

    test('should use type-safe access pattern', () {
      dotenv.testLoad(
        fileInput: '''
ENABLE_DEBUG_LOGS=true
LOG_LEVEL=warning
''',
      );

      // Test the global ENV pattern (simulated)
      final env = Environment.fromDotEnv();

      // This demonstrates type-safe access
      expect(env.enableDebugLogs, isA<bool>());
      expect(env.logLevel, isA<String>());
      expect(env.logLevel, 'warning');
    });
  });
}

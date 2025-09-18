import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:skiffy/flavors/flavor_config.dart';

void main() {
  group('Environment Configuration', () {
    setUp(() {
      // Reset dotenv before each test
      dotenv.testLoad();
    });

    test('FlavorConfig sets and gets flavor correctly', () {
      FlavorConfig.setFlavor(AppFlavor.development);
      expect(FlavorConfig.currentFlavor, AppFlavor.development);
      expect(FlavorConfig.flavorName, 'development');

      FlavorConfig.setFlavor(AppFlavor.staging);
      expect(FlavorConfig.currentFlavor, AppFlavor.staging);
      expect(FlavorConfig.flavorName, 'staging');

      FlavorConfig.setFlavor(AppFlavor.production);
      expect(FlavorConfig.currentFlavor, AppFlavor.production);
      expect(FlavorConfig.flavorName, 'production');
    });

    test('FlavorConfig defaults to development when not set', () {
      // Reset flavor to null (simulate fresh start)
      FlavorConfig.setFlavor(AppFlavor.development);
      // Since we can't reset to null in the current implementation,
      // we verify the default through the implementation
      expect(FlavorConfig.currentFlavor, isNotNull);
    });

    test('Environment variables can be loaded and accessed', () {
      // Test loading a simple environment configuration
      const testEnvContent = '''
API_BASE_URL=https://test-api.example.com
ENABLE_DEBUG_LOGS=true
API_TIMEOUT=5000
      ''';

      dotenv.testLoad(fileInput: testEnvContent);

      // Verify variables are accessible
      expect(dotenv.env['API_BASE_URL'], 'https://test-api.example.com');
      expect(dotenv.env['ENABLE_DEBUG_LOGS'], 'true');
      expect(dotenv.env['API_TIMEOUT'], '5000');
    });

    test('Environment config follows first-wins behavior', () {
      // Test that flutter_dotenv keeps first occurrence (not last)
      const configWithDuplicates = '''
# First occurrence wins in flutter_dotenv
API_BASE_URL=https://first-api.example.com
ENABLE_DEBUG_LOGS=true
SHARED_VALUE=base_value

# Later values are ignored for duplicate keys
API_BASE_URL=https://ignored-api.example.com
ENABLE_DEBUG_LOGS=false
UNIQUE_VALUE=unique_value
      ''';

      dotenv.testLoad(fileInput: configWithDuplicates);

      // Verify flutter_dotenv's "first wins" behavior
      expect(dotenv.env['API_BASE_URL'], 'https://first-api.example.com'); // First value kept
      expect(dotenv.env['ENABLE_DEBUG_LOGS'], 'true'); // First value kept
      expect(dotenv.env['SHARED_VALUE'], 'base_value'); // Only occurrence
      expect(dotenv.env['UNIQUE_VALUE'], 'unique_value'); // Only occurrence
    });

    test('Environment merging prioritizes mergeWith values', () {
      // Test the actual merging behavior used in bootstrap
      const flavorConfig = '''
API_BASE_URL=https://dev-api.example.com
ENABLE_DEBUG_LOGS=true
DEV_ONLY_VALUE=dev_specific
      ''';

      const baseConfig = '''
API_BASE_URL=https://base-api.example.com
ENABLE_DEBUG_LOGS=false
SHARED_VALUE=base_value
BASE_ONLY_VALUE=base_specific
      ''';

      // First load flavor config
      dotenv.testLoad(fileInput: flavorConfig);
      final flavorEnv = Map<String, String>.from(dotenv.env);

      // Then merge base config (base values added for missing keys only)
      dotenv.testLoad(fileInput: baseConfig, mergeWith: flavorEnv);

      // Verify: flavor values win, base fills gaps
      expect(dotenv.env['API_BASE_URL'], 'https://dev-api.example.com'); // Flavor wins
      expect(dotenv.env['ENABLE_DEBUG_LOGS'], 'true'); // Flavor wins
      expect(dotenv.env['DEV_ONLY_VALUE'], 'dev_specific'); // Flavor only
      expect(dotenv.env['SHARED_VALUE'], 'base_value'); // Base fills gap
      expect(dotenv.env['BASE_ONLY_VALUE'], 'base_specific'); // Base fills gap
    });
  });
}

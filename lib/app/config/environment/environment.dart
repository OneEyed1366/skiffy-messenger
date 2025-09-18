import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:json_annotation/json_annotation.dart';

part 'environment.g.dart';

/// Type-safe environment configuration with validation
///
/// Uses json_serializable for compile-time type safety and runtime validation
@JsonSerializable(createToJson: false)
class Environment {
  const Environment({
    required this.enableDebugLogs,
    required this.enableAnalytics,
    required this.enableCrashReporting,
    required this.enableFlutterInspector,
    required this.enablePerformanceOverlay,
    required this.enableTestFeatures,
    required this.enablePerformanceMonitoring,
    required this.enableErrorTracking,
    required this.enforceTls,
    required this.logLevel,
  });

  /// Create Environment from dotenv with validation
  factory Environment.fromDotEnv() {
    // Convert string values to expected types for json_serializable
    final envMap = <String, dynamic>{};

    for (final entry in dotenv.env.entries) {
      final key = entry.key;
      final value = entry.value;

      // Convert boolean strings to actual booleans
      if (_booleanKeys.contains(key)) {
        envMap[key] = value.toLowerCase() == 'true';
      } else {
        envMap[key] = value;
      }
    }

    return _$EnvironmentFromJson(envMap);
  }

  /// Feature Flags
  @JsonKey(name: 'ENABLE_DEBUG_LOGS', defaultValue: false)
  final bool enableDebugLogs;

  @JsonKey(name: 'ENABLE_ANALYTICS', defaultValue: false)
  final bool enableAnalytics;

  @JsonKey(name: 'ENABLE_CRASH_REPORTING', defaultValue: false)
  final bool enableCrashReporting;

  /// Development Tools (feature flags)
  @JsonKey(name: 'ENABLE_FLUTTER_INSPECTOR', defaultValue: false)
  final bool enableFlutterInspector;

  @JsonKey(name: 'ENABLE_PERFORMANCE_OVERLAY', defaultValue: false)
  final bool enablePerformanceOverlay;

  @JsonKey(name: 'ENABLE_TEST_FEATURES', defaultValue: false)
  final bool enableTestFeatures;

  /// Production Optimizations
  @JsonKey(name: 'ENABLE_PERFORMANCE_MONITORING', defaultValue: false)
  final bool enablePerformanceMonitoring;

  @JsonKey(name: 'ENABLE_ERROR_TRACKING', defaultValue: false)
  final bool enableErrorTracking;

  /// Security Configuration
  @JsonKey(name: 'ENFORCE_TLS', defaultValue: true)
  final bool enforceTls;

  /// Logging Configuration
  @JsonKey(name: 'LOG_LEVEL', defaultValue: 'info')
  final String logLevel;

  /// Keys that should be treated as booleans
  static const _booleanKeys = {
    'ENABLE_DEBUG_LOGS',
    'ENABLE_ANALYTICS',
    'ENABLE_CRASH_REPORTING',
    'ENABLE_FLUTTER_INSPECTOR',
    'ENABLE_PERFORMANCE_OVERLAY',
    'ENABLE_TEST_FEATURES',
    'ENABLE_PERFORMANCE_MONITORING',
    'ENABLE_ERROR_TRACKING',
    'ENFORCE_TLS',
  };

  /// Utility method to check if a variable exists
  static bool hasVariable(String key) => dotenv.env.containsKey(key);

  /// Get raw environment variable value
  static String? getVariable(String key) => dotenv.env[key];

  /// Get all environment variables (for debugging)
  static Map<String, String> getAllVariables() =>
      Map<String, String>.from(dotenv.env);
}

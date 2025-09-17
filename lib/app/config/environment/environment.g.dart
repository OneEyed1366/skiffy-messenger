// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'environment.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Environment _$EnvironmentFromJson(Map<String, dynamic> json) => Environment(
  enableDebugLogs: json['ENABLE_DEBUG_LOGS'] as bool? ?? false,
  enableAnalytics: json['ENABLE_ANALYTICS'] as bool? ?? false,
  enableCrashReporting: json['ENABLE_CRASH_REPORTING'] as bool? ?? false,
  enableFlutterInspector: json['ENABLE_FLUTTER_INSPECTOR'] as bool? ?? false,
  enablePerformanceOverlay:
      json['ENABLE_PERFORMANCE_OVERLAY'] as bool? ?? false,
  enableTestFeatures: json['ENABLE_TEST_FEATURES'] as bool? ?? false,
  enablePerformanceMonitoring:
      json['ENABLE_PERFORMANCE_MONITORING'] as bool? ?? false,
  enableErrorTracking: json['ENABLE_ERROR_TRACKING'] as bool? ?? false,
  enforceTls: json['ENFORCE_TLS'] as bool? ?? true,
  logLevel: json['LOG_LEVEL'] as String? ?? 'info',
);

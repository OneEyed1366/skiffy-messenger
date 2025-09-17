import 'dart:async';
import 'dart:developer';

import 'package:bloc/bloc.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:skiffy/app/config/config.dart';
import 'package:skiffy/flavors/flavor_config.dart';
import 'package:skiffy/rust/frb_generated.dart' show RustLib;

class AppBlocObserver extends BlocObserver {
  const AppBlocObserver();

  @override
  void onChange(BlocBase<dynamic> bloc, Change<dynamic> change) {
    super.onChange(bloc, change);
    log('onChange(${bloc.runtimeType}, $change)');
  }

  @override
  void onError(BlocBase<dynamic> bloc, Object error, StackTrace stackTrace) {
    log('onError(${bloc.runtimeType}, $error, $stackTrace)');
    super.onError(bloc, error, stackTrace);
  }
}

Future<void> bootstrap(FutureOr<Widget> Function() builder) async {
  FlutterError.onError = (details) {
    log(details.exceptionAsString(), stackTrace: details.stack);
  };

  Bloc.observer = const AppBlocObserver();

  // Add cross-flavor configuration here
  // Инициализация Rust биндинги
  await RustLib.init();

  // Load environment configuration based on current flavor
  await _loadEnvironmentConfiguration();

  runApp(await builder());
}

/// Loads environment configuration based on current flavor
///
/// Loads flavor-specific configuration first, then base config for fallbacks
/// This works with flutter_dotenv's "first wins" behavior
Future<void> _loadEnvironmentConfiguration() async {
  try {
    // Load flavor-specific configuration first (gets priority due to "first wins")
    final flavorEnvFile = '.env.${FlavorConfig.flavorName}';
    await dotenv.load(fileName: flavorEnvFile);

    // Then merge base configuration for missing keys only
    await dotenv.load(fileName: '.env', mergeWith: dotenv.env);

    // Initialize type-safe global environment instance
    ENV = Environment.fromDotEnv();

    log(
      'Environment configuration loaded for flavor: ${FlavorConfig.flavorName}',
    );
  } catch (e) {
    log('Warning: Could not load environment configuration: $e');
    // Continue execution - environment variables are optional
    // Initialize with defaults if loading fails
    ENV = const Environment(
      enableDebugLogs: false,
      enableAnalytics: false,
      enableCrashReporting: false,
      enableFlutterInspector: false,
      enablePerformanceOverlay: false,
      enableTestFeatures: false,
      enablePerformanceMonitoring: false,
      enableErrorTracking: false,
      enforceTls: true,
      logLevel: 'info',
    );
  }
}

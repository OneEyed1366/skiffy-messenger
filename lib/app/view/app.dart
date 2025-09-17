import 'package:flutter/material.dart';
import 'package:skiffy/app/design_system/theme.dart';
import 'package:skiffy/app/router/router.dart';
import 'package:skiffy/l10n/l10n.dart';

class App extends StatelessWidget {
  App({super.key});

  // make sure you don't initiate your router
  // inside of the build function.
  final _appRouter = AppRouter();

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      routerConfig: _appRouter.config(),
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
    );
  }
}

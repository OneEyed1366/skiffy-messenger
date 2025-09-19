import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:skiffy/features/auth/bloc/auth_bloc.dart';
import 'package:skiffy/features/auth/bloc/auth_event.dart';
import 'package:skiffy/features/auth/bloc/auth_state.dart';
import 'package:skiffy/features/auth/widgets/login_form.dart';
import 'package:skiffy/features/auth/widgets/sso_button.dart';
import 'package:skiffy/l10n/l10n.dart';

/// Screen for user authentication with dynamic login methods
class LoginScreen extends StatelessWidget {
  const LoginScreen({
    required this.homeserverUrl, super.key,
  });

  final String homeserverUrl;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.counterAppBarTitle),
        elevation: 0,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: BlocProvider(
            create: (context) => AuthBloc(localizations: l10n)
              ..add(CheckHomeserverCapabilities(homeserverUrl)),
            child: BlocConsumer<AuthBloc, AuthState>(
              listener: (context, state) {
                if (state is AuthSuccess) {
                  // Navigate to main app or handle successful login
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Welcome ${state.user.userId}!'),
                      backgroundColor: Colors.green,
                    ),
                  );
                } else if (state is AuthError) {
                  // Show error message
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(state.message),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              },
              builder: (context, state) {
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Header
                    Text(
                      'Sign In',
                      style: Theme.of(context)
                          .textTheme
                          .headlineMedium
                          ?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      homeserverUrl,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Theme.of(context)
                            .colorScheme
                            .onSurface
                            .withValues(alpha: 0.7),
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 32),

                    // Loading state
                    if (state is AuthLoading) ...[
                      const Center(child: CircularProgressIndicator()),
                      const SizedBox(height: 16),
                      Text(
                        l10n.homeserverCapabilityDetectionInProgress,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Theme.of(context)
                              .colorScheme
                              .onSurface
                              .withValues(alpha: 0.7),
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ]

                    // Capabilities loaded - show authentication options
                    else if (state is HomeserverCapabilitiesLoaded) ...[
                      _buildAuthenticationOptions(context, state, l10n),
                    ]

                    // Error state
                    else if (state is AuthError) ...[
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.errorContainer,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Column(
                          children: [
                            Icon(
                              Icons.error_outline,
                              color: Theme.of(context)
                                  .colorScheme
                                  .onErrorContainer,
                              size: 48,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              state.message,
                              style: Theme.of(context)
                                  .textTheme
                                  .bodyMedium
                                  ?.copyWith(
                                    color: Theme.of(context)
                                        .colorScheme
                                        .onErrorContainer,
                                  ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: () {
                                context.read<AuthBloc>().add(
                                  CheckHomeserverCapabilities(homeserverUrl),
                                );
                              },
                              child: const Text('Retry'),
                            ),
                          ],
                        ),
                      ),
                    ]

                    // Initial state - capability check triggered immediately
                    else ...[
                      const Center(child: CircularProgressIndicator()),
                    ],

                    const Spacer(),

                    // Back button
                    TextButton(
                      onPressed: () {
                        Navigator.of(context).pop();
                      },
                      child: const Text('Back to Server Selection'),
                    ),
                  ],
                );
              },
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAuthenticationOptions(
    BuildContext context,
    HomeserverCapabilitiesLoaded state,
    AppLocalizations l10n,
  ) {
    final capabilities = state.capabilities;

    // Check if any supported authentication methods are available
    if (!capabilities.supportsPasswordLogin && !capabilities.supportsSso) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          children: [
            Icon(
              Icons.block,
              color: Theme.of(context).colorScheme.onSurfaceVariant,
              size: 48,
            ),
            const SizedBox(height: 16),
            Text(
              l10n.authNoMethodsAvailable,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Password login form
        if (capabilities.supportsPasswordLogin)
          LoginForm(homeserverUrl: homeserverUrl),

        // Add spacing between authentication methods
        if (capabilities.supportsPasswordLogin && capabilities.supportsSso)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 16),
            child: Row(
              children: [
                Expanded(child: Divider()),
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16),
                  child: Text('OR'),
                ),
                Expanded(child: Divider()),
              ],
            ),
          ),

        // SSO login button
        if (capabilities.supportsSso)
          SsoButton(
            homeserverUrl: homeserverUrl,
            ssoProviders: capabilities.ssoProviders,
          ),
      ],
    );
  }
}

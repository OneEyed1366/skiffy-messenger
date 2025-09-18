import 'package:flutter/material.dart';
import 'package:skiffy/l10n/l10n.dart';
import 'package:skiffy/rust/api/auth.dart';

/// Widget for SSO authentication button
class SsoButton extends StatelessWidget {
  const SsoButton({
    required this.homeserverUrl,
    required this.ssoProviders,
    super.key,
  });

  final String homeserverUrl;
  final List<SsoProvider> ssoProviders;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Section header
        Text(
          l10n.authSignInWithSSO,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 16),

        // SSO button
        ElevatedButton.icon(
          onPressed: () => _handleSsoLogin(context),
          icon: const Icon(Icons.login),
          label: Text(l10n.authSignInWithSSO),
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 16),
            backgroundColor: Theme.of(context).colorScheme.secondary,
            foregroundColor: Theme.of(context).colorScheme.onSecondary,
          ),
        ),

        // Note about SSO providers (for future stories)
        if (ssoProviders.isNotEmpty) ...[
          const SizedBox(height: 8),
          Text(
            'Supported providers: ${_formatProviders(ssoProviders)}',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6),
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ],
    );
  }

  void _handleSsoLogin(BuildContext context) {
    // TODO: Implement SSO login flow in future stories
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('SSO login will be implemented in future stories'),
        backgroundColor: Colors.orange,
      ),
    );
  }

  String _formatProviders(List<SsoProvider> providers) {
    return providers
        .map((provider) {
          switch (provider) {
            case SsoProvider.google:
              return 'Google';
            case SsoProvider.apple:
              return 'Apple';
            case SsoProvider.gitHub:
              return 'GitHub';
            case SsoProvider.gitLab:
              return 'GitLab';
            case SsoProvider.facebook:
              return 'Facebook';
          }
        })
        .join(', ');
  }
}

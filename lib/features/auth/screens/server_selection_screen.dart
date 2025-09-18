import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:skiffy/app/config/constants.dart';
import 'package:skiffy/app/design_system/design_system.dart';
import 'package:skiffy/features/auth/bloc/server_selection_bloc.dart';
import 'package:skiffy/features/auth/bloc/server_selection_event.dart';
import 'package:skiffy/features/auth/bloc/server_selection_state.dart';
import 'package:skiffy/features/auth/widgets/server_input.dart';
import 'package:skiffy/l10n/l10n.dart';
import 'package:skiffy/widgets/app_button.dart';
import 'package:skiffy/widgets/app_card.dart';
import 'package:skiffy/widgets/app_focusable_border.dart';

/// Screen for selecting and configuring Matrix homeserver
class ServerSelectionScreen extends StatefulWidget {
  const ServerSelectionScreen({super.key});

  @override
  State<ServerSelectionScreen> createState() => _ServerSelectionScreenState();
}

class _ServerSelectionScreenState extends State<ServerSelectionScreen> {
  late TextEditingController _controller;
  late ServerSelectionBloc _bloc;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: AppConstants.defaultHomeserver);

    // Initialize BLoC and reset to load stored server
    _bloc = context.read<ServerSelectionBloc>();
    _bloc.add(const ServerSelectionReset());
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.homeserverUrlLabel),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header section
            Text(
              l10n.homeserverUrlLabel,
              style: AppTextStyles.headlineMedium,
            ),
            const SizedBox(height: 8),
            Text(
              l10n.homeserverUrlHint,
              style: AppTextStyles.bodyMedium.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 24),

            // Server input card
            AppCard(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    BlocConsumer<ServerSelectionBloc, ServerSelectionState>(
                      listener: (context, state) {
                        // Update controller when state changes
                        if (state is ServerSelectionInitial &&
                            state.defaultUrl != null) {
                          _controller.text = state.defaultUrl!;
                        }
                      },
                      builder: (context, state) {
                        String? errorText;
                        var isLoading = false;
                        var isEnabled = true;

                        if (state is ServerInvalid) {
                          errorText = state.errorMessage;
                        } else if (state is ServerVerifying) {
                          isLoading = true;
                          isEnabled = false;
                        }

                        return Column(
                          children: [
                            ServerInput(
                              controller: _controller,
                              errorText: errorText,
                              enabled: isEnabled,
                              autofocus: true,
                              onChanged: (value) {
                                _bloc.add(ServerUrlChanged(value));
                              },
                            ),
                            if (isLoading) ...[
                              const SizedBox(height: 16),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Text(
                                    l10n.homeserverVerifying,
                                    style: AppTextStyles.bodyMedium,
                                  ),
                                ],
                              ),
                            ],
                            if (state is ServerValid) ...[
                              const SizedBox(height: 16),
                              AppFocusableBorder(
                                child: Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: theme
                                        .colorScheme
                                        .surfaceContainerHighest,
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(
                                      color: theme.colorScheme.outline
                                          .withOpacity(0.12),
                                    ),
                                  ),
                                  child: Row(
                                    children: [
                                      Icon(
                                        Icons.check_circle,
                                        color: theme.colorScheme.primary,
                                        size: 20,
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Text(
                                          l10n.homeserverVerifiedMessage,
                                          style: AppTextStyles.bodyMedium
                                              .copyWith(
                                                color:
                                                    theme.colorScheme.primary,
                                              ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ],
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),

            const Spacer(),

            // Action buttons
            BlocBuilder<ServerSelectionBloc, ServerSelectionState>(
              builder: (context, state) {
                final isValid = state is ServerValid;
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    AppButton(
                      onPressed: isValid
                          ? () => _handleContinue(context)
                          : null,
                      text: l10n.continueButton,
                    ),
                    const SizedBox(height: 12),
                    AppButton.secondary(
                      onPressed: _handleReset,
                      text: l10n.resetToDefaultButton,
                    ),
                  ],
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  void _handleContinue(BuildContext context) {
    // Navigate to next screen or trigger callback
    Navigator.of(context).pop(_bloc.currentHomeserverUrl);
  }

  void _handleReset() {
    _controller.text = AppConstants.defaultHomeserver;
    _bloc.add(const ServerUrlChanged(AppConstants.defaultHomeserver));
  }
}

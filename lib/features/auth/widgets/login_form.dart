import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:skiffy/features/auth/bloc/auth_bloc.dart';
import 'package:skiffy/features/auth/bloc/auth_event.dart';
import 'package:skiffy/features/auth/bloc/auth_state.dart';
import 'package:skiffy/l10n/l10n.dart';
import 'package:skiffy/utils/validators/auth_validator.dart';

/// Widget for password-based authentication form
class LoginForm extends StatefulWidget {
  const LoginForm({
    required this.homeserverUrl, super.key,
  });

  final String homeserverUrl;

  @override
  State<LoginForm> createState() => _LoginFormState();
}

class _LoginFormState extends State<LoginForm> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isPasswordVisible = false;

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, state) {
        final isLoading = state is AuthLoading;

        return Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Section header
              Text(
                l10n.authSignInWithPassword,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 16),

              // Username field
              TextFormField(
                controller: _usernameController,
                enabled: !isLoading,
                keyboardType: TextInputType.text,
                textInputAction: TextInputAction.next,
                decoration: const InputDecoration(
                  labelText: 'Username or Matrix ID',
                  hintText: '@user:server.com or user',
                  prefixIcon: Icon(Icons.person_outline),
                  border: OutlineInputBorder(),
                ),
                validator: (value) => AuthValidator.validateUsername(value, l10n),
              ),
              const SizedBox(height: 16),

              // Password field
              TextFormField(
                controller: _passwordController,
                enabled: !isLoading,
                obscureText: !_isPasswordVisible,
                keyboardType: TextInputType.visiblePassword,
                textInputAction: TextInputAction.done,
                decoration: InputDecoration(
                  labelText: 'Password',
                  hintText: 'Enter your password',
                  prefixIcon: const Icon(Icons.lock_outline),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _isPasswordVisible ? Icons.visibility_off : Icons.visibility,
                    ),
                    onPressed: () {
                      setState(() {
                        _isPasswordVisible = !_isPasswordVisible;
                      });
                    },
                    tooltip: _isPasswordVisible
                        ? l10n.textFieldHidePassword
                        : l10n.textFieldShowPassword,
                  ),
                  border: const OutlineInputBorder(),
                ),
                validator: (value) => AuthValidator.validatePassword(value, l10n),
                onFieldSubmitted: isLoading ? null : (_) => _submitForm(context),
              ),
              const SizedBox(height: 24),

              // Login button
              ElevatedButton(
                onPressed: isLoading ? null : () => _submitForm(context),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Sign In'),
              ),
            ],
          ),
        );
      },
    );
  }

  void _submitForm(BuildContext context) {
    if (_formKey.currentState?.validate() ?? false) {
      context.read<AuthBloc>().add(
        LoginRequested(
          username: _usernameController.text.trim(),
          password: _passwordController.text,
        ),
      );
    }
  }
}
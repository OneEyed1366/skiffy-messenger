#!/usr/bin/env dart
// Design System Color Usage Checker
// Prevents magic color literals (Color(0xFF...)) outside design system files

// ignore_for_file: avoid_print

import 'dart:io';

void main(List<String> args) {
  final files = _getDartFiles('lib');
  final violations = <ColorViolation>[];

  for (final file in files) {
    if (_isDesignSystemFile(file)) {
      continue; // Allow magic colors in design system files
    }

    final content = File(file).readAsStringSync();
    final fileViolations = _checkForMagicColors(file, content);
    violations.addAll(fileViolations);
  }

  if (violations.isNotEmpty) {
    print('🚨 Design System Violation: Magic color usage detected!');
    print('');
    for (final violation in violations) {
      print('${violation.file}:${violation.line}: ${violation.message}');
      print('  Found: ${violation.code}');
      print('  Fix: Use AppColors.${violation.suggestion} instead');
      print('');
    }
    print('❌ ${violations.length} violations found.');
    print(
      '💡 Use colors from lib/app/design_system/colors.dart (AppColors class)',
    );
    exit(1);
  }

  print('✅ No magic color usage detected. Design system compliance verified!');
}

List<String> _getDartFiles(String directory) {
  final dir = Directory(directory);
  final files = <String>[];

  if (!dir.existsSync()) return files;

  for (final entity in dir.listSync(recursive: true)) {
    if (entity is File && entity.path.endsWith('.dart')) {
      files.add(entity.path);
    }
  }

  return files;
}

bool _isDesignSystemFile(String filePath) {
  // Allow magic colors only in design system files and related test files
  return filePath.contains('lib/app/design_system/') ||
      filePath.contains('test/app/design_system/') ||
      filePath.contains('test/') && filePath.contains('color'); // Allow in color tests
}

List<ColorViolation> _checkForMagicColors(String file, String content) {
  final violations = <ColorViolation>[];
  final lines = content.split('\n');

  // Regex patterns for magic color literals
  final patterns = [
    RegExp(r'Color\s*\(\s*0x[0-9A-Fa-f]{8}\s*\)'), // Color(0xFF123456)
    RegExp(r'Color\.fromARGB\s*\('), // Color.fromARGB(...)
    RegExp(r'Color\.fromRGBO\s*\('), // Color.fromRGBO(...)
  ];

  for (var i = 0; i < lines.length; i++) {
    final line = lines[i];
    final lineNumber = i + 1;

    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
      continue;
    }

    for (final pattern in patterns) {
      final matches = pattern.allMatches(line);
      for (final match in matches) {
        final colorCode = match.group(0)!;
        violations.add(
          ColorViolation(
            file: file,
            line: lineNumber,
            code: colorCode,
            message: 'Magic color literal usage detected',
            suggestion: _suggestAppColor(colorCode),
          ),
        );
      }
    }
  }

  return violations;
}

String _suggestAppColor(String colorCode) {
  // Basic suggestions based on common color patterns
  if (colorCode.contains('0xFF000000') || colorCode.contains('0x00000000')) {
    return 'neutral900 or surfaceOnBackground';
  } else if (colorCode.contains('0xFFFFFFFF')) {
    return 'neutral50 or surfaceBackground';
  } else if (colorCode.toLowerCase().contains('ff7f50')) {
    return 'primary (use existing AppColors.primary)';
  } else if (colorCode.toLowerCase().contains('008b8b')) {
    return 'secondary (use existing AppColors.secondary)';
  } else {
    return '[appropriate_semantic_color]';
  }
}

class ColorViolation {
  ColorViolation({
    required this.file,
    required this.line,
    required this.code,
    required this.message,
    required this.suggestion,
  });
  final String file;
  final int line;
  final String code;
  final String message;
  final String suggestion;
}

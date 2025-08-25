/**
 * FormField Molecule
 *
 * A complete form input component that combines Input and Text atoms
 * to provide a consistent form field experience with validation.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import Input, { InputProps } from '@/components/atoms/Input';
import Text from '@/components/atoms/Text';
import { SPACING } from '@/theme';
import { FormComponentProps } from '@/types/componentProps';

export interface FormFieldProps extends FormComponentProps, Omit<InputProps, 'error' | 'hint'> {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  touched?: boolean;
  showErrorOnly?: boolean; // Only show error if field has been touched
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  hint,
  required = false,
  touched = false,
  showErrorOnly = true,
  style,
  testID,
  accessibilityLabel,
  ...inputProps
}) => {
  const shouldShowError = error && (!showErrorOnly || touched);
  const shouldShowHint = hint && !shouldShowError;

  return (
    <View style={[styles.container, style]} testID={testID}>
      <Text
        variant="label"
        weight="medium"
        style={styles.label}
        accessibilityLabel={accessibilityLabel || `${label} field`}
      >
        {label}
        {required && <Text color="error"> *</Text>}
      </Text>

      <Input
        {...inputProps}
        error={shouldShowError ? error : undefined}
        hint={shouldShowHint ? hint : undefined}
        required={required}
        accessibilityLabel={`${label} input`}
      />

      {shouldShowError && (
        <View accessibilityLabel={`Error: ${error}`} accessibilityRole="text">
          <Text variant="caption" color="error" style={styles.errorText}>
            {error}
          </Text>
        </View>
      )}

      {shouldShowHint && (
        <Text
          variant="caption"
          color="slate"
          style={styles.hintText}
          accessibilityLabel={`Hint: ${hint}`}
        >
          {hint}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.medium,
  },

  errorText: {
    marginTop: SPACING.xs,
  },

  hintText: {
    marginTop: SPACING.xs,
  },

  label: {
    marginBottom: SPACING.xs,
  },
});

export default FormField;

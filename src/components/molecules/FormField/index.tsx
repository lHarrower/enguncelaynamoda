/**
 * FormField Molecule
 * 
 * A complete form input component that combines Input and Text atoms
 * to provide a consistent form field experience with validation.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FormComponentProps } from '@/types/componentProps';
import { SPACING } from '@/theme';
import Input, { InputProps } from '@/components/atoms/Input';
import Text from '@/components/atoms/Text';

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
        <Text 
          variant="caption" 
          color="error" 
          style={styles.errorText}
          accessibilityLabel={`Error: ${error}`}
          accessibilityRole="alert"
        >
          {error}
        </Text>
      )}
      
      {shouldShowHint && (
        <Text 
          variant="caption" 
          color="600" 
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
    marginBottom: SPACING.margin.medium,
  },
  
  label: {
    marginBottom: SPACING.margin.xs,
  },
  
  errorText: {
    marginTop: SPACING.margin.xs,
  },
  
  hintText: {
    marginTop: SPACING.margin.xs,
  },
});

export default FormField;
export type { FormFieldProps };
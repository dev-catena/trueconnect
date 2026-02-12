import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { CustomColors } from '../../core/colors';

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  required = false,
  helperText,
  ...textInputProps
}) => {
  // Garante que editable seja true por padrão, a menos que seja explicitamente false
  const editable = textInputProps.editable !== undefined ? textInputProps.editable : true;
  
  return (
    <View style={styles.container} pointerEvents="box-none">
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        {...textInputProps}
        style={[styles.input, error && styles.inputError, textInputProps.style]}
        placeholderTextColor={CustomColors.activeGreyed}
        editable={editable}
        pointerEvents="auto"
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      {!error && helperText && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: CustomColors.black,
  },
  required: {
    color: CustomColors.vividRed,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: CustomColors.white,
  },
  inputError: {
    borderColor: CustomColors.vividRed,
  },
  errorText: {
    color: CustomColors.vividRed,
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    color: CustomColors.activeGreyed,
    fontSize: 12,
    marginTop: 4,
  },
});

export default FormInput;


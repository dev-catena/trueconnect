import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { CustomColors } from '../../core/colors';
import { maskDate, parseDateString } from '../../utils/formatters';

interface FormDatePickerProps {
  label: string;
  value?: Date;
  onChange: (date: Date) => void;
  error?: string;
  required?: boolean;
  maximumDate?: Date;
  minimumDate?: Date;
}

const FormDatePicker: React.FC<FormDatePickerProps> = ({
  label,
  value,
  onChange,
  error,
  required = false,
  maximumDate,
  minimumDate,
}) => {
  const [dateText, setDateText] = useState('');

  // Atualiza o texto quando o valor externo muda
  useEffect(() => {
    if (value) {
      const day = value.getDate().toString().padStart(2, '0');
      const month = (value.getMonth() + 1).toString().padStart(2, '0');
      const year = value.getFullYear();
      setDateText(`${day}/${month}/${year}`);
    } else {
      setDateText('');
    }
  }, [value]);

  const handleTextChange = (text: string) => {
    // Aplica a máscara
    const formatted = maskDate(text);
    setDateText(formatted);

    // Tenta converter para Date quando tiver 10 caracteres (DD/MM/YYYY)
    if (formatted.length === 10) {
      const parsedDate = parseDateString(formatted);
      
      if (parsedDate) {
        // Valida data mínima
        if (minimumDate && parsedDate < minimumDate) {
          return; // Não atualiza se for menor que a data mínima
        }
        
        // Valida data máxima
        if (maximumDate && parsedDate > maximumDate) {
          return; // Não atualiza se for maior que a data máxima
        }
        
        onChange(parsedDate);
      }
    } else if (formatted.length < 10) {
      // Se o usuário apagar caracteres, limpa a data
      // Não chamamos onChange para não enviar data inválida
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={dateText}
        onChangeText={handleTextChange}
        placeholder="DD/MM/AAAA"
        placeholderTextColor={CustomColors.activeGreyed}
        keyboardType="numeric"
        maxLength={10}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
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
    backgroundColor: CustomColors.white,
    fontSize: 16,
    color: CustomColors.black,
    minHeight: 48,
  },
  inputError: {
    borderColor: CustomColors.vividRed,
  },
  errorText: {
    color: CustomColors.vividRed,
    fontSize: 12,
    marginTop: 4,
  },
});

export default FormDatePicker;

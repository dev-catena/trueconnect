import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { CustomColors } from '../../core/colors';

interface FormSelectProps<T> {
  label: string;
  value?: T;
  options: { label: string; value: T }[];
  onChange: (value: T) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
}

function FormSelect<T>({
  label,
  value,
  options,
  onChange,
  error,
  required = false,
  placeholder = 'Selecione uma opção',
}: FormSelectProps<T>) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TouchableOpacity
        style={[styles.input, error && styles.inputError]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.inputText, !selectedOption && styles.placeholder]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    value === item.value && styles.optionSelected,
                  ]}
                  onPress={() => {
                    onChange(item.value);
                    setModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      value === item.value && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {value === item.value && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputError: {
    borderColor: CustomColors.vividRed,
  },
  inputText: {
    fontSize: 16,
    color: CustomColors.black,
    flex: 1,
  },
  placeholder: {
    color: CustomColors.activeGreyed,
  },
  arrow: {
    color: CustomColors.activeGreyed,
    fontSize: 12,
  },
  errorText: {
    color: CustomColors.vividRed,
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: CustomColors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalClose: {
    fontSize: 24,
    color: CustomColors.activeGreyed,
  },
  option: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: CustomColors.activeColor + '20',
  },
  optionText: {
    fontSize: 16,
    color: CustomColors.black,
  },
  optionTextSelected: {
    color: CustomColors.activeColor,
    fontWeight: '600',
  },
  checkmark: {
    color: CustomColors.activeColor,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FormSelect;






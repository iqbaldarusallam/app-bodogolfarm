import { useState } from 'react';
import { TextInput, View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  suffix?: string;
  prefix?: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad' | 'number-pad' | 'email-address';
  secureTextEntry?: boolean;
  editable?: boolean;
  required?: boolean;
  leftIcon?: string;
};

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helperText,
  suffix,
  prefix,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  secureTextEntry,
  editable = true,
  required = false,
  leftIcon,
}: FormFieldProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? 'border-danger'
    : focused
      ? 'border-primary-700'
      : 'border-outline-variant';

  const bgColor = error ? 'bg-danger-light' : 'bg-surface-container-lowest';

  return (
    <View className="gap-1.5">
      <Text className="text-label-md font-medium text-on-surface-variant">
        {label}
        {required ? <Text className="text-danger"> *</Text> : null}
      </Text>
      <View
        className={`flex-row items-center rounded-xl border bg-surface px-md ${borderColor} ${bgColor}`}
        style={{ minHeight: multiline ? 80 : 48 }}
      >
        {leftIcon && (
          <MaterialCommunityIcons name={leftIcon as any} size={20} color="#707973" style={{ marginRight: 10 }} />
        )}
        {prefix && (
          <Text className="mr-1 text-body-md text-on-surface-variant">{prefix}</Text>
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#BFC9C1"
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`flex-1 bg-transparent py-3 text-body-md text-on-surface ${!value ? 'text-on-surface-variant' : ''}`}
          textAlignVertical={multiline ? 'top' : 'center'}
          style={{ minHeight: 48 }}
        />
        {suffix && (
          <Text className="ml-1 text-body-md font-medium text-on-surface-variant">{suffix}</Text>
        )}
        {error && (
          <MaterialCommunityIcons name="alert-circle" size={18} color="#BA1A1A" />
        )}
      </View>
      {error ? (
        <Text className="text-caption text-danger">{error}</Text>
      ) : helperText ? (
        <Text className="text-caption text-on-surface-variant">{helperText}</Text>
      ) : null}
    </View>
  );
}

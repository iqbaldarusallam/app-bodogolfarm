// ─────────────────────────────────────────────────────────
// Input component — NativeWind implementation
// ─────────────────────────────────────────────────────────

import { useState, type ComponentProps } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  type NativeSyntheticEvent,
  type TextInputFocusEventData,
  type TextInputProps,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
  leftIcon?: IconName;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  isPassword = false,
  leftIcon,
  containerClassName,
  className,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [secureVisible, setSecureVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  function handleFocus(event: NativeSyntheticEvent<TextInputFocusEventData>) {
    setIsFocused(true);
    onFocus?.(event);
  }

  function handleBlur(event: NativeSyntheticEvent<TextInputFocusEventData>) {
    setIsFocused(false);
    onBlur?.(event);
  }

  return (
    <View className={["gap-1", containerClassName ?? ''].join(' ')}>
      <Text className="ml-1 font-label text-label-md font-medium text-on-surface-variant">
        {label}
      </Text>

      <View
        className={[
          'min-h-12 flex-row items-center rounded-xl border bg-surface shadow-sm',
          isFocused ? 'border-primary' : 'border-outline-variant',
          error ? 'border-error' : '',
        ].join(' ')}
      >
        {leftIcon ? (
          <View className="h-12 w-12 items-center justify-center">
            <MaterialCommunityIcons name={leftIcon} size={21} color="#BFC9C1" />
          </View>
        ) : null}

        <TextInput
          className={[
            'min-h-12 flex-1 font-body text-body-lg text-on-surface',
            leftIcon ? 'pl-0' : 'pl-4',
            isPassword ? 'pr-0' : 'pr-4',
            className ?? '',
          ].join(' ')}
          placeholderTextColor="#BFC9C1"
          secureTextEntry={isPassword && !secureVisible}
          onFocus={handleFocus as any}
          onBlur={handleBlur as any}
          {...props}
        />

        {isPassword ? (
          <Pressable
            className="h-12 w-12 items-center justify-center rounded-lg active:opacity-70"
            onPress={() => setSecureVisible(!secureVisible)}
            hitSlop={8}
          >
            <MaterialCommunityIcons
              name={secureVisible ? 'eye-off-outline' : 'eye-outline'}
              size={21}
              color={isFocused ? '#0F5238' : '#BFC9C1'}
            />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text className="font-caption text-caption text-error">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

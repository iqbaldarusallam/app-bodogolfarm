// ─────────────────────────────────────────────────────────
// Button component — NativeWind implementation
// ─────────────────────────────────────────────────────────

import { ActivityIndicator, Pressable, Text, View, type PressableProps } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

interface ButtonProps extends PressableProps {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
}

const buttonClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-primary-50 border border-primary-200',
  ghost: 'bg-transparent',
  danger: 'bg-danger',
};

const labelClasses: Record<ButtonVariant, string> = {
  primary: 'text-on-primary',
  secondary: 'text-primary-700',
  ghost: 'text-primary',
  danger: 'text-on-primary',
};

const iconColors: Record<ButtonVariant, string> = {
  primary: '#FFFFFF',
  secondary: '#0F5238',
  ghost: '#0F5238',
  danger: '#FFFFFF',
};

export function Button({
  title,
  variant = 'primary',
  loading = false,
  fullWidth = true,
  disabled,
  leftIcon,
  rightIcon,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      className={[
        'h-[52px] min-h-[52px] flex-row items-center justify-center gap-2 rounded-xl px-5 active:scale-[0.98] active:opacity-90',
        buttonClasses[variant],
        fullWidth ? 'self-stretch' : '',
        isDisabled ? 'opacity-50' : '',
        className ?? '',
      ].join(' ')}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={iconColors[variant]} size="small" />
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {leftIcon ? (
            <MaterialCommunityIcons name={leftIcon} size={20} color={iconColors[variant]} />
          ) : null}
          <Text className={["font-headline text-headline-sm font-semibold", labelClasses[variant]].join(' ')}>
            {title}
          </Text>
          {rightIcon ? (
            <MaterialCommunityIcons name={rightIcon} size={20} color={iconColors[variant]} />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

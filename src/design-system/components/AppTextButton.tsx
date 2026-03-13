'use client';

import styled, { css } from 'styled-components';
import { COLOR, SEMANTIC, TYPOGRAPHY } from '../tokens';
import AppIcon from './AppIcon';
import AppTypography from './AppTypography';

type ButtonSize = 'SMALL' | 'MEDIUM' | 'LARGE';
type ButtonVariant = 'PRIMARY' | 'SECONDARY' | 'TERTIARY' | 'DANGER';

interface AppTextButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  variant?: ButtonVariant;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  isLoading?: boolean;
}

const sizeStyles = {
  SMALL: css`
    height: 28px;
    padding: 0 12px;
    gap: 4px;
    font-size: 12px;
  `,
  MEDIUM: css`
    height: 32px;
    padding: 0 16px;
    gap: 6px;
    font-size: 14px;
  `,
  LARGE: css`
    height: 40px;
    padding: 0 20px;
    gap: 8px;
    font-size: 14px;
  `,
};

const variantStyles = {
  PRIMARY: css`
    background: ${COLOR.PRIMARY60};
    color: ${COLOR.WHITE};
    border: none;

    &:hover:not(:disabled) {
      background: ${COLOR.PRIMARY70};
    }
  `,
  SECONDARY: css`
    background: ${COLOR.WHITE};
    color: ${SEMANTIC.TEXT_NORMAL};
    border: 1px solid ${COLOR.GRAY30};

    &:hover:not(:disabled) {
      border-color: ${COLOR.PRIMARY60};
      color: ${COLOR.PRIMARY60};
    }
  `,
  TERTIARY: css`
    background: transparent;
    color: ${SEMANTIC.TEXT_NEUTRAL};
    border: none;

    &:hover:not(:disabled) {
      background: ${COLOR.GRAY10};
    }
  `,
  DANGER: css`
    background: ${COLOR.RED60};
    color: ${COLOR.WHITE};
    border: none;

    &:hover:not(:disabled) {
      background: #E52222;
    }
  `,
};

const StyledButton = styled.button<{
  $size: ButtonSize;
  $variant: ButtonVariant;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  ${({ $size }) => sizeStyles[$size]}
  ${({ $variant }) => variantStyles[$variant]}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const AppTextButton = ({
  size = 'MEDIUM',
  variant = 'PRIMARY',
  prefixIcon,
  suffixIcon,
  isLoading,
  children,
  disabled,
  ...rest
}: AppTextButtonProps) => {
  return (
    <StyledButton
      $size={size}
      $variant={variant}
      disabled={disabled || isLoading}
      {...rest}
    >
      {prefixIcon}
      {children}
      {suffixIcon}
    </StyledButton>
  );
};

export default AppTextButton;

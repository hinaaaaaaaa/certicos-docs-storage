'use client';

import styled, { css } from 'styled-components';
import { COLOR, SEMANTIC } from '../tokens';
import AppIcon from './AppIcon';

type ButtonSize = 'SMALL' | 'MEDIUM' | 'LARGE';
type ButtonVariant = 'PRIMARY' | 'SECONDARY' | 'TERTIARY';

interface AppIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: Parameters<typeof AppIcon>[0]['name'];
  size?: ButtonSize;
  variant?: ButtonVariant;
}

const sizeMap = {
  SMALL: { button: 24, icon: 14 },
  MEDIUM: { button: 32, icon: 18 },
  LARGE: { button: 40, icon: 20 },
};

const variantStyles = {
  PRIMARY: css`
    background: ${COLOR.PRIMARY60};
    color: ${COLOR.WHITE};

    &:hover:not(:disabled) {
      background: ${COLOR.PRIMARY70};
    }
  `,
  SECONDARY: css`
    background: ${COLOR.WHITE};
    border: 1px solid ${COLOR.GRAY30};

    &:hover:not(:disabled) {
      border-color: ${COLOR.PRIMARY60};
      background: ${COLOR.PRIMARY10};
    }
  `,
  TERTIARY: css`
    background: transparent;

    &:hover:not(:disabled) {
      background: ${COLOR.GRAY10};
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
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: ${({ $size }) => sizeMap[$size].button}px;
  height: ${({ $size }) => sizeMap[$size].button}px;

  ${({ $variant }) => variantStyles[$variant]}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const AppIconButton = ({
  icon,
  size = 'MEDIUM',
  variant = 'TERTIARY',
  ...rest
}: AppIconButtonProps) => {
  const iconColor =
    variant === 'PRIMARY' ? 'TEXT_WHITE' : 'ICON_NEUTRAL';

  return (
    <StyledButton $size={size} $variant={variant} {...rest}>
      <AppIcon name={icon} size={sizeMap[size].icon} fillColor={iconColor} />
    </StyledButton>
  );
};

export default AppIconButton;

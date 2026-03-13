'use client';

import styled from 'styled-components';
import { TYPOGRAPHY, SEMANTIC } from '../tokens';

type TypographyVariant = keyof typeof TYPOGRAPHY;
type ColorKey = keyof typeof SEMANTIC;

interface AppTypographyProps {
  variant: TypographyVariant;
  color?: ColorKey;
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  ellipsis?: number;
  className?: string;
}

const StyledTypography = styled.span<{
  $fontSize: string;
  $fontWeight: number;
  $lineHeight: string;
  $color?: string;
  $ellipsis?: number;
}>`
  font-size: ${({ $fontSize }) => $fontSize};
  font-weight: ${({ $fontWeight }) => $fontWeight};
  line-height: ${({ $lineHeight }) => $lineHeight};
  color: ${({ $color }) => $color || 'inherit'};

  ${({ $ellipsis }) =>
    $ellipsis &&
    `
    display: -webkit-box;
    -webkit-line-clamp: ${$ellipsis};
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  `}
`;

export const AppTypography = ({
  variant,
  color,
  children,
  as = 'span',
  ellipsis,
  className,
}: AppTypographyProps) => {
  const { size, weight, lineHeight } = TYPOGRAPHY[variant];

  return (
    <StyledTypography
      as={as}
      $fontSize={size}
      $fontWeight={weight}
      $lineHeight={lineHeight}
      $color={color ? SEMANTIC[color] : undefined}
      $ellipsis={ellipsis}
      className={className}
    >
      {children}
    </StyledTypography>
  );
};

export default AppTypography;

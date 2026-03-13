'use client';

import styled from 'styled-components';
import { COLOR, SEMANTIC } from '../tokens';
import AppIcon from './AppIcon';

interface AppSearchInputProps {
  value?: string;
  placeholder?: string;
  width?: number | string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
}

const InputWrapper = styled.div<{ $width?: number | string }>`
  position: relative;
  width: ${({ $width }) =>
    typeof $width === 'number' ? `${$width}px` : $width || '240px'};
`;

const StyledInput = styled.input`
  width: 100%;
  height: 32px;
  padding: 0 36px 0 12px;
  border: 1px solid ${COLOR.GRAY30};
  border-radius: 4px;
  font-size: 14px;
  color: ${SEMANTIC.TEXT_NORMAL};
  background: ${COLOR.WHITE};
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${COLOR.PRIMARY50};
  }

  &:focus {
    outline: none;
    border-color: ${COLOR.PRIMARY60};
  }

  &::placeholder {
    color: ${COLOR.GRAY50};
  }
`;

const SearchIconWrapper = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.7;
  }
`;

export const AppSearchInput = ({
  value,
  placeholder = '검색...',
  width,
  onChange,
  onSearch,
}: AppSearchInputProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch?.(value || '');
    }
  };

  return (
    <InputWrapper $width={width}>
      <StyledInput
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <SearchIconWrapper type="button" onClick={() => onSearch?.(value || '')}>
        <AppIcon name="search" size={16} fillColor="ICON_ASSISTIVE" />
      </SearchIconWrapper>
    </InputWrapper>
  );
};

export default AppSearchInput;

'use client';

import styled from 'styled-components';
import { useState, useRef, useEffect } from 'react';
import { COLOR, SEMANTIC, SHADOW } from '../tokens';
import AppIcon from './AppIcon';

interface SelectOption {
  value: string | number;
  label: string;
}

interface AppSelectProps {
  value?: string | number;
  options: SelectOption[];
  placeholder?: string;
  width?: number | string;
  disabled?: boolean;
  onChange?: (value: string | number) => void;
}

const SelectWrapper = styled.div<{ $width?: number | string }>`
  position: relative;
  width: ${({ $width }) =>
    typeof $width === 'number' ? `${$width}px` : $width || '140px'};
`;

const SelectTrigger = styled.button<{ $isOpen: boolean; $disabled?: boolean }>`
  width: 100%;
  height: 32px;
  padding: 0 32px 0 12px;
  background: ${COLOR.WHITE};
  border: 1px solid ${({ $isOpen }) => ($isOpen ? COLOR.PRIMARY60 : COLOR.GRAY30)};
  border-radius: 4px;
  font-size: 14px;
  color: ${SEMANTIC.TEXT_NORMAL};
  text-align: left;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  transition: border-color 0.2s ease;
  display: flex;
  align-items: center;

  &:hover:not(:disabled) {
    border-color: ${COLOR.PRIMARY50};
  }

  &:focus {
    outline: none;
    border-color: ${COLOR.PRIMARY60};
  }
`;

const SelectValue = styled.span<{ $isPlaceholder: boolean }>`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ $isPlaceholder }) =>
    $isPlaceholder ? COLOR.GRAY50 : SEMANTIC.TEXT_NORMAL};
`;

const IconWrapper = styled.span<{ $isOpen: boolean }>`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%) ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0)')};
  transition: transform 0.2s ease;
  display: flex;
  align-items: center;
`;

const Dropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.GRAY30};
  border-radius: 4px;
  box-shadow: ${SHADOW.MEDIUM};
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
`;

const Option = styled.div<{ $isSelected: boolean }>`
  padding: 8px 12px;
  font-size: 14px;
  color: ${({ $isSelected }) =>
    $isSelected ? COLOR.PRIMARY60 : SEMANTIC.TEXT_NORMAL};
  background: ${({ $isSelected }) =>
    $isSelected ? COLOR.PRIMARY10 : 'transparent'};
  cursor: pointer;

  &:hover {
    background: ${({ $isSelected }) =>
      $isSelected ? COLOR.PRIMARY10 : COLOR.GRAY10};
  }
`;

export const AppSelect = ({
  value,
  options,
  placeholder = '선택',
  width,
  disabled,
  onChange,
}: AppSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string | number) => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <SelectWrapper ref={wrapperRef} $width={width}>
      <SelectTrigger
        type="button"
        $isOpen={isOpen}
        $disabled={disabled}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <SelectValue $isPlaceholder={!selectedOption}>
          {selectedOption?.label || placeholder}
        </SelectValue>
        <IconWrapper $isOpen={isOpen}>
          <AppIcon name="chevronDown" size={16} fillColor="ICON_WEAK" />
        </IconWrapper>
      </SelectTrigger>
      <Dropdown $isOpen={isOpen}>
        {options.map((option) => (
          <Option
            key={option.value}
            $isSelected={option.value === value}
            onClick={() => handleSelect(option.value)}
          >
            {option.label}
          </Option>
        ))}
      </Dropdown>
    </SelectWrapper>
  );
};

export default AppSelect;

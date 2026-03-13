'use client';

import styled from 'styled-components';
import { useEffect } from 'react';
import { COLOR, SEMANTIC, SHADOW } from '../tokens';
import AppIcon from './AppIcon';
import AppTypography from './AppTypography';
import AppIconButton from './AppIconButton';

interface AppModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number;
}

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(54, 54, 55, 0.5);
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div<{ $width: number }>`
  background: ${COLOR.WHITE};
  border-radius: 12px;
  box-shadow: ${SHADOW.LARGE};
  width: ${({ $width }) => $width}px;
  max-width: calc(100vw - 48px);
  max-height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid ${COLOR.GRAY20};
`;

const ModalBody = styled.div`
  padding: 20px;
  overflow-y: auto;
  flex: 1;
`;

export const AppModal = ({
  isOpen,
  onClose,
  title,
  children,
  width = 480,
}: AppModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Overlay $isOpen={isOpen} onClick={onClose}>
      <ModalContainer $width={width} onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <AppTypography variant="TITLE3_500" color="TEXT_STRONG">
            {title}
          </AppTypography>
          <AppIconButton icon="close" size="SMALL" onClick={onClose} />
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
      </ModalContainer>
    </Overlay>
  );
};

export default AppModal;

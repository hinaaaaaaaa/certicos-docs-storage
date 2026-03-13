'use client';

import styled from 'styled-components';
import { useEffect } from 'react';
import { COLOR, SHADOW } from '../tokens';
import AppTypography from './AppTypography';
import AppIconButton from './AppIconButton';

interface AppDrawerProps {
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
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  transition: opacity 0.3s ease, visibility 0.3s ease;
  z-index: 1000;
`;

const DrawerContainer = styled.div<{ $isOpen: boolean; $width: number }>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: ${({ $width }) => $width}px;
  max-width: 100vw;
  background: ${COLOR.WHITE};
  box-shadow: ${SHADOW.LARGE};
  transform: translateX(${({ $isOpen }) => ($isOpen ? '0' : '100%')});
  transition: transform 0.3s ease;
  z-index: 1001;
  display: flex;
  flex-direction: column;
`;

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid ${COLOR.GRAY20};
  flex-shrink: 0;
`;

const DrawerBody = styled.div`
  padding: 20px;
  overflow-y: auto;
  flex: 1;
`;

export const AppDrawer = ({
  isOpen,
  onClose,
  title,
  children,
  width = 400,
}: AppDrawerProps) => {
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

  return (
    <>
      <Overlay $isOpen={isOpen} onClick={onClose} />
      <DrawerContainer $isOpen={isOpen} $width={width}>
        <DrawerHeader>
          <AppTypography variant="TITLE3_500" color="TEXT_STRONG">
            {title}
          </AppTypography>
          <AppIconButton icon="close" size="SMALL" onClick={onClose} />
        </DrawerHeader>
        <DrawerBody>{children}</DrawerBody>
      </DrawerContainer>
    </>
  );
};

export default AppDrawer;

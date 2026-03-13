'use client';

import styled from 'styled-components';
import { COLOR, SEMANTIC } from '../tokens';
import AppIcon from './AppIcon';
import AppTypography from './AppTypography';

interface BreadcrumbItem {
  label: string;
  path?: string;
  onClick?: () => void;
}

interface AppBreadcrumbProps {
  items: BreadcrumbItem[];
}

const BreadcrumbContainer = styled.nav`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const BreadcrumbItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const BreadcrumbLink = styled.button<{ $isLast: boolean }>`
  background: none;
  border: none;
  padding: 4px;
  cursor: ${({ $isLast }) => ($isLast ? 'default' : 'pointer')};
  color: ${({ $isLast }) => ($isLast ? SEMANTIC.TEXT_NORMAL : SEMANTIC.TEXT_ASSISTIVE)};
  font-size: 14px;
  font-weight: ${({ $isLast }) => ($isLast ? 500 : 400)};
  line-height: 20px;
  transition: color 0.2s ease;

  &:hover:not(:disabled) {
    color: ${({ $isLast }) => ($isLast ? SEMANTIC.TEXT_NORMAL : SEMANTIC.TEXT_PRIMARY)};
  }
`;

export const AppBreadcrumb = ({ items }: AppBreadcrumbProps) => {
  return (
    <BreadcrumbContainer aria-label="Breadcrumb navigation">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <BreadcrumbItem key={item.label + index}>
            <BreadcrumbLink
              $isLast={isLast}
              onClick={item.onClick}
              disabled={isLast}
            >
              {item.label}
            </BreadcrumbLink>
            {!isLast && (
              <AppIcon name="chevronRight" size={16} fillColor="ICON_ASSISTIVE" />
            )}
          </BreadcrumbItem>
        );
      })}
    </BreadcrumbContainer>
  );
};

export default AppBreadcrumb;

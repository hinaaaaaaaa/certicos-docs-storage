'use client';

import styled from 'styled-components';
import { COLOR, SEMANTIC } from '../tokens';
import AppIcon from './AppIcon';

interface AppPaginationProps {
  total: number;
  perPage?: number;
  currentPage: number;
  onChangePage: (page: number) => void;
}

const PaginationWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

const PageButton = styled.button<{ $isActive?: boolean }>`
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid ${({ $isActive }) => ($isActive ? COLOR.PRIMARY60 : COLOR.GRAY30)};
  background: ${({ $isActive }) => ($isActive ? COLOR.PRIMARY60 : COLOR.WHITE)};
  color: ${({ $isActive }) => ($isActive ? COLOR.WHITE : SEMANTIC.TEXT_NORMAL)};
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: ${COLOR.PRIMARY60};
    color: ${({ $isActive }) => ($isActive ? COLOR.WHITE : COLOR.PRIMARY60)};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Ellipsis = styled.span`
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${SEMANTIC.TEXT_ASSISTIVE};
`;

export const AppPagination = ({
  total,
  perPage = 10,
  currentPage,
  onChangePage,
}: AppPaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (showEllipsisStart) {
        pages.push('ellipsis');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (showEllipsisEnd) {
        pages.push('ellipsis');
      }

      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <PaginationWrapper>
      <PageButton
        disabled={currentPage === 1}
        onClick={() => onChangePage(currentPage - 1)}
      >
        <AppIcon
          name="chevronLeft"
          size={16}
          fillColor={currentPage === 1 ? 'ICON_DISABLED' : 'ICON_NORMAL'}
        />
      </PageButton>

      {getPageNumbers().map((page, index) =>
        page === 'ellipsis' ? (
          <Ellipsis key={`ellipsis-${index}`}>...</Ellipsis>
        ) : (
          <PageButton
            key={page}
            $isActive={page === currentPage}
            onClick={() => onChangePage(page)}
          >
            {page}
          </PageButton>
        )
      )}

      <PageButton
        disabled={currentPage === totalPages}
        onClick={() => onChangePage(currentPage + 1)}
      >
        <AppIcon
          name="chevronRight"
          size={16}
          fillColor={currentPage === totalPages ? 'ICON_DISABLED' : 'ICON_NORMAL'}
        />
      </PageButton>
    </PaginationWrapper>
  );
};

export default AppPagination;

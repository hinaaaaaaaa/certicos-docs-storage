'use client';

import styled from 'styled-components';
import { COLOR, SEMANTIC } from '../tokens';

interface Column<T> {
  key: keyof T | string;
  title: string;
  width?: string;
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
}

interface AppTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: keyof T;
  onRowClick?: (record: T) => void;
}

const TableWrapper = styled.div`
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.GRAY30};
  border-radius: 8px;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Thead = styled.thead`
  background: ${COLOR.GRAY10};
`;

const Th = styled.th<{ $width?: string }>`
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 500;
  color: ${SEMANTIC.TEXT_ASSISTIVE};
  border-bottom: 1px solid ${COLOR.GRAY30};
  width: ${({ $width }) => $width || 'auto'};
`;

const Tbody = styled.tbody``;

const Tr = styled.tr<{ $clickable?: boolean }>`
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};

  &:hover {
    background: ${COLOR.GRAY10};
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${COLOR.GRAY20};
  }
`;

const Td = styled.td`
  padding: 12px 16px;
  font-size: 14px;
  color: ${SEMANTIC.TEXT_NORMAL};
`;

export function AppTable<T extends object>({
  columns,
  data,
  rowKey,
  onRowClick,
}: AppTableProps<T>) {
  return (
    <TableWrapper>
      <Table>
        <Thead>
          <tr>
            {columns.map((col) => (
              <Th key={String(col.key)} $width={col.width}>
                {col.title}
              </Th>
            ))}
          </tr>
        </Thead>
        <Tbody>
          {data.map((record, index) => (
            <Tr
              key={String(record[rowKey])}
              $clickable={!!onRowClick}
              onClick={() => onRowClick?.(record)}
            >
              {columns.map((col) => (
                <Td key={String(col.key)}>
                  {col.render
                    ? col.render(record[col.key as keyof T], record, index)
                    : String(record[col.key as keyof T] ?? '')}
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableWrapper>
  );
}

export default AppTable;

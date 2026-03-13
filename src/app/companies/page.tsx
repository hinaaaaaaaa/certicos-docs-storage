'use client';

import styled from 'styled-components';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  COLOR,
  SEMANTIC,
  AppTypography,
  AppTextButton,
  AppSelect,
  AppSearchInput,
  AppPagination,
  AppTable,
} from '@/design-system';

interface CompanyData {
  id: string;
  no: number;
  businessNumber: string;
  nameKo: string;
  nameEn: string;
  consultant: string;
  productCount: number;
}

const MOCK_COMPANIES: CompanyData[] = [
  { id: '1', no: 1, businessNumber: '123-45-67890', nameKo: '(주)화장품회사', nameEn: 'Cosmetics Co., Ltd.', consultant: '박컨설턴트', productCount: 12 },
  { id: '2', no: 2, businessNumber: '234-56-78901', nameKo: '(주)뷰티케어', nameEn: 'Beauty Care Inc.', consultant: '김컨설턴트', productCount: 8 },
  { id: '3', no: 3, businessNumber: '345-67-89012', nameKo: '(주)스킨랩', nameEn: 'Skin Lab Co.', consultant: '박컨설턴트', productCount: 15 },
  { id: '4', no: 4, businessNumber: '456-78-90123', nameKo: '(주)클린코스메틱', nameEn: 'Clean Cosmetic', consultant: '이컨설턴트', productCount: 6 },
  { id: '5', no: 5, businessNumber: '567-89-01234', nameKo: '(주)네이처뷰티', nameEn: 'Nature Beauty', consultant: '김컨설턴트', productCount: 20 },
];

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: ${COLOR.BLUEGRAY10};
`;

const Header = styled.header`
  background: ${COLOR.WHITE};
  border-bottom: 1px solid ${COLOR.GRAY30};
  padding: 16px 24px;
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Content = styled.main`
  padding: 24px;
`;

const TableWrapper = styled.div`
  margin-bottom: 24px;
`;

const CompanyLink = styled.button`
  color: ${COLOR.PRIMARY60};
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  text-align: left;

  &:hover {
    text-decoration: underline;
  }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 20px;
  padding: 0 6px;
  background: ${COLOR.PRIMARY10};
  color: ${COLOR.PRIMARY60};
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
`;

export default function CompaniesPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');

  const handleCompanyClick = (companyId: string) => {
    router.push(`/companies/${companyId}/files`);
  };

  const tableColumns = [
    { key: 'no', title: 'No.', width: '60px' },
    { key: 'businessNumber', title: '사업자등록번호', width: '140px' },
    {
      key: 'nameKo',
      title: '회사명(국문)',
      width: '200px',
      render: (_: unknown, record: CompanyData) => (
        <CompanyLink onClick={() => handleCompanyClick(record.id)}>
          {record.nameKo}
        </CompanyLink>
      ),
    },
    { key: 'nameEn', title: '회사명(영문)', width: '200px' },
    { key: 'consultant', title: '컨설턴트', width: '120px' },
    {
      key: 'productCount',
      title: '제품 개수',
      width: '100px',
      render: (_: unknown, record: CompanyData) => (
        <Badge>{record.productCount}</Badge>
      ),
    },
  ];

  return (
    <PageContainer>
      <Header>
        <HeaderTop>
          <AppTypography variant="TITLE1_600" color="TEXT_STRONG">
            회사 목록
          </AppTypography>
          <AppTextButton variant="PRIMARY" size="MEDIUM">
            + 비회원 회사 생성
          </AppTextButton>
        </HeaderTop>

        <FilterRow>
          <AppSelect
            placeholder="컨설턴트 전체"
            width={160}
            options={[
              { value: 'all', label: '컨설턴트 전체' },
              { value: '1', label: '박컨설턴트' },
              { value: '2', label: '김컨설턴트' },
              { value: '3', label: '이컨설턴트' },
            ]}
          />
          <AppSelect
            placeholder="제품 등록 여부"
            width={160}
            options={[
              { value: 'all', label: '전체' },
              { value: 'has', label: '제품 있음' },
              { value: 'none', label: '제품 없음' },
            ]}
          />
          <AppSearchInput
            value={searchValue}
            onChange={setSearchValue}
            placeholder="회사명, 사업자번호 검색..."
            width={280}
          />
        </FilterRow>
      </Header>

      <Content>
        <TableWrapper>
          <AppTable columns={tableColumns} data={MOCK_COMPANIES} rowKey="id" />
        </TableWrapper>

        <AppPagination
          total={50}
          perPage={10}
          currentPage={currentPage}
          onChangePage={setCurrentPage}
        />
      </Content>
    </PageContainer>
  );
}

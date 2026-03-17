'use client';

import React from 'react';
import styled from 'styled-components';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  COLOR,
  AppTypography,
  AppTextButton,
  AppSelect,
  AppPagination,
  AppTable,
  AppIcon,
} from '@/design-system';

interface CompanyData {
  id: string;
  no: number;
  businessNumber: string;
  nameKo: string;
  nameEn: string;
  consultant: string;
  productCount: number;
  registeredDate: string;
  tags: string[];
}

interface Notification {
  id: string;
  type: 'upload' | 'share' | 'storage' | 'extract' | 'info';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

const MOCK_COMPANIES: CompanyData[] = [
  { id: '1', no: 1, businessNumber: '123-45-67890', nameKo: '(주)화장품회사', nameEn: 'Cosmetics Co., Ltd.', consultant: '박컨설턴트', productCount: 12, registeredDate: '2025-01-15', tags: ['화장품', 'OEM'] },
  { id: '2', no: 2, businessNumber: '234-56-78901', nameKo: '(주)뷰티케어', nameEn: 'Beauty Care Inc.', consultant: '김컨설턴트', productCount: 8, registeredDate: '2025-02-20', tags: ['스킨케어'] },
  { id: '3', no: 3, businessNumber: '345-67-89012', nameKo: '(주)스킨랩', nameEn: 'Skin Lab Co.', consultant: '박컨설턴트', productCount: 15, registeredDate: '2024-11-10', tags: ['화장품', '기능성'] },
  { id: '4', no: 4, businessNumber: '456-78-90123', nameKo: '(주)클린코스메틱', nameEn: 'Clean Cosmetic', consultant: '이컨설턴트', productCount: 6, registeredDate: '2025-03-01', tags: ['클린뷰티'] },
  { id: '5', no: 5, businessNumber: '567-89-01234', nameKo: '(주)네이처뷰티', nameEn: 'Nature Beauty', consultant: '김컨설턴트', productCount: 20, registeredDate: '2024-12-05', tags: ['자연유래', '비건'] },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'storage', title: '저장 공간 부족 경고', message: '사용 가능한 저장 공간이 15% 남았습니다.', time: '5분 전', isRead: false },
  { id: 'n2', type: 'share', title: '폴더 공유됨', message: '김외부님에게 PIF 폴더가 공유되었습니다.', time: '1시간 전', isRead: false },
  { id: 'n3', type: 'upload', title: '업로드 완료', message: 'PIF_제품A_v2.pdf 파일이 업로드되었습니다.', time: '2시간 전', isRead: true },
];

const CONSULTANTS = [
  { value: 'all', label: '컨설턴트 전체' },
  { value: '박컨설턴트', label: '박컨설턴트' },
  { value: '김컨설턴트', label: '김컨설턴트' },
  { value: '이컨설턴트', label: '이컨설턴트' },
];

const PRODUCT_STATUS = [
  { value: 'all', label: '제품 등록 전체' },
  { value: 'has', label: '제품 있음' },
  { value: 'none', label: '제품 없음' },
];

const AVAILABLE_TAGS = ['화장품', 'OEM', '스킨케어', '기능성', '클린뷰티', '자연유래', '비건'];

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

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const FilterPanel = styled.div`
  background: ${COLOR.WHITE};
  border-bottom: 1px solid ${COLOR.GRAY30};
  padding: 16px 24px;
`;

const FilterSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterLabel = styled.span`
  font-size: 13px;
  color: ${COLOR.GRAY70};
  white-space: nowrap;
`;

const TagList = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const Tag = styled.button<{ $active?: boolean }>`
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  border: 1px solid ${({ $active }) => ($active ? COLOR.PRIMARY60 : COLOR.GRAY30)};
  background: ${({ $active }) => ($active ? COLOR.PRIMARY10 : COLOR.WHITE)};
  color: ${({ $active }) => ($active ? COLOR.PRIMARY60 : COLOR.GRAY70)};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${COLOR.PRIMARY60};
  }
`;

const DateInput = styled.input`
  padding: 6px 10px;
  border: 1px solid ${COLOR.GRAY30};
  border-radius: 4px;
  font-size: 13px;
  color: ${COLOR.GRAY90};
  background: ${COLOR.WHITE};
  width: 140px;

  &:focus {
    outline: none;
    border-color: ${COLOR.PRIMARY60};
  }
`;

const DateRangeWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterToggle = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: ${({ $active }) => ($active ? COLOR.PRIMARY10 : COLOR.WHITE)};
  border: 1px solid ${({ $active }) => ($active ? COLOR.PRIMARY60 : COLOR.GRAY30)};
  border-radius: 6px;
  color: ${({ $active }) => ($active ? COLOR.PRIMARY60 : COLOR.GRAY70)};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${COLOR.PRIMARY60};
  }
`;

const ActiveFilterBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: ${COLOR.PRIMARY10};
  color: ${COLOR.PRIMARY60};
  border-radius: 4px;
  font-size: 12px;
`;

const ClearFilterButton = styled.button`
  padding: 4px 8px;
  background: none;
  border: none;
  color: ${COLOR.GRAY60};
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;

  &:hover {
    color: ${COLOR.PRIMARY60};
  }
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

const HighlightedText = styled.span`
  background: #FFF9E6;
  padding: 0 2px;
  border-radius: 2px;
`;

const ResultInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

// 자동완성 검색
const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 320px;
`;

const MainSearchInput = styled.input`
  width: 100%;
  padding: 10px 40px 10px 14px;
  border: 1px solid ${COLOR.GRAY30};
  border-radius: 8px;
  font-size: 14px;
  color: ${COLOR.GRAY90};
  background: ${COLOR.WHITE};

  &::placeholder {
    color: ${COLOR.GRAY50};
  }

  &:focus {
    outline: none;
    border-color: ${COLOR.PRIMARY60};
    box-shadow: 0 0 0 3px ${COLOR.PRIMARY10};
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
`;

const AutocompleteDropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.GRAY30};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 280px;
  overflow-y: auto;
  z-index: 100;
  display: ${({ $isOpen }) => $isOpen ? 'block' : 'none'};
`;

const AutocompleteItem = styled.div<{ $selected?: boolean }>`
  padding: 10px 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${({ $selected }) => $selected ? COLOR.PRIMARY10 : 'transparent'};

  &:hover {
    background: ${COLOR.GRAY10};
  }
`;

const AutocompleteInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const AutocompleteCompanyName = styled.div`
  font-size: 13px;
  color: ${COLOR.GRAY90};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AutocompleteMeta = styled.div`
  font-size: 11px;
  color: ${COLOR.GRAY60};
  margin-top: 2px;
`;

const NoResultsText = styled.div`
  padding: 16px;
  text-align: center;
  color: ${COLOR.GRAY60};
  font-size: 13px;
`;

// 알림
const NotificationWrapper = styled.div`
  position: relative;
`;

const NotificationBell = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.GRAY30};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${COLOR.PRIMARY60};
    background: ${COLOR.PRIMARY10};
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: ${COLOR.RED60};
  color: ${COLOR.WHITE};
  border-radius: 9px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NotificationPanel = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 380px;
  max-height: 480px;
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.GRAY30};
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  flex-direction: column;
  overflow: hidden;
`;

const NotificationHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid ${COLOR.GRAY20};
`;

const NotificationList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const NotificationItem = styled.div<{ $isRead?: boolean }>`
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  background: ${({ $isRead }) => ($isRead ? COLOR.WHITE : COLOR.PRIMARY10)};
  border-bottom: 1px solid ${COLOR.GRAY20};
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: ${({ $isRead }) => ($isRead ? COLOR.GRAY10 : COLOR.PRIMARY20)};
  }
`;

const NotificationIcon = styled.div<{ $type: string }>`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${({ $type }) => {
    switch ($type) {
      case 'upload': return COLOR.GREEN50 + '20';
      case 'share': return COLOR.PRIMARY10;
      case 'storage': return COLOR.RED60 + '20';
      case 'extract': return COLOR.BLUE60 + '20';
      default: return COLOR.GRAY20;
    }
  }};
`;

const NotificationContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const NotificationTitle = styled.div<{ $isRead?: boolean }>`
  font-size: 14px;
  font-weight: ${({ $isRead }) => ($isRead ? 400 : 500)};
  color: ${COLOR.GRAY90};
  margin-bottom: 4px;
`;

const NotificationMessage = styled.div`
  font-size: 13px;
  color: ${COLOR.GRAY70};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NotificationTime = styled.div`
  font-size: 11px;
  color: ${COLOR.GRAY50};
  margin-top: 4px;
`;

const NotificationFooter = styled.div`
  padding: 12px 16px;
  border-top: 1px solid ${COLOR.GRAY20};
  text-align: center;
`;

const MarkAllReadBtn = styled.button`
  background: none;
  border: none;
  color: ${COLOR.PRIMARY60};
  font-size: 13px;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const EmptyNotification = styled.div`
  padding: 40px 20px;
  text-align: center;
`;

// 휴지통
const TrashToggle = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: ${({ $active }) => ($active ? COLOR.RED60 : COLOR.WHITE)};
  border: 1px solid ${({ $active }) => ($active ? COLOR.RED60 : COLOR.GRAY30)};
  border-radius: 6px;
  color: ${({ $active }) => ($active ? COLOR.WHITE : COLOR.GRAY70)};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${COLOR.RED60};
    color: ${({ $active }) => ($active ? COLOR.WHITE : COLOR.RED60)};
  }
`;

const TrashBadge = styled.span`
  padding: 2px 6px;
  background: ${COLOR.WHITE};
  color: ${COLOR.RED60};
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
`;

export default function CompaniesPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [consultantFilter, setConsultantFilter] = useState('all');
  const [productStatusFilter, setProductStatusFilter] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 자동완성
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const [autocompleteIndex, setAutocompleteIndex] = useState(-1);

  // 알림
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // 휴지통 (전체 파일 수)
  const [trashedFilesCount] = useState(3);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleCompanyClick = (companyId: string) => {
    router.push(`/companies/${companyId}/files`);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleClearFilters = () => {
    setConsultantFilter('all');
    setProductStatusFilter('all');
    setSelectedTags([]);
    setDateFrom('');
    setDateTo('');
    setSearchValue('');
  };

  // 자동완성 결과
  const autocompleteResults = searchValue.trim()
    ? MOCK_COMPANIES.filter((c) =>
        c.nameKo.toLowerCase().includes(searchValue.toLowerCase()) ||
        c.nameEn.toLowerCase().includes(searchValue.toLowerCase()) ||
        c.businessNumber.includes(searchValue)
      ).slice(0, 6)
    : [];

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (!isAutocompleteOpen || autocompleteResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setAutocompleteIndex((prev) => Math.min(prev + 1, autocompleteResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setAutocompleteIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && autocompleteIndex >= 0) {
      e.preventDefault();
      handleCompanyClick(autocompleteResults[autocompleteIndex].id);
    } else if (e.key === 'Escape') {
      setIsAutocompleteOpen(false);
      setAutocompleteIndex(-1);
    }
  };

  const handleReadNotification = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // 검색어 하이라이팅
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <HighlightedText key={i}>{part}</HighlightedText> : part
    );
  };

  // 회사 필터링
  const filteredCompanies = MOCK_COMPANIES.filter((company) => {
    // 검색어 필터 (회사명, 사업자번호)
    if (searchValue) {
      const query = searchValue.toLowerCase();
      const matchesName = company.nameKo.toLowerCase().includes(query) ||
                          company.nameEn.toLowerCase().includes(query);
      const matchesBizNum = company.businessNumber.includes(query);
      if (!matchesName && !matchesBizNum) return false;
    }
    // 컨설턴트 필터
    if (consultantFilter !== 'all' && company.consultant !== consultantFilter) {
      return false;
    }
    // 제품 등록 상태 필터
    if (productStatusFilter === 'has' && company.productCount === 0) return false;
    if (productStatusFilter === 'none' && company.productCount > 0) return false;
    // 태그 필터
    if (selectedTags.length > 0) {
      const hasMatchingTag = selectedTags.some((tag) => company.tags.includes(tag));
      if (!hasMatchingTag) return false;
    }
    // 날짜 범위 필터
    if (dateFrom && company.registeredDate < dateFrom) return false;
    if (dateTo && company.registeredDate > dateTo) return false;

    return true;
  });

  const activeFilterCount =
    (consultantFilter !== 'all' ? 1 : 0) +
    (productStatusFilter !== 'all' ? 1 : 0) +
    selectedTags.length +
    (dateFrom || dateTo ? 1 : 0);

  const tableColumns: Array<{
    key: string;
    title: string;
    width?: string;
    render?: (value: unknown, record: CompanyData, index: number) => React.ReactNode;
  }> = [
    { key: 'no', title: 'No.', width: '60px' },
    { key: 'businessNumber', title: '사업자등록번호', width: '140px',
      render: (_: unknown, record: CompanyData) => highlightText(record.businessNumber, searchValue)
    },
    {
      key: 'nameKo',
      title: '회사명(국문)',
      width: '200px',
      render: (_: unknown, record: CompanyData) => (
        <CompanyLink onClick={() => handleCompanyClick(record.id)}>
          {highlightText(record.nameKo, searchValue)}
        </CompanyLink>
      ),
    },
    { key: 'nameEn', title: '회사명(영문)', width: '200px',
      render: (_: unknown, record: CompanyData) => highlightText(record.nameEn, searchValue)
    },
    { key: 'consultant', title: '컨설턴트', width: '100px' },
    { key: 'registeredDate', title: '등록일', width: '120px' },
    {
      key: 'productCount',
      title: '제품',
      width: '80px',
      render: (_: unknown, record: CompanyData) => (
        <Badge>{record.productCount}</Badge>
      ),
    },
  ];

  return (
    <PageContainer onClick={() => { setIsNotificationOpen(false); setIsAutocompleteOpen(false); }}>
      <Header>
        <HeaderTop>
          <AppTypography variant="TITLE1_600" color="TEXT_STRONG">
            회사 목록
          </AppTypography>
          <HeaderActions>
            <NotificationWrapper onClick={(e) => e.stopPropagation()}>
              <NotificationBell onClick={() => setIsNotificationOpen(!isNotificationOpen)}>
                <AppIcon name="bell" size={18} fillColor="ICON_NEUTRAL" />
                {unreadCount > 0 && <NotificationBadge>{unreadCount}</NotificationBadge>}
              </NotificationBell>

              <NotificationPanel $isOpen={isNotificationOpen}>
                <NotificationHeader>
                  <AppTypography variant="BODY1_500" color="TEXT_STRONG">알림</AppTypography>
                  {unreadCount > 0 && <MarkAllReadBtn onClick={handleMarkAllRead}>모두 읽음 처리</MarkAllReadBtn>}
                </NotificationHeader>
                <NotificationList>
                  {notifications.length === 0 ? (
                    <EmptyNotification>
                      <AppIcon name="bell" size={32} fillColor="ICON_ASSISTIVE" />
                      <div style={{ marginTop: 12 }}><AppTypography variant="BODY2_400" color="TEXT_ASSISTIVE">알림이 없습니다</AppTypography></div>
                    </EmptyNotification>
                  ) : (
                    notifications.map((notification) => (
                      <NotificationItem key={notification.id} $isRead={notification.isRead} onClick={() => handleReadNotification(notification.id)}>
                        <NotificationIcon $type={notification.type}>
                          <AppIcon
                            name={notification.type === 'upload' ? 'upload' : notification.type === 'share' ? 'share' : notification.type === 'storage' ? 'warning' : notification.type === 'extract' ? 'extract' : 'bell'}
                            size={18}
                            fillColor={notification.type === 'upload' ? 'STATE_SUCCESS' : notification.type === 'share' ? 'ICON_PRIMARY' : notification.type === 'storage' ? 'STATE_ERROR' : notification.type === 'extract' ? 'STATE_INFO' : 'ICON_NEUTRAL'}
                          />
                        </NotificationIcon>
                        <NotificationContent>
                          <NotificationTitle $isRead={notification.isRead}>{notification.title}</NotificationTitle>
                          <NotificationMessage>{notification.message}</NotificationMessage>
                          <NotificationTime>{notification.time}</NotificationTime>
                        </NotificationContent>
                      </NotificationItem>
                    ))
                  )}
                </NotificationList>
                {notifications.length > 0 && (
                  <NotificationFooter><MarkAllReadBtn onClick={() => setNotifications([])}>모든 알림 삭제</MarkAllReadBtn></NotificationFooter>
                )}
              </NotificationPanel>
            </NotificationWrapper>

            <TrashToggle onClick={() => router.push('/companies/1/files?trash=true')}>
              <AppIcon name="trash" size={14} fillColor="ICON_ASSISTIVE" />
              휴지통
              {trashedFilesCount > 0 && <TrashBadge>{trashedFilesCount}</TrashBadge>}
            </TrashToggle>

            <AppTextButton variant="PRIMARY" size="MEDIUM">
              + 비회원 회사 생성
            </AppTextButton>
          </HeaderActions>
        </HeaderTop>

        <FilterRow>
          <AppSelect
            placeholder="컨설턴트 전체"
            width={150}
            value={consultantFilter}
            onChange={(value) => setConsultantFilter(String(value))}
            options={CONSULTANTS}
          />
          <AppSelect
            placeholder="제품 등록 전체"
            width={150}
            value={productStatusFilter}
            onChange={(value) => setProductStatusFilter(String(value))}
            options={PRODUCT_STATUS}
          />

          {/* 자동완성 검색 */}
          <SearchContainer onClick={(e) => e.stopPropagation()}>
            <MainSearchInput
              type="text"
              placeholder="회사명, 사업자번호 검색..."
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setIsAutocompleteOpen(e.target.value.length > 0);
                setAutocompleteIndex(-1);
              }}
              onFocus={() => searchValue && setIsAutocompleteOpen(true)}
              onBlur={() => setTimeout(() => setIsAutocompleteOpen(false), 200)}
              onKeyDown={handleSearchKeyDown}
            />
            <SearchIconWrapper>
              <AppIcon name="search" size={18} fillColor="ICON_ASSISTIVE" />
            </SearchIconWrapper>
            <AutocompleteDropdown $isOpen={isAutocompleteOpen && searchValue.length > 0}>
              {autocompleteResults.length > 0 ? (
                autocompleteResults.map((company, index) => (
                  <AutocompleteItem
                    key={company.id}
                    $selected={index === autocompleteIndex}
                    onMouseDown={() => handleCompanyClick(company.id)}
                  >
                    <AutocompleteInfo>
                      <AutocompleteCompanyName>{highlightText(company.nameKo, searchValue)}</AutocompleteCompanyName>
                      <AutocompleteMeta>{company.businessNumber} · {company.consultant}</AutocompleteMeta>
                    </AutocompleteInfo>
                    <Badge>{company.productCount}</Badge>
                  </AutocompleteItem>
                ))
              ) : (
                <NoResultsText>검색 결과가 없습니다</NoResultsText>
              )}
            </AutocompleteDropdown>
          </SearchContainer>

          <FilterToggle
            $active={isFilterOpen}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <AppIcon name="filter" size={16} fillColor={isFilterOpen ? 'ICON_PRIMARY' : 'ICON_ASSISTIVE'} />
            고급 필터
            {activeFilterCount > 0 && (
              <ActiveFilterBadge style={{ marginLeft: 4, padding: '2px 6px' }}>
                {activeFilterCount}
              </ActiveFilterBadge>
            )}
          </FilterToggle>
        </FilterRow>
      </Header>

      {isFilterOpen && (
        <FilterPanel>
          <FilterRow>
            <FilterSection>
              <FilterLabel>등록 날짜</FilterLabel>
              <DateRangeWrapper>
                <DateInput
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
                <AppTypography variant="SMALL_400" color="TEXT_ASSISTIVE">~</AppTypography>
                <DateInput
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </DateRangeWrapper>
            </FilterSection>

            <FilterSection>
              <FilterLabel>태그</FilterLabel>
              <TagList>
                {AVAILABLE_TAGS.map((tag) => (
                  <Tag
                    key={tag}
                    $active={selectedTags.includes(tag)}
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </Tag>
                ))}
              </TagList>
            </FilterSection>

            {(activeFilterCount > 0 || searchValue) && (
              <ClearFilterButton onClick={handleClearFilters}>
                <AppIcon name="close" size={12} fillColor="ICON_ASSISTIVE" />
                필터 초기화
              </ClearFilterButton>
            )}
          </FilterRow>
        </FilterPanel>
      )}

      <Content>
        <ResultInfo>
          <AppTypography variant="BODY2_400" color="TEXT_ASSISTIVE">
            총 {filteredCompanies.length}개 회사
            {filteredCompanies.length !== MOCK_COMPANIES.length && ` (전체 ${MOCK_COMPANIES.length}개)`}
          </AppTypography>
        </ResultInfo>

        <TableWrapper>
          <AppTable<CompanyData> columns={tableColumns} data={filteredCompanies} rowKey="id" />
        </TableWrapper>

        <AppPagination
          total={filteredCompanies.length}
          perPage={10}
          currentPage={currentPage}
          onChangePage={setCurrentPage}
        />
      </Content>
    </PageContainer>
  );
}

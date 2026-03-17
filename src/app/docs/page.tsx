'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import {
  COLOR,
  AppTypography,
  AppIcon,
  AppTextButton,
  AppIconButton,
  AppSelect,
  AppSearchInput,
  AppBreadcrumb,
  AppPagination,
  AppTable,
  AppModal,
} from '@/design-system';

// ===== Types =====
interface Company {
  id: string;
  no: number;
  businessNumber: string;
  nameKo: string;
  nameEn: string;
  consultant: string;
  documentManager: string;
  qualityManager: string;
  productCount: number;
}

interface FileData {
  id: string;
  name: string;
  size: string;
  date: string;
  uploader: string;
  type: 'folder' | 'pdf' | 'xlsx' | 'jpg' | 'png';
  extractStatus?: 'completed' | 'failed' | 'none' | 'extracting';
  extractData?: {
    productName?: string;
    customer?: string;
    amount?: string;
    date?: string;
    consultant?: string;
  };
  originalPath?: string;
  deletedAt?: string;
  expiresAt?: string;
}

interface Notification {
  id: string;
  type: 'upload' | 'share' | 'storage' | 'extract' | 'fail';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

interface FolderPermission {
  teamName: string;
  canUpload: boolean;
  canRead: boolean;
  canDownload: boolean;
  canDelete: boolean;
}

// ===== Mock Data =====
const MOCK_COMPANIES: Company[] = [
  { id: '1', no: 517, businessNumber: '488-14-20240', nameKo: '주식사오엠에스인터내서날', nameEn: 'OMS International Co.,Ltd.', consultant: '김종화', documentManager: '어명수', qualityManager: '이품질', productCount: 1 },
  { id: '2', no: 1057, businessNumber: '120-24-10002', nameKo: '주식회사 씨에이치코스메틱', nameEn: 'CH Cosmetics Co., Ltd.', consultant: '이정우', documentManager: '독고정히나', qualityManager: '정품질', productCount: 2 },
  { id: '3', no: 524, businessNumber: '100-12-40001', nameKo: '대한피부과학연구소', nameEn: 'korea dermatology', consultant: '김풍주', documentManager: '박서류', qualityManager: '조품질', productCount: 5 },
  { id: '4', no: 1023, businessNumber: '597-44-50003', nameKo: '주식회사트리즈커머스', nameEn: 'TRIZ COMMERCE CO., LTD.', consultant: '이정우', documentManager: '이정우', qualityManager: '강품질', productCount: 2 },
  { id: '5', no: 1589, businessNumber: '154-23-44444', nameKo: '옴니버스센트럴주식회사', nameEn: 'OMNIVERSE CENTRAL CO., LTD', consultant: '신지영', documentManager: '신지영', qualityManager: '송품질', productCount: 3 },
  { id: '6', no: 1221, businessNumber: '455-54-44425', nameKo: '(주)바리엔유', nameEn: 'BARINU.CO.,LTD', consultant: '김종화', documentManager: '손석호, 김윤경', qualityManager: '이품질', productCount: 1 },
  { id: '7', no: 1123, businessNumber: '459-56-54285', nameKo: '폴리메놀랙토리(주)', nameEn: 'Polyphenol Factory', consultant: '신지영', documentManager: '신지영', qualityManager: '정품질', productCount: 2 },
  { id: '8', no: 1100, businessNumber: '552-15-11555', nameKo: '태남생활건강(주)', nameEn: 'Taenam Household & Health Care Co., Ltd.', consultant: '김종화', documentManager: '김종화', qualityManager: '조품질', productCount: 0 },
  { id: '9', no: 1558, businessNumber: '125-45-14588', nameKo: '리에스피엔 주식회사 (Re. SPN Inc.)', nameEn: 'CH Cosmetics Co., Ltd.', consultant: '이정우', documentManager: '이정우', qualityManager: '강품질', productCount: 2 },
  { id: '10', no: 952, businessNumber: '125-11-12652', nameKo: '(주)한국생명과학연구소', nameEn: 'KOREA RESERCH INSTITUTE OF BIO SCIENCE CO., LTD', consultant: '신지영', documentManager: '신지영', qualityManager: '송품질', productCount: 0 },
];

// 알러젠 데이터 타입
interface AllergenData {
  fragranceName: string;
  vendor: string;
  allergenType: string;
  allergenList: Record<string, string>;
}

const MOCK_FILES: FileData[] = [
  { id: 'f1', name: '견적서/의뢰서', size: '—', date: '2026.03.10', uploader: '', type: 'folder' },
  { id: 'f2', name: 'PIF', size: '—', date: '2026.03.08', uploader: '', type: 'folder' },
  { id: '1', name: '제품B_견적서_v2.pdf', size: '2.4 MB', date: '2026.03.14', uploader: '김민준', type: 'pdf', extractStatus: 'completed', extractData: { productName: '제품B (ProductB-2000)', customer: '삼성메디칼', amount: '₩ 12,500,000', date: '2026-03-14', consultant: '김민준' } },
  { id: '2', name: '의뢰서_삼성메디칼.xlsx', size: '512 KB', date: '2026.03.11', uploader: '이매니저', type: 'xlsx', extractStatus: 'failed' },
  { id: '3', name: '제품사진_001.jpg', size: '8.1 MB', date: '2026.03.09', uploader: '박컨설턴트', type: 'jpg', extractStatus: 'none' },
  { id: '4', name: '해외인허가_등록증.pdf', size: '1.2 MB', date: '2026.03.07', uploader: '김담당', type: 'pdf', extractStatus: 'none' },
  { id: '5', name: 'ALLERGEN_ORANGE_OIL.pdf', size: '890 KB', date: '2026.03.15', uploader: '김담당', type: 'pdf', extractStatus: 'completed', extractData: { productName: 'ORANGE OIL(GC)', customer: '㈜한빛향료', amount: '', date: '2024-07-22', consultant: '' } },
];

// 알러젠 추출 데이터
const ALLERGEN_EXTRACT_DATA: AllergenData = {
  fragranceName: 'ORANGE OIL(GC)',
  vendor: '㈜한빛향료',
  allergenType: '81',
  allergenList: {
    'LIMONENE': '95.311',
    'LINALOOL': '0.434',
    'PINENE': '0.523',
    'ALPHA-TERPINENE': '0.095',
    'CARVONE': '0.044',
    'CITRAL': '0.037',
    'VANILLIN': '0.018',
    'BETA-CARYOPHYLLENE': '0.016',
    'CITRONELLOL': '0.012',
    'TERPINOLENE': '0.010',
    'GERANIOL': '0.006',
    'BENZYL BENZOATE': '0.003',
  }
};

const MOCK_TRASH: FileData[] = [
  { id: 't1', name: '구견적서_v1.pdf', size: '2.4 MB', date: '2026.03.10', uploader: '김담당', type: 'pdf', originalPath: '삼성메디칼 › 25년 1차 › 제품B', deletedAt: '2026.03.10', expiresAt: '2026.04.09 (30일 후)' },
  { id: 't2', name: '임시이미지.png', size: '1.1 MB', date: '2026.03.05', uploader: '이매니저', type: 'png', originalPath: '삼성메디칼 › 기타', deletedAt: '2026.03.05', expiresAt: '2026.04.04 (19일 후)' },
  { id: 't3', name: '오래된_의뢰서.xlsx', size: '890 KB', date: '2026.02.20', uploader: '박컨설턴트', type: 'xlsx', originalPath: '현대바이오 › 24년 2차', deletedAt: '2026.02.20', expiresAt: '2026.03.21 (5일 후)' },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'fail', title: '추출 실패', message: '의뢰서_삼성메디칼.xlsx 파일의 Certicos 추출에 실패했습니다.', time: '방금 전', isRead: false },
  { id: 'n2', type: 'share', title: '공유 알림', message: '박서준님이 제품B_견적서_v2.pdf를 공유했습니다.', time: '10분 전', isRead: false },
  { id: 'n3', type: 'storage', title: '저장 공간 경고', message: '저장 공간이 85% 사용 중입니다. (8.5TB / 10TB)', time: '1시간 전', isRead: false },
  { id: 'n4', type: 'upload', title: '업로드 완료', message: '제품B_견적서_v2.pdf 외 2개 파일이 업로드되었습니다.', time: '어제 오후 3:24', isRead: true },
];

const FOLDER_PERMISSIONS: FolderPermission[] = [
  { teamName: '관리 담당자', canUpload: true, canRead: true, canDownload: true, canDelete: true },
  { teamName: '관리 팀장', canUpload: true, canRead: true, canDownload: true, canDelete: true },
  { teamName: '컨설팅팀', canUpload: true, canRead: true, canDownload: true, canDelete: false },
  { teamName: '영업지원팀', canUpload: true, canRead: true, canDownload: true, canDelete: false },
  { teamName: 'RA팀 (1·2·3)', canUpload: false, canRead: true, canDownload: true, canDelete: false },
  { teamName: '데이터팀', canUpload: false, canRead: true, canDownload: true, canDelete: false },
  { teamName: 'QCQA팀', canUpload: false, canRead: true, canDownload: true, canDelete: false },
];

const CONSULTANTS = [
  { value: 'all', label: '컨설턴트 전체' },
  { value: '김종화', label: '김종화' },
  { value: '이정우', label: '이정우' },
  { value: '신지영', label: '신지영' },
  { value: '김풍주', label: '김풍주' },
];

const FILE_TYPE_OPTIONS = [
  { value: 'all', label: '파일 타입 전체' },
  { value: 'pdf', label: 'PDF' },
  { value: 'xlsx', label: 'Excel' },
  { value: 'jpg', label: '이미지' },
];

const FILE_SIZE_OPTIONS = [
  { value: 'all', label: '파일 크기 전체' },
  { value: 'small', label: '1MB 이하' },
  { value: 'medium', label: '1MB ~ 10MB' },
  { value: 'large', label: '10MB 이상' },
];

const UPLOADER_OPTIONS = [
  { value: 'all', label: '업로더 전체' },
  { value: '김담당', label: '김담당' },
  { value: '이매니저', label: '이매니저' },
  { value: '박컨설턴트', label: '박컨설턴트' },
];


// ===== Styled Components =====

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${COLOR.BLUEGRAY10};
`;

// ---- 공통 페이지 영역 ----
const PageWrapper = styled.div`
  padding: 24px 28px;
`;

const PageHeader = styled.div`
  margin-bottom: 20px;
`;

const PageTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const PageTitle = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: ${COLOR.GRAY100};
  line-height: 1.4;
  margin: 0;
`;

// ---- 필터/검색 바 ----
const FilterBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
`;

const FilterLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

// ---- 테이블 카드 ----
const TableCard = styled.div`
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.GRAY30};
  border-radius: 8px;
  overflow: hidden;
`;

// ---- 회사명 링크 ----
const CompanyLink = styled.button`
  color: ${COLOR.GRAY90};
  font-weight: 400;
  font-size: 13px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  text-align: left;
  line-height: 1.4;

  &:hover {
    color: ${COLOR.PRIMARY60};
    text-decoration: underline;
  }
`;

// ---- 인증건수 (빨강/일반) ----
const CertCount = styled.span<{ $hasIncomplete?: boolean }>`
  font-size: 13px;
  color: ${({ $hasIncomplete }) => ($hasIncomplete ? COLOR.RED60 : COLOR.GRAY80)};
  font-weight: ${({ $hasIncomplete }) => ($hasIncomplete ? 500 : 400)};
`;

const CertTotal = styled.span`
  font-size: 13px;
  color: ${COLOR.GRAY70};
`;

// ---- 상태 배지 ----
const StatusBadge = styled.span<{ $variant: 'incomplete' | 'complete' | 'optional' }>`
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;

  ${({ $variant }) => {
    switch ($variant) {
      case 'incomplete':
        return `background: #FFF0F0; color: #E53935;`;
      case 'complete':
        return `background: ${COLOR.GRAY20}; color: ${COLOR.GRAY80};`;
      case 'optional':
        return `background: ${COLOR.GRAY10}; color: ${COLOR.GRAY70};`;
    }
  }}
`;

// ---- 이동 버튼 ----
const MoveButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 5px 12px;
  border: 1px solid ${COLOR.GRAY30};
  border-radius: 6px;
  background: ${COLOR.WHITE};
  font-size: 12px;
  font-weight: 500;
  color: ${COLOR.GRAY80};
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    border-color: ${COLOR.PRIMARY60};
    color: ${COLOR.PRIMARY60};
  }
`;

// ---- 페이지네이션 개선 ----
const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px 0 8px;
`;

// ---- 알림 관련 ----
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

  ${({ $type }) => {
    switch ($type) {
      case 'upload':
        return `background: #e6f4ea;`;
      case 'share':
        return `background: ${COLOR.PRIMARY10};`;
      case 'storage':
      case 'fail':
        return `background: #fce8e6;`;
      default:
        return `background: ${COLOR.GRAY20};`;
    }
  }}
`;

// ---- 파일뷰 레이아웃 ----
const FileLayout = styled.div`
  display: flex;
  height: calc(100vh - 140px);
  background: ${COLOR.WHITE};
  border-radius: 8px;
  border: 1px solid ${COLOR.GRAY30};
  overflow: hidden;
`;

const Sidebar = styled.div`
  width: 240px;
  flex-shrink: 0;
  background: ${COLOR.WHITE};
  border-right: 1px solid ${COLOR.GRAY30};
  overflow-y: auto;
  padding: 16px 0;
`;

const SidebarSection = styled.div`
  padding: 0 16px;
  margin-bottom: 16px;
`;

const SidebarTitle = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: ${COLOR.GRAY60};
  letter-spacing: 0.05em;
  padding: 8px 16px;
  text-transform: uppercase;
`;

const NavItem = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 16px;
  font-size: 13px;
  color: ${({ $active }) => $active ? COLOR.PRIMARY60 : COLOR.GRAY80};
  background: ${({ $active }) => $active ? COLOR.PRIMARY10 : 'transparent'};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  font-weight: ${({ $active }) => $active ? 500 : 400};
  margin: 2px 8px;

  &:hover {
    background: ${({ $active }) => $active ? COLOR.PRIMARY10 : COLOR.GRAY10};
  }
`;

const FolderItem = styled.button<{ $active?: boolean; $depth?: number }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 16px 8px ${({ $depth }) => 16 + ($depth || 0) * 16}px;
  font-size: 13px;
  color: ${({ $active }) => $active ? COLOR.PRIMARY60 : COLOR.GRAY80};
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;

  &:hover {
    background: ${COLOR.GRAY10};
  }
`;

const FileMain = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const FileToolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid ${COLOR.GRAY30};
  background: ${COLOR.WHITE};
`;

const ActionBar = styled.div<{ $visible?: boolean }>`
  display: ${({ $visible }) => $visible ? 'flex' : 'none'};
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: ${COLOR.PRIMARY10};
  border-bottom: 1px solid ${COLOR.PRIMARY30};
`;

const FileScroll = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const FileTableHeader = styled.div`
  display: grid;
  grid-template-columns: 40px 2fr 100px 120px 120px 140px;
  padding: 10px 16px;
  background: ${COLOR.GRAY10};
  border-bottom: 1px solid ${COLOR.GRAY30};

  span {
    font-size: 12px;
    font-weight: 500;
    color: ${COLOR.GRAY70};
  }
`;

const FileRow = styled.div<{ $selected?: boolean }>`
  display: grid;
  grid-template-columns: 40px 2fr 100px 120px 120px 140px;
  padding: 12px 16px;
  border-bottom: 1px solid ${COLOR.GRAY20};
  align-items: center;
  cursor: pointer;
  background: ${({ $selected }) => $selected ? COLOR.PRIMARY10 : 'transparent'};

  &:hover {
    background: ${({ $selected }) => $selected ? COLOR.PRIMARY10 : COLOR.GRAY10};
  }

  &:hover .file-actions {
    opacity: 1;
  }
`;

const FileName = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: ${COLOR.GRAY90};
`;

const FileMeta = styled.div`
  font-size: 13px;
  color: ${COLOR.GRAY70};
`;

const FileActions = styled.div`
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s;
`;

const ExtractBadge = styled.button<{ $status: 'completed' | 'failed' | 'none' | 'extracting' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
  border: none;
  cursor: pointer;

  ${({ $status }) => {
    switch ($status) {
      case 'completed':
        return `background: #e6f4ea; color: #188038;`;
      case 'failed':
        return `background: #fce8e6; color: #d93025; border: 1px solid #f5c6cb;`;
      case 'extracting':
        return `background: #fff3e0; color: #e65100;`;
      default:
        return `background: ${COLOR.GRAY10}; color: ${COLOR.GRAY60}; border: 1px dashed ${COLOR.GRAY40};`;
    }
  }}
`;

const ExtractPanel = styled.div<{ $visible?: boolean; $failed?: boolean }>`
  display: ${({ $visible }) => $visible ? 'block' : 'none'};
  padding: 16px 16px 16px 56px;
  background: ${({ $failed }) => $failed ? '#fffafa' : COLOR.WHITE};
  border-bottom: 1px solid ${COLOR.GRAY20};
  border-left: 3px solid ${({ $failed }) => $failed ? COLOR.RED60 : '#1D9E75'};
`;

const ExtractGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px 32px;
  margin-bottom: 16px;
`;

const ExtractField = styled.div``;

const ExtractLabel = styled.div`
  font-size: 11px;
  color: ${COLOR.GRAY60};
  margin-bottom: 2px;
`;

const ExtractValue = styled.div`
  font-size: 14px;
  color: ${COLOR.GRAY90};
  font-weight: 500;
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: ${COLOR.PRIMARY60};
`;

// ---- 휴지통 ----
const TrashNotice = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  background: #fef7e0;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 13px;
  color: #b06000;
`;

// ---- 필터 패널 ----
const FilterPanel = styled.div<{ $isOpen?: boolean }>`
  display: ${({ $isOpen }) => $isOpen ? 'block' : 'none'};
  padding: 16px;
  background: ${COLOR.GRAY10};
  border-bottom: 1px solid ${COLOR.GRAY30};
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FilterLabel = styled.label`
  font-size: 11px;
  font-weight: 500;
  color: ${COLOR.GRAY70};
`;

const DateInput = styled.input`
  height: 36px;
  padding: 0 10px;
  border: 1px solid ${COLOR.GRAY30};
  border-radius: 6px;
  font-size: 13px;
  color: ${COLOR.GRAY90};
  background: ${COLOR.WHITE};
  outline: none;

  &:focus {
    border-color: ${COLOR.PRIMARY60};
  }
`;

const FilterActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid ${COLOR.GRAY30};
`;

// ---- 드래그앤드롭 ----
const DropZone = styled.div<{ $isDragging?: boolean }>`
  border: 2px dashed ${({ $isDragging }) => $isDragging ? COLOR.PRIMARY60 : COLOR.GRAY30};
  border-radius: 8px;
  padding: 40px 24px;
  text-align: center;
  background: ${({ $isDragging }) => $isDragging ? COLOR.PRIMARY10 : COLOR.WHITE};
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: ${COLOR.PRIMARY60};
    background: ${COLOR.PRIMARY10};
  }
`;

const DropZoneIcon = styled.div`
  margin-bottom: 12px;
`;

const DropZoneTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${COLOR.GRAY90};
  margin-bottom: 4px;
`;

const DropZoneSub = styled.div`
  font-size: 12px;
  color: ${COLOR.GRAY60};
`;

const UploadProgress = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: ${COLOR.GRAY10};
  border-radius: 6px;
`;

const UploadItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid ${COLOR.GRAY20};

  &:last-child {
    border-bottom: none;
  }
`;

const UploadFileName = styled.div`
  flex: 1;
  font-size: 13px;
  color: ${COLOR.GRAY90};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UploadFileSize = styled.div`
  font-size: 11px;
  color: ${COLOR.GRAY60};
`;

const DragHint = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: ${COLOR.GRAY10};
  border-bottom: 1px solid ${COLOR.GRAY20};
  font-size: 12px;
  color: ${COLOR.GRAY60};
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${COLOR.WHITE};
  border-bottom: 1px solid ${COLOR.GRAY30};
`;

// ---- 모달 관련 ----
const ModalSection = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ModalLabel = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: ${COLOR.GRAY80};
  margin-bottom: 8px;
`;

const ModalInput = styled.input`
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid ${COLOR.GRAY30};
  border-radius: 6px;
  font-size: 14px;
  color: ${COLOR.GRAY90};
  outline: none;

  &:focus {
    border-color: ${COLOR.PRIMARY60};
  }

  &::placeholder {
    color: ${COLOR.GRAY50};
  }
`;

const ShareLinkBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: ${COLOR.GRAY10};
  border: 1px solid ${COLOR.GRAY30};
  border-radius: 6px;
`;

const ShareLink = styled.span`
  flex: 1;
  font-size: 13px;
  color: ${COLOR.GRAY70};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ShareMemberList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
`;

const ShareMemberItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.GRAY20};
  border-radius: 6px;
`;

const MemberAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${COLOR.PRIMARY20};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: ${COLOR.PRIMARY60};
`;

const MemberInfo = styled.div`
  flex: 1;
`;

const MemberName = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: ${COLOR.GRAY90};
`;

const MemberEmail = styled.div`
  font-size: 11px;
  color: ${COLOR.GRAY60};
`;

const PermissionSelect = styled.select`
  padding: 6px 10px;
  border: 1px solid ${COLOR.GRAY30};
  border-radius: 4px;
  font-size: 12px;
  color: ${COLOR.GRAY80};
  background: ${COLOR.WHITE};
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: ${COLOR.PRIMARY60};
  }
`;

const FolderTree = styled.div`
  border: 1px solid ${COLOR.GRAY30};
  border-radius: 6px;
  max-height: 280px;
  overflow-y: auto;
`;

const FolderTreeItem = styled.button<{ $depth?: number; $selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px 10px ${({ $depth }) => 12 + ($depth || 0) * 20}px;
  font-size: 13px;
  color: ${({ $selected }) => $selected ? COLOR.PRIMARY60 : COLOR.GRAY80};
  background: ${({ $selected }) => $selected ? COLOR.PRIMARY10 : 'transparent'};
  border: none;
  border-bottom: 1px solid ${COLOR.GRAY20};
  cursor: pointer;
  text-align: left;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${({ $selected }) => $selected ? COLOR.PRIMARY10 : COLOR.GRAY10};
  }
`;

const SelectedFilesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px;
  background: ${COLOR.GRAY10};
  border-radius: 6px;
  margin-bottom: 16px;
`;

const SelectedFileTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.GRAY30};
  border-radius: 4px;
  font-size: 12px;
  color: ${COLOR.GRAY80};
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid ${COLOR.GRAY20};
  margin-top: 20px;
`;

// ---- 미리보기 모달 ----
const PreviewOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${COLOR.GRAY100};
  z-index: 2000;
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
  flex-direction: column;
`;

const PreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: ${COLOR.GRAY100};
  border-bottom: 1px solid ${COLOR.GRAY80};
`;

const PreviewFileName = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
  color: ${COLOR.WHITE};
`;

const PreviewHeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PreviewHeaderBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: ${COLOR.GRAY80};
  border: none;
  border-radius: 6px;
  font-size: 13px;
  color: ${COLOR.WHITE};
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: ${COLOR.GRAY70};
  }
`;

const PreviewPageInfo = styled.span`
  font-size: 13px;
  color: ${COLOR.GRAY50};
  margin-left: 8px;
`;

const PreviewLayout = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const PreviewMain = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${COLOR.GRAY90};
  overflow: auto;
  padding: 40px;
`;

const PreviewSidebar = styled.div`
  width: 320px;
  background: ${COLOR.WHITE};
  border-left: 1px solid ${COLOR.GRAY30};
  overflow-y: auto;
  flex-shrink: 0;
`;

const PreviewSidebarSection = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${COLOR.GRAY20};

  &:last-child {
    border-bottom: none;
  }
`;

const PreviewSidebarTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${COLOR.GRAY100};
  margin-bottom: 16px;
`;

const PreviewInfoRow = styled.div`
  margin-bottom: 14px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const PreviewInfoLabel = styled.div`
  font-size: 11px;
  color: ${COLOR.GRAY60};
  margin-bottom: 2px;
`;

const PreviewInfoValue = styled.div`
  font-size: 13px;
  color: ${COLOR.GRAY90};
  font-weight: 500;
`;

const ExtractStatusBadge = styled.div<{ $status: 'completed' | 'failed' }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 16px;

  ${({ $status }) => $status === 'completed' ? `
    background: #e6f4ea;
    color: #188038;
  ` : `
    background: #fce8e6;
    color: #d93025;
  `}
`;

const AllergenTable = styled.div`
  border: 1px solid ${COLOR.GRAY30};
  border-radius: 6px;
  overflow: hidden;
  margin-top: 12px;
`;

const AllergenHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 80px;
  background: ${COLOR.GRAY10};
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 500;
  color: ${COLOR.GRAY70};
  border-bottom: 1px solid ${COLOR.GRAY30};
`;

const AllergenRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 80px;
  padding: 8px 12px;
  font-size: 12px;
  border-bottom: 1px solid ${COLOR.GRAY20};

  &:last-child {
    border-bottom: none;
  }

  &:nth-child(even) {
    background: ${COLOR.GRAY10};
  }
`;

const AllergenName = styled.span`
  color: ${COLOR.GRAY90};
`;

const AllergenValue = styled.span`
  color: ${COLOR.GRAY70};
  text-align: right;
`;

const CerticosButton = styled.button`
  width: 100%;
  padding: 12px;
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.PRIMARY60};
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: ${COLOR.PRIMARY60};
  cursor: pointer;
  transition: all 0.15s;
  margin-top: 16px;

  &:hover {
    background: ${COLOR.PRIMARY10};
  }
`;

const PDFSkeleton = styled.div`
  width: 100%;
  max-width: 600px;
  background: ${COLOR.WHITE};
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  padding: 40px;
  min-height: 700px;
`;

const SkeletonLine = styled.div<{ $width?: string; $height?: number; $dark?: boolean }>`
  width: ${({ $width }) => $width || '100%'};
  height: ${({ $height }) => $height || 12}px;
  background: ${({ $dark }) => $dark ? COLOR.GRAY30 : COLOR.GRAY20};
  border-radius: 4px;
  margin-bottom: 12px;
`;

const SkeletonBlock = styled.div`
  background: ${COLOR.GRAY10};
  border-radius: 4px;
  padding: 20px;
  margin: 24px 0;
`;

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
`;

const ProgressBar = styled.div<{ $progress: number }>`
  height: 4px;
  background: ${COLOR.GRAY20};
  border-radius: 2px;
  overflow: hidden;
  margin-top: 4px;

  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${({ $progress }) => $progress}%;
    background: ${({ $progress }) => $progress === 100 ? '#188038' : COLOR.PRIMARY60};
    transition: width 0.3s ease;
  }
`;

// ---- 권한 관리 ----
const PermissionLayout = styled.div`
  display: flex;
  height: calc(100vh - 140px);
  background: ${COLOR.WHITE};
  border-radius: 8px;
  border: 1px solid ${COLOR.GRAY30};
  overflow: hidden;
`;

const PermissionSidebar = styled.div`
  width: 240px;
  flex-shrink: 0;
  background: ${COLOR.WHITE};
  border-right: 1px solid ${COLOR.GRAY30};
  overflow-y: auto;
`;

const PermissionSidebarItem = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  font-size: 13px;
  color: ${({ $active }) => $active ? COLOR.PRIMARY60 : COLOR.GRAY80};
  background: ${({ $active }) => $active ? COLOR.PRIMARY10 : 'transparent'};
  border: none;
  border-left: 3px solid ${({ $active }) => $active ? COLOR.PRIMARY60 : 'transparent'};
  cursor: pointer;
  text-align: left;

  &:hover {
    background: ${({ $active }) => $active ? COLOR.PRIMARY10 : COLOR.GRAY10};
  }
`;

const PermissionMain = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
`;

const PermissionCard = styled.div`
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.GRAY30};
  border-radius: 8px;
  overflow: hidden;
`;

const PermissionCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: ${COLOR.GRAY10};
  border-bottom: 1px solid ${COLOR.GRAY30};
`;

const PermissionTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th {
    padding: 12px 18px;
    font-size: 12px;
    font-weight: 500;
    color: ${COLOR.GRAY70};
    background: ${COLOR.GRAY10};
    border-bottom: 1px solid ${COLOR.GRAY30};
    text-align: left;
  }

  td {
    padding: 14px 18px;
    font-size: 13px;
    border-bottom: 1px solid ${COLOR.GRAY20};
    vertical-align: middle;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover {
    background: ${COLOR.GRAY10};
  }
`;

const SmallBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
  background: ${COLOR.PRIMARY10};
  color: ${COLOR.PRIMARY60};
  margin-left: 4px;
`;

// ===== Component =====
type ViewType = 'companies' | 'files' | 'trash' | 'permissions' | 'notifications';

export default function DocsPage() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<ViewType>('companies');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [expandedPanels, setExpandedPanels] = useState<string[]>([]);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [consultantFilter, setConsultantFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFolder, setSelectedFolder] = useState('견적서/의뢰서');
  const [activeNav, setActiveNav] = useState('all');

  // 파일 필터 상태
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [fileNameSearch, setFileNameSearch] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [uploaderFilter, setUploaderFilter] = useState('all');
  const [fileSizeFilter, setFileSizeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // 드래그앤드롭 상태
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Array<{ name: string; size: string; progress: number }>>([]);

  // 모달 상태
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileData | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [moveFolderTarget, setMoveFolderTarget] = useState<string | null>(null);

  // 공유된 멤버 목록 (mock)
  const [sharedMembers, setSharedMembers] = useState([
    { id: 'm1', name: '김담당', email: 'kim@company.com', permission: 'edit' },
    { id: 'm2', name: '이매니저', email: 'lee@company.com', permission: 'view' },
  ]);

  // 폴더 구조 (mock)
  const folderStructure = [
    { id: 'root', name: selectedCompany?.nameKo || '회사', depth: 0 },
    { id: 'y25-1', name: '25년 1차', depth: 1 },
    { id: 'product-a', name: '제품A', depth: 2 },
    { id: 'product-b', name: '제품B', depth: 2 },
    { id: 'y25-2', name: '25년 2차', depth: 1 },
    { id: 'product-c', name: '제품C', depth: 2 },
    { id: 'quotes', name: '견적서/의뢰서', depth: 1 },
    { id: 'pif', name: 'PIF', depth: 1 },
    { id: 'etc', name: '기타', depth: 1 },
  ];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // 파일 크기 파싱 (MB 단위로 변환)
  const parseFileSize = (sizeStr: string): number => {
    if (sizeStr === '—') return 0;
    const match = sizeStr.match(/([\d.]+)\s*(KB|MB|GB)/i);
    if (!match) return 0;
    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    if (unit === 'KB') return value / 1024;
    if (unit === 'GB') return value * 1024;
    return value; // MB
  };

  // 파일 필터링 로직
  const filteredFiles = MOCK_FILES.filter(file => {
    // 파일명 검색
    if (fileNameSearch && !file.name.toLowerCase().includes(fileNameSearch.toLowerCase())) {
      return false;
    }
    // 파일 타입 필터
    if (fileTypeFilter !== 'all') {
      if (fileTypeFilter === 'jpg' && file.type !== 'jpg' && file.type !== 'png') return false;
      if (fileTypeFilter !== 'jpg' && file.type !== fileTypeFilter && file.type !== 'folder') return false;
    }
    // 업로더 필터
    if (uploaderFilter !== 'all' && file.uploader !== uploaderFilter && file.type !== 'folder') {
      return false;
    }
    // 파일 크기 필터
    if (fileSizeFilter !== 'all' && file.type !== 'folder') {
      const sizeMB = parseFileSize(file.size);
      if (fileSizeFilter === 'small' && sizeMB > 1) return false;
      if (fileSizeFilter === 'medium' && (sizeMB <= 1 || sizeMB > 10)) return false;
      if (fileSizeFilter === 'large' && sizeMB <= 10) return false;
    }
    // 날짜 범위 필터
    if (dateFrom || dateTo) {
      const fileDate = file.date.replace(/\./g, '-');
      if (dateFrom && fileDate < dateFrom) return false;
      if (dateTo && fileDate > dateTo) return false;
    }
    return true;
  });

  // 회사 필터링 로직
  const filteredCompanies = MOCK_COMPANIES.filter(company => {
    // 컨설턴트 필터
    if (consultantFilter !== 'all' && company.consultant !== consultantFilter) {
      return false;
    }
    return true;
  });

  // 드래그앤드롭 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleFileUpload = (files: File[]) => {
    const newUploads = files.map(file => ({
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      progress: 0,
    }));
    setUploadingFiles(prev => [...prev, ...newUploads]);

    // 업로드 진행 시뮬레이션
    newUploads.forEach((_, index) => {
      const interval = setInterval(() => {
        setUploadingFiles(prev => {
          const updated = [...prev];
          const targetIndex = prev.length - newUploads.length + index;
          if (updated[targetIndex] && updated[targetIndex].progress < 100) {
            updated[targetIndex] = { ...updated[targetIndex], progress: Math.min(100, updated[targetIndex].progress + 10) };
          }
          return updated;
        });
      }, 200);
      setTimeout(() => clearInterval(interval), 2500);
    });
  };

  const resetFilters = () => {
    setFileNameSearch('');
    setFileTypeFilter('all');
    setUploaderFilter('all');
    setFileSizeFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  const handleCompanyClick = (company: Company) => {
    setSelectedCompany(company);
    setCurrentView('files');
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]
    );
  };

  const toggleAllFiles = (checked: boolean) => {
    setSelectedFiles(checked ? MOCK_FILES.filter(f => f.type !== 'folder').map(f => f.id) : []);
  };

  const togglePanel = (fileId: string) => {
    setExpandedPanels(prev =>
      prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]
    );
  };

  const getFileIcon = (type: FileData['type']) => {
    switch (type) {
      case 'folder': return <AppIcon name="folder" size={16} fillColor="ICON_NEUTRAL" />;
      case 'pdf': return <AppIcon name="file" size={16} fillColor="STATE_ERROR" />;
      case 'xlsx': return <AppIcon name="file" size={16} fillColor="STATE_SUCCESS" />;
      case 'jpg':
      case 'png': return <AppIcon name="file" size={16} fillColor="ICON_PRIMARY" />;
      default: return <AppIcon name="file" size={16} fillColor="ICON_NEUTRAL" />;
    }
  };

  const getNotifIcon = (type: Notification['type']) => {
    switch (type) {
      case 'upload': return <AppIcon name="check" size={16} fillColor="STATE_SUCCESS" />;
      case 'share': return <AppIcon name="share" size={16} fillColor="ICON_PRIMARY" />;
      case 'storage': return <AppIcon name="warning" size={16} fillColor="STATE_WARNING" />;
      case 'fail': return <AppIcon name="warning" size={16} fillColor="STATE_ERROR" />;
      default: return <AppIcon name="bell" size={16} fillColor="ICON_NEUTRAL" />;
    }
  };

  const companyColumns = [
    {
      key: 'no',
      title: 'No.',
      width: '80px',
      render: (_: unknown, r: Company) => (
        <span style={{ fontSize: 13, color: COLOR.GRAY70 }}>{r.no}</span>
      ),
    },
    {
      key: 'nameKo',
      title: '회사명(국문)',
      width: '240px',
      render: (_: unknown, r: Company) => (
        <CompanyLink onClick={() => handleCompanyClick(r)}>{r.nameKo}</CompanyLink>
      ),
    },
    {
      key: 'nameEn',
      title: '회사명(영문)',
      width: '280px',
      render: (_: unknown, r: Company) => (
        <span style={{ fontSize: 13, color: COLOR.GRAY80 }}>{r.nameEn}</span>
      ),
    },
    {
      key: 'consultant',
      title: '컨설턴트',
      width: '120px',
      render: (_: unknown, r: Company) => (
        <span style={{ fontSize: 13, color: COLOR.GRAY80 }}>{r.consultant}</span>
      ),
    },
    {
      key: 'productCount',
      title: '제품 수',
      width: '100px',
      render: (_: unknown, r: Company) => (
        <span style={{ fontSize: 13, color: COLOR.GRAY80 }}>{r.productCount}</span>
      ),
    },
  ];

  const trashColumns = [
    { key: 'name', title: '이름', width: '200px', render: (_: unknown, r: FileData) => <FileName>{getFileIcon(r.type)} {r.name}</FileName> },
    { key: 'originalPath', title: '원래 위치', width: '200px', render: (_: unknown, r: FileData) => <FileMeta>{r.originalPath}</FileMeta> },
    { key: 'deletedAt', title: '삭제일', width: '100px', render: (_: unknown, r: FileData) => <FileMeta>{r.deletedAt}</FileMeta> },
    { key: 'expiresAt', title: '만료일', width: '150px', render: (_: unknown, r: FileData) => <span style={{ fontSize: 12, color: COLOR.RED60 }}>{r.expiresAt}</span> },
    { key: 'actions', title: '액션', width: '180px', render: () => (
      <div style={{ display: 'flex', gap: 8 }}>
        <AppTextButton variant="SECONDARY" size="SMALL">복원</AppTextButton>
        <AppTextButton variant="DANGER" size="SMALL">영구 삭제</AppTextButton>
      </div>
    )},
  ];

  // 상세 정보 테이블 (files 화면 하단)
  const inputInfoColumns = [
    { key: 'no', title: 'No.', width: '50px', render: (_: unknown, r: { no: number; name: string; status: string; required: boolean; person?: string; date?: string }) => (
      <span style={{ fontSize: 13, color: COLOR.GRAY70 }}>{r.no}</span>
    )},
    { key: 'name', title: '입력 정보', width: '300px', render: (_: unknown, r: { no: number; name: string; status: string; required: boolean; isLink?: boolean; person?: string; date?: string }) => (
      r.isLink
        ? <span style={{ fontSize: 13, color: COLOR.PRIMARY60, cursor: 'pointer', textDecoration: 'underline' }}>{r.name}</span>
        : <span style={{ fontSize: 13, color: COLOR.GRAY90 }}>{r.name}</span>
    )},
    { key: 'status', title: '처리 현황', width: '110px', render: (_: unknown, r: { no: number; name: string; status: string; required: boolean; person?: string; date?: string }) => {
      if (r.status === '입력 완료') return <span style={{ fontSize: 13, color: COLOR.GRAY80 }}>입력 완료</span>;
      if (r.status === '필수 입력') return <StatusBadge $variant="incomplete">필수 입력</StatusBadge>;
      return <span style={{ fontSize: 13, color: COLOR.GRAY60 }}>선택 입력</span>;
    }},
    { key: 'person', title: '최근 입력자명', width: '110px', render: (_: unknown, r: { no: number; name: string; status: string; required: boolean; person?: string; date?: string }) => (
      <span style={{ fontSize: 13, color: COLOR.GRAY80 }}>{r.person || ''}</span>
    )},
    { key: 'date', title: '입력일', width: '110px', render: (_: unknown, r: { no: number; name: string; status: string; required: boolean; person?: string; date?: string }) => (
      <span style={{ fontSize: 13, color: COLOR.GRAY70 }}>{r.date || ''}</span>
    )},
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'companies':
        return (
          <PageWrapper onClick={() => setIsNotificationOpen(false)}>
            <PageHeader>
              <AppBreadcrumb items={[{ label: '홈', onClick: () => {} }, { label: '서류 저장소' }]} />
              <PageTitleRow style={{ marginTop: 8 }}>
                <PageTitle>서류 저장소</PageTitle>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <NotificationWrapper onClick={(e) => e.stopPropagation()}>
                    <NotificationBell onClick={() => setIsNotificationOpen(!isNotificationOpen)}>
                      <AppIcon name="bell" size={18} fillColor="ICON_NEUTRAL" />
                      {unreadCount > 0 && <NotificationBadge>{unreadCount}</NotificationBadge>}
                    </NotificationBell>
                    <NotificationPanel $isOpen={isNotificationOpen}>
                      <NotificationHeader>
                        <AppTypography variant="BODY1_500" color="TEXT_STRONG">알림</AppTypography>
                        <button onClick={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))} style={{ background: 'none', border: 'none', color: COLOR.PRIMARY60, fontSize: 13, cursor: 'pointer' }}>
                          모두 읽음
                        </button>
                      </NotificationHeader>
                      <NotificationList>
                        {notifications.map(n => (
                          <NotificationItem key={n.id} $isRead={n.isRead}>
                            <NotificationIcon $type={n.type}>{getNotifIcon(n.type)}</NotificationIcon>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: n.isRead ? 400 : 500 }}>{n.title}</div>
                              <div style={{ fontSize: 12, color: COLOR.GRAY70, marginTop: 2 }}>{n.message}</div>
                              <div style={{ fontSize: 11, color: COLOR.GRAY60, marginTop: 4 }}>{n.time}</div>
                            </div>
                          </NotificationItem>
                        ))}
                      </NotificationList>
                    </NotificationPanel>
                  </NotificationWrapper>
                  <AppTextButton variant="SECONDARY" size="MEDIUM" onClick={() => setCurrentView('trash')}>휴지통</AppTextButton>
                  <AppTextButton variant="PRIMARY" size="MEDIUM">업로드</AppTextButton>
                </div>
              </PageTitleRow>
            </PageHeader>

            <FilterBar>
              <FilterLeft>
                <AppSearchInput
                  placeholder="파일명 검색"
                  width={320}
                  value={fileNameSearch}
                  onChange={setFileNameSearch}
                />
              </FilterLeft>
              <FilterRight>
                <AppSelect
                  placeholder="컨설턴트"
                  width={140}
                  value={consultantFilter}
                  onChange={(v) => setConsultantFilter(String(v))}
                  options={CONSULTANTS}
                />
                {(fileNameSearch || consultantFilter !== 'all') && (
                  <AppTextButton
                    variant="SECONDARY"
                    size="SMALL"
                    onClick={() => { setFileNameSearch(''); setConsultantFilter('all'); }}
                  >
                    초기화
                  </AppTextButton>
                )}
              </FilterRight>
            </FilterBar>

            <TableCard>
              <AppTable<Company> columns={companyColumns} data={filteredCompanies} rowKey="id" />
            </TableCard>

            <PaginationWrapper>
              <AppPagination total={990} perPage={10} currentPage={currentPage} onChangePage={setCurrentPage} />
            </PaginationWrapper>
          </PageWrapper>
        );

      case 'files':
        return (
          <PageWrapper>
            <PageHeader>
              <AppBreadcrumb items={[
                { label: '홈', onClick: () => {} },
                { label: '서류 저장소', onClick: () => { setCurrentView('companies'); setSelectedCompany(null); } },
                { label: selectedCompany?.nameKo || '' },
              ]} />
              <PageTitleRow style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <AppIconButton icon="chevronLeft" size="SMALL" onClick={() => { setCurrentView('companies'); setSelectedCompany(null); }} />
                  <PageTitle style={{ fontSize: 20 }}>{selectedCompany?.nameKo} 서류</PageTitle>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <AppTextButton variant="SECONDARY" size="MEDIUM" onClick={() => setCurrentView('permissions')}>권한 관리</AppTextButton>
                  <AppTextButton variant="PRIMARY" size="MEDIUM">업로드</AppTextButton>
                </div>
              </PageTitleRow>
            </PageHeader>

            <FileLayout>
              <Sidebar>
                <SidebarSection>
                  <AppTextButton variant="PRIMARY" size="MEDIUM" style={{ width: '100%', justifyContent: 'center' }}>+ 새로 만들기</AppTextButton>
                </SidebarSection>
                <NavItem $active={activeNav === 'all'} onClick={() => setActiveNav('all')}><AppIcon name="folder" size={16} fillColor={activeNav === 'all' ? 'ICON_PRIMARY' : 'ICON_NEUTRAL'} /> 전체 파일</NavItem>
                <NavItem $active={activeNav === 'shared'} onClick={() => setActiveNav('shared')}><AppIcon name="share" size={16} fillColor={activeNav === 'shared' ? 'ICON_PRIMARY' : 'ICON_NEUTRAL'} /> 공유 파일</NavItem>
                <NavItem $active={activeNav === 'starred'} onClick={() => setActiveNav('starred')}><AppIcon name="check" size={16} fillColor={activeNav === 'starred' ? 'ICON_PRIMARY' : 'ICON_NEUTRAL'} /> 즐겨찾기</NavItem>
                <NavItem $active={activeNav === 'recent'} onClick={() => setActiveNav('recent')}><AppIcon name="file" size={16} fillColor={activeNav === 'recent' ? 'ICON_PRIMARY' : 'ICON_NEUTRAL'} /> 최근 파일</NavItem>
                <SidebarTitle>폴더 구조</SidebarTitle>
                <FolderItem $active><AppIcon name="folder" size={14} fillColor="ICON_PRIMARY" /> {selectedCompany?.nameKo}</FolderItem>
                <FolderItem $depth={1}><AppIcon name="folderOpen" size={14} fillColor="ICON_NEUTRAL" /> 25년 1차</FolderItem>
                <FolderItem $depth={2} style={{ color: COLOR.PRIMARY60 }}><AppIcon name="file" size={14} fillColor="ICON_PRIMARY" /> 제품B</FolderItem>
                <FolderItem $depth={1}><AppIcon name="folderOpen" size={14} fillColor="ICON_NEUTRAL" /> 25년 2차</FolderItem>
                <div style={{ borderTop: `1px solid ${COLOR.GRAY30}`, margin: '12px 0' }} />
                <NavItem onClick={() => setCurrentView('trash')} style={{ color: COLOR.GRAY60 }}><AppIcon name="trash" size={16} fillColor="ICON_ASSISTIVE" /> 휴지통</NavItem>
              </Sidebar>
              <FileMain>
                <ActionBar $visible={selectedFiles.length > 0}>
                  <AppTypography variant="BODY2_500" color="TEXT_PRIMARY">{selectedFiles.length}개 선택됨</AppTypography>
                  <AppTextButton variant="SECONDARY" size="SMALL" prefixIcon={<AppIcon name="extract" size={14} />}>Certicos 추출</AppTextButton>
                  <AppTextButton variant="SECONDARY" size="SMALL" prefixIcon={<AppIcon name="download" size={14} />}>다운로드</AppTextButton>
                  <AppTextButton variant="SECONDARY" size="SMALL" prefixIcon={<AppIcon name="share" size={14} />} onClick={() => setIsShareModalOpen(true)}>공유</AppTextButton>
                  <AppTextButton variant="SECONDARY" size="SMALL" prefixIcon={<AppIcon name="folder" size={14} />} onClick={() => setIsMoveModalOpen(true)}>이동</AppTextButton>
                  <AppTextButton variant="DANGER" size="SMALL" prefixIcon={<AppIcon name="trash" size={14} />}>삭제</AppTextButton>
                  <div style={{ marginLeft: 'auto' }}>
                    <AppTextButton variant="SECONDARY" size="SMALL" prefixIcon={<AppIcon name="close" size={14} />} onClick={() => setSelectedFiles([])}>해제</AppTextButton>
                  </div>
                </ActionBar>
                <FileToolbar style={{ display: selectedFiles.length > 0 ? 'none' : 'flex' }}>
                  <AppBreadcrumb items={[
                    { label: selectedCompany?.nameKo || '', onClick: () => {} },
                    { label: '25년 1차', onClick: () => {} },
                    { label: '제품B' },
                  ]} />
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                    <AppTextButton variant="SECONDARY" size="SMALL" prefixIcon={<AppIcon name="folder" size={14} />}>폴더 만들기</AppTextButton>
                  </div>
                </FileToolbar>
                <SearchBar>
                  <AppSearchInput
                    placeholder="파일명으로 검색"
                    width={280}
                    value={fileNameSearch}
                    onChange={setFileNameSearch}
                  />
                  <AppTextButton
                    variant={isFilterOpen ? 'PRIMARY' : 'SECONDARY'}
                    size="SMALL"
                    prefixIcon={<AppIcon name="filter" size={14} />}
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                  >
                    상세 필터 {isFilterOpen ? '닫기' : '열기'}
                  </AppTextButton>
                  {(fileTypeFilter !== 'all' || uploaderFilter !== 'all' || fileSizeFilter !== 'all' || dateFrom || dateTo) && (
                    <span style={{ fontSize: 12, color: COLOR.PRIMARY60 }}>필터 적용됨</span>
                  )}
                </SearchBar>
                <FilterPanel $isOpen={isFilterOpen}>
                  <FilterGrid>
                    <FilterGroup>
                      <FilterLabel>파일 타입</FilterLabel>
                      <AppSelect
                        placeholder="파일 타입"
                        width={180}
                        value={fileTypeFilter}
                        onChange={(v) => setFileTypeFilter(String(v))}
                        options={FILE_TYPE_OPTIONS}
                      />
                    </FilterGroup>
                    <FilterGroup>
                      <FilterLabel>업로더</FilterLabel>
                      <AppSelect
                        placeholder="업로더"
                        width={180}
                        value={uploaderFilter}
                        onChange={(v) => setUploaderFilter(String(v))}
                        options={UPLOADER_OPTIONS}
                      />
                    </FilterGroup>
                    <FilterGroup>
                      <FilterLabel>파일 크기</FilterLabel>
                      <AppSelect
                        placeholder="파일 크기"
                        width={180}
                        value={fileSizeFilter}
                        onChange={(v) => setFileSizeFilter(String(v))}
                        options={FILE_SIZE_OPTIONS}
                      />
                    </FilterGroup>
                    <FilterGroup>
                      <FilterLabel>업로드 날짜 (시작)</FilterLabel>
                      <DateInput type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                    </FilterGroup>
                    <FilterGroup>
                      <FilterLabel>업로드 날짜 (종료)</FilterLabel>
                      <DateInput type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                    </FilterGroup>
                  </FilterGrid>
                  <FilterActions>
                    <AppTextButton variant="SECONDARY" size="SMALL" onClick={resetFilters}>초기화</AppTextButton>
                    <AppTextButton variant="PRIMARY" size="SMALL" onClick={() => setIsFilterOpen(false)}>닫기</AppTextButton>
                  </FilterActions>
                </FilterPanel>
                <DragHint>
                  <AppIcon name="upload" size={14} fillColor="ICON_ASSISTIVE" />
                  파일을 이 영역에 드래그하여 바로 업로드할 수 있습니다
                </DragHint>
                <FileScroll
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <FileTableHeader>
                    <span><Checkbox onChange={(e) => toggleAllFiles(e.target.checked)} /></span>
                    <span>이름</span>
                    <span>크기</span>
                    <span>수정일</span>
                    <span>Certicos</span>
                    <span>액션</span>
                  </FileTableHeader>
                  {isDragging && (
                    <DropZone $isDragging={isDragging} style={{ margin: '16px' }}>
                      <DropZoneIcon><AppIcon name="upload" size={40} fillColor="ICON_PRIMARY" /></DropZoneIcon>
                      <DropZoneTitle>파일을 여기에 드롭하세요</DropZoneTitle>
                      <DropZoneSub>또는 클릭하여 파일 선택</DropZoneSub>
                    </DropZone>
                  )}
                  {uploadingFiles.length > 0 && (
                    <UploadProgress style={{ margin: '16px' }}>
                      {uploadingFiles.map((uf, idx) => (
                        <UploadItem key={idx}>
                          <AppIcon name="file" size={16} fillColor="ICON_NEUTRAL" />
                          <div style={{ flex: 1 }}>
                            <UploadFileName>{uf.name}</UploadFileName>
                            <ProgressBar $progress={uf.progress} />
                          </div>
                          <UploadFileSize>{uf.size}</UploadFileSize>
                          {uf.progress === 100 && <AppIcon name="check" size={14} fillColor="STATE_SUCCESS" />}
                        </UploadItem>
                      ))}
                    </UploadProgress>
                  )}
                  {filteredFiles.map(file => (
                    <React.Fragment key={file.id}>
                      <FileRow
                        $selected={selectedFiles.includes(file.id)}
                        onClick={() => file.type !== 'folder' && toggleFileSelection(file.id)}
                        onDoubleClick={() => { if (file.type !== 'folder') { setPreviewFile(file); setIsPreviewOpen(true); } }}
                      >
                        <Checkbox checked={selectedFiles.includes(file.id)} onChange={() => toggleFileSelection(file.id)} onClick={(e) => e.stopPropagation()} disabled={file.type === 'folder'} />
                        <FileName>{getFileIcon(file.type)} {file.name}</FileName>
                        <FileMeta>{file.size}</FileMeta>
                        <FileMeta>{file.date}</FileMeta>
                        <div>
                          {file.extractStatus && file.type !== 'folder' && (
                            <ExtractBadge $status={file.extractStatus} onClick={(e) => { e.stopPropagation(); togglePanel(file.id); }}>
                              {file.extractStatus === 'completed' && <><AppIcon name="check" size={12} fillColor="STATE_SUCCESS" /> 추출완료</>}
                              {file.extractStatus === 'failed' && <><AppIcon name="warning" size={12} fillColor="STATE_ERROR" /> 추출실패</>}
                              {file.extractStatus === 'none' && '— 미추출'}
                            </ExtractBadge>
                          )}
                        </div>
                        <FileActions className="file-actions">
                          <AppIconButton icon="eye" size="SMALL" onClick={(e) => { e.stopPropagation(); if (file.type !== 'folder') { setPreviewFile(file); setIsPreviewOpen(true); } }} />
                          <AppIconButton icon="download" size="SMALL" onClick={(e) => e.stopPropagation()} />
                          <AppIconButton icon="share" size="SMALL" onClick={(e) => { e.stopPropagation(); setSelectedFiles([file.id]); setIsShareModalOpen(true); }} />
                          <AppIconButton icon="folder" size="SMALL" onClick={(e) => { e.stopPropagation(); setSelectedFiles([file.id]); setIsMoveModalOpen(true); }} />
                        </FileActions>
                      </FileRow>
                      {file.extractStatus === 'completed' && file.extractData && (
                        <ExtractPanel $visible={expandedPanels.includes(file.id)}>
                          <ExtractGrid>
                            <ExtractField><ExtractLabel>제품명</ExtractLabel><ExtractValue>{file.extractData.productName}</ExtractValue></ExtractField>
                            <ExtractField><ExtractLabel>고객사</ExtractLabel><ExtractValue>{file.extractData.customer}</ExtractValue></ExtractField>
                            <ExtractField><ExtractLabel>견적 금액</ExtractLabel><ExtractValue>{file.extractData.amount}</ExtractValue></ExtractField>
                            <ExtractField><ExtractLabel>견적 일자</ExtractLabel><ExtractValue>{file.extractData.date}</ExtractValue></ExtractField>
                            <ExtractField><ExtractLabel>담당 컨설턴트</ExtractLabel><ExtractValue>{file.extractData.consultant}</ExtractValue></ExtractField>
                          </ExtractGrid>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <AppTextButton variant="SECONDARY" size="SMALL">Certicos에서 확인 →</AppTextButton>
                            <span style={{ fontSize: 11, color: COLOR.GRAY60, marginLeft: 'auto' }}>잘못된 내용은 Certicos에서 수정</span>
                          </div>
                        </ExtractPanel>
                      )}
                      {file.extractStatus === 'failed' && (
                        <ExtractPanel $visible={expandedPanels.includes(file.id)} $failed>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div>
                              <div style={{ fontSize: 13, color: COLOR.RED60, fontWeight: 500 }}>파일 형식이 지원되지 않거나 내용을 읽을 수 없습니다.</div>
                              <div style={{ fontSize: 11, color: COLOR.GRAY60, marginTop: 2 }}>오류 코드: EXT-401</div>
                            </div>
                            <AppTextButton variant="SECONDARY" size="SMALL" style={{ marginLeft: 'auto' }} prefixIcon={<AppIcon name="restore" size={14} />}>다시 추출</AppTextButton>
                          </div>
                        </ExtractPanel>
                      )}
                    </React.Fragment>
                  ))}
                </FileScroll>
              </FileMain>
            </FileLayout>
          </PageWrapper>
        );

      case 'trash':
        return (
          <PageWrapper>
            <PageHeader>
              <AppBreadcrumb items={[{ label: '홈', onClick: () => {} }, { label: '서류 저장소', onClick: () => setCurrentView('companies') }, { label: '휴지통' }]} />
              <PageTitleRow style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <AppIconButton icon="chevronLeft" size="SMALL" onClick={() => setCurrentView(selectedCompany ? 'files' : 'companies')} />
                  <PageTitle style={{ fontSize: 20 }}>휴지통</PageTitle>
                </div>
                <AppTextButton variant="DANGER" size="MEDIUM">전체 영구 삭제</AppTextButton>
              </PageTitleRow>
            </PageHeader>
            <TrashNotice><AppIcon name="warning" size={16} fillColor="STATE_WARNING" /> 휴지통의 파일은 30일 후 자동으로 영구 삭제됩니다.</TrashNotice>
            <TableCard>
              <AppTable<FileData> columns={trashColumns} data={MOCK_TRASH} rowKey="id" />
            </TableCard>
          </PageWrapper>
        );

      case 'permissions':
        return (
          <PageWrapper>
            <PageHeader>
              <AppBreadcrumb items={[{ label: '홈', onClick: () => {} }, { label: '서류 저장소', onClick: () => setCurrentView('companies') }, { label: '권한 관리' }]} />
              <PageTitleRow style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <AppIconButton icon="chevronLeft" size="SMALL" onClick={() => setCurrentView('files')} />
                  <PageTitle style={{ fontSize: 20 }}>폴더별 권한 관리</PageTitle>
                </div>
                <AppTextButton variant="PRIMARY" size="MEDIUM">저장</AppTextButton>
              </PageTitleRow>
            </PageHeader>
            <PermissionLayout>
              <PermissionSidebar>
                <div style={{ padding: '12px 16px 6px', fontSize: 11, fontWeight: 600, color: COLOR.GRAY60, letterSpacing: '0.05em' }}>폴더 종류</div>
                <PermissionSidebarItem $active={selectedFolder === '견적서/의뢰서'} onClick={() => setSelectedFolder('견적서/의뢰서')}><AppIcon name="file" size={14} fillColor={selectedFolder === '견적서/의뢰서' ? 'ICON_PRIMARY' : 'ICON_NEUTRAL'} /> 견적서/의뢰서</PermissionSidebarItem>
                <PermissionSidebarItem $active={selectedFolder === '취합 서류'} onClick={() => setSelectedFolder('취합 서류')}><AppIcon name="file" size={14} fillColor={selectedFolder === '취합 서류' ? 'ICON_PRIMARY' : 'ICON_NEUTRAL'} /> 취합 서류</PermissionSidebarItem>
                <PermissionSidebarItem $active={selectedFolder === 'PIF'} onClick={() => setSelectedFolder('PIF')}><AppIcon name="file" size={14} fillColor={selectedFolder === 'PIF' ? 'ICON_PRIMARY' : 'ICON_NEUTRAL'} /> PIF</PermissionSidebarItem>
                <PermissionSidebarItem $active={selectedFolder === '해외 인허가 등록증'} onClick={() => setSelectedFolder('해외 인허가 등록증')}><AppIcon name="file" size={14} fillColor={selectedFolder === '해외 인허가 등록증' ? 'ICON_PRIMARY' : 'ICON_NEUTRAL'} /> 해외 인허가 등록증</PermissionSidebarItem>
                <PermissionSidebarItem $active={selectedFolder === 'QCQA'} onClick={() => setSelectedFolder('QCQA')}><AppIcon name="file" size={14} fillColor={selectedFolder === 'QCQA' ? 'ICON_PRIMARY' : 'ICON_NEUTRAL'} /> QCQA</PermissionSidebarItem>
                <PermissionSidebarItem $active={selectedFolder === '기타'} onClick={() => setSelectedFolder('기타')}><AppIcon name="file" size={14} fillColor={selectedFolder === '기타' ? 'ICON_PRIMARY' : 'ICON_NEUTRAL'} /> 기타</PermissionSidebarItem>
              </PermissionSidebar>
              <PermissionMain>
                <div style={{ marginBottom: 16 }}>
                  <AppTypography variant="TITLE3_500" color="TEXT_STRONG">{selectedFolder} — 기본 권한 설정</AppTypography>
                  <div style={{ fontSize: 12, color: COLOR.GRAY70, marginTop: 4 }}>아래 설정은 해당 폴더 종류 전체에 기본 적용됩니다. 개별 파일에서 수정 가능합니다.</div>
                </div>
                <PermissionCard>
                  <PermissionCardHeader>
                    <AppTypography variant="BODY1_500" color="TEXT_STRONG"><span style={{ marginRight: 6, display: 'inline-flex' }}><AppIcon name="file" size={16} fillColor="ICON_PRIMARY" /></span> {selectedFolder}</AppTypography>
                    <span style={{ fontSize: 12, color: COLOR.GRAY70 }}>업로드 담당: 컨설팅팀</span>
                  </PermissionCardHeader>
                  <PermissionTable>
                    <thead>
                      <tr>
                        <th>팀/역할</th>
                        <th>업로드·쓰기</th>
                        <th>읽기</th>
                        <th>다운로드</th>
                        <th>삭제·이동</th>
                      </tr>
                    </thead>
                    <tbody>
                      {FOLDER_PERMISSIONS.map((perm, i) => (
                        <tr key={i} style={perm.teamName === '컨설팅팀' ? { background: '#e6f4ea' } : {}}>
                          <td style={{ fontWeight: 500 }}>{perm.teamName} {perm.teamName === '컨설팅팀' && <SmallBadge>담당팀</SmallBadge>}</td>
                          <td><Checkbox defaultChecked={perm.canUpload} /></td>
                          <td><Checkbox defaultChecked={perm.canRead} /></td>
                          <td><Checkbox defaultChecked={perm.canDownload} /></td>
                          <td><Checkbox defaultChecked={perm.canDelete} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </PermissionTable>
                </PermissionCard>
                <div style={{ fontSize: 12, color: COLOR.GRAY60, marginTop: 12 }}>* 삭제·이동 권한은 담당자와 팀장에게만 부여됩니다.</div>
              </PermissionMain>
            </PermissionLayout>
          </PageWrapper>
        );

      default:
        return null;
    }
  };

  // 선택된 파일 이름 가져오기
  const getSelectedFileNames = () => {
    return MOCK_FILES.filter(f => selectedFiles.includes(f.id)).map(f => f.name);
  };

  // 공유 멤버 추가
  const handleAddShareMember = () => {
    if (shareEmail && shareEmail.includes('@')) {
      const name = shareEmail.split('@')[0];
      setSharedMembers(prev => [...prev, {
        id: `m${Date.now()}`,
        name: name,
        email: shareEmail,
        permission: 'view'
      }]);
      setShareEmail('');
    }
  };

  // 공유 멤버 삭제
  const handleRemoveShareMember = (memberId: string) => {
    setSharedMembers(prev => prev.filter(m => m.id !== memberId));
  };

  // 권한 변경
  const handlePermissionChange = (memberId: string, permission: string) => {
    setSharedMembers(prev => prev.map(m =>
      m.id === memberId ? { ...m, permission } : m
    ));
  };

  return (
    <PageContainer>
      {renderContent()}

      {/* 파일 공유 모달 */}
      <AppModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="파일 공유"
        width={480}
      >
        <ModalSection>
          <ModalLabel>선택된 파일</ModalLabel>
          <SelectedFilesList>
            {getSelectedFileNames().map((name, idx) => (
              <SelectedFileTag key={idx}>
                <AppIcon name="file" size={12} fillColor="ICON_NEUTRAL" />
                {name}
              </SelectedFileTag>
            ))}
          </SelectedFilesList>
        </ModalSection>

        <ModalSection>
          <ModalLabel>공유 링크</ModalLabel>
          <ShareLinkBox>
            <ShareLink>https://certicos.com/share/abc123xyz...</ShareLink>
            <AppTextButton variant="SECONDARY" size="SMALL">복사</AppTextButton>
          </ShareLinkBox>
        </ModalSection>

        <ModalSection>
          <ModalLabel>멤버 추가</ModalLabel>
          <div style={{ display: 'flex', gap: 8 }}>
            <ModalInput
              type="email"
              placeholder="이메일 주소 입력"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddShareMember()}
            />
            <AppTextButton variant="PRIMARY" size="MEDIUM" onClick={handleAddShareMember}>추가</AppTextButton>
          </div>
        </ModalSection>

        <ModalSection>
          <ModalLabel>공유된 멤버 ({sharedMembers.length})</ModalLabel>
          <ShareMemberList>
            {sharedMembers.map(member => (
              <ShareMemberItem key={member.id}>
                <MemberAvatar>{member.name.charAt(0)}</MemberAvatar>
                <MemberInfo>
                  <MemberName>{member.name}</MemberName>
                  <MemberEmail>{member.email}</MemberEmail>
                </MemberInfo>
                <PermissionSelect
                  value={member.permission}
                  onChange={(e) => handlePermissionChange(member.id, e.target.value)}
                >
                  <option value="view">보기만</option>
                  <option value="edit">편집 가능</option>
                  <option value="download">다운로드 가능</option>
                </PermissionSelect>
                <AppIconButton icon="close" size="SMALL" onClick={() => handleRemoveShareMember(member.id)} />
              </ShareMemberItem>
            ))}
          </ShareMemberList>
        </ModalSection>

        <ModalFooter>
          <AppTextButton variant="SECONDARY" size="MEDIUM" onClick={() => setIsShareModalOpen(false)}>취소</AppTextButton>
          <AppTextButton variant="PRIMARY" size="MEDIUM" onClick={() => setIsShareModalOpen(false)}>공유하기</AppTextButton>
        </ModalFooter>
      </AppModal>

      {/* 파일 미리보기 */}
      <PreviewOverlay $isOpen={isPreviewOpen}>
        {previewFile && (
          <PreviewContainer>
            <PreviewHeader>
              <PreviewFileName>
                {getFileIcon(previewFile.type)}
                {previewFile.name}
              </PreviewFileName>
              <PreviewHeaderActions>
                <PreviewHeaderBtn>
                  <AppIcon name="download" size={16} fillColor="TEXT_WHITE" />
                  다운로드
                </PreviewHeaderBtn>
                <PreviewHeaderBtn onClick={() => { setIsPreviewOpen(false); setSelectedFiles([previewFile.id]); setIsShareModalOpen(true); }}>
                  <AppIcon name="share" size={16} fillColor="TEXT_WHITE" />
                  공유
                </PreviewHeaderBtn>
                <PreviewPageInfo>1 / 3 페이지</PreviewPageInfo>
                <PreviewHeaderBtn onClick={() => { setIsPreviewOpen(false); setPreviewFile(null); }} style={{ marginLeft: 8 }}>
                  <AppIcon name="close" size={16} fillColor="TEXT_WHITE" />
                </PreviewHeaderBtn>
              </PreviewHeaderActions>
            </PreviewHeader>

            <PreviewLayout>
              <PreviewMain>
                {/* 이미지 미리보기 */}
                {(previewFile.type === 'jpg' || previewFile.type === 'png') && (
                  <PreviewImage src="https://via.placeholder.com/800x600/f0f0f0/666?text=Product+Image+Preview" alt={previewFile.name} />
                )}

                {/* PDF/문서 스켈레톤 미리보기 */}
                {(previewFile.type === 'pdf' || previewFile.type === 'xlsx') && (
                  <PDFSkeleton>
                    <SkeletonLine $width="50%" $height={16} $dark />
                    <div style={{ height: 20 }} />
                    <SkeletonLine $width="100%" />
                    <SkeletonLine $width="70%" />
                    <SkeletonLine $width="45%" />
                    <div style={{ height: 16 }} />
                    <SkeletonLine $width="100%" />
                    <SkeletonLine $width="85%" />
                    <SkeletonLine $width="60%" />
                    <SkeletonLine $width="40%" />
                    <div style={{ height: 16 }} />
                    <SkeletonLine $width="100%" />
                    <SkeletonLine $width="75%" />
                    <SkeletonBlock>
                      <SkeletonLine $width="60%" $dark />
                      <SkeletonLine $width="80%" />
                      <SkeletonLine $width="70%" />
                      <SkeletonLine $width="50%" />
                    </SkeletonBlock>
                    <SkeletonLine $width="100%" />
                    <SkeletonLine $width="90%" />
                    <SkeletonLine $width="55%" />
                  </PDFSkeleton>
                )}
              </PreviewMain>

              <PreviewSidebar>
                {/* 파일 정보 */}
                <PreviewSidebarSection>
                  <PreviewSidebarTitle>파일 정보</PreviewSidebarTitle>
                  <PreviewInfoRow>
                    <PreviewInfoLabel>파일명</PreviewInfoLabel>
                    <PreviewInfoValue>{previewFile.name}</PreviewInfoValue>
                  </PreviewInfoRow>
                  <PreviewInfoRow>
                    <PreviewInfoLabel>크기</PreviewInfoLabel>
                    <PreviewInfoValue>{previewFile.size}</PreviewInfoValue>
                  </PreviewInfoRow>
                  <PreviewInfoRow>
                    <PreviewInfoLabel>수정일</PreviewInfoLabel>
                    <PreviewInfoValue>{previewFile.date}</PreviewInfoValue>
                  </PreviewInfoRow>
                  <PreviewInfoRow>
                    <PreviewInfoLabel>업로더</PreviewInfoLabel>
                    <PreviewInfoValue>{previewFile.uploader || '-'}</PreviewInfoValue>
                  </PreviewInfoRow>
                  <PreviewInfoRow>
                    <PreviewInfoLabel>위치</PreviewInfoLabel>
                    <PreviewInfoValue>{selectedCompany?.nameKo} › 25년 1차 › 제품B</PreviewInfoValue>
                  </PreviewInfoRow>
                </PreviewSidebarSection>

                {/* Certicos 추출 결과 */}
                {previewFile.extractStatus && previewFile.extractStatus !== 'none' && (
                  <PreviewSidebarSection>
                    <PreviewSidebarTitle>Certicos 추출 결과</PreviewSidebarTitle>
                    <ExtractStatusBadge $status={previewFile.extractStatus === 'completed' ? 'completed' : 'failed'}>
                      <AppIcon name={previewFile.extractStatus === 'completed' ? 'check' : 'warning'} size={14} fillColor={previewFile.extractStatus === 'completed' ? 'STATE_SUCCESS' : 'STATE_ERROR'} />
                      {previewFile.extractStatus === 'completed' ? '추출 완료' : '추출 실패'}
                    </ExtractStatusBadge>

                    {previewFile.extractStatus === 'completed' && previewFile.extractData && (
                      <>
                        {/* 일반 추출 데이터 */}
                        {previewFile.extractData.productName && !previewFile.name.includes('ALLERGEN') && (
                          <>
                            <PreviewInfoRow>
                              <PreviewInfoLabel>제품명</PreviewInfoLabel>
                              <PreviewInfoValue>{previewFile.extractData.productName}</PreviewInfoValue>
                            </PreviewInfoRow>
                            <PreviewInfoRow>
                              <PreviewInfoLabel>고객사</PreviewInfoLabel>
                              <PreviewInfoValue>{previewFile.extractData.customer}</PreviewInfoValue>
                            </PreviewInfoRow>
                            {previewFile.extractData.amount && (
                              <PreviewInfoRow>
                                <PreviewInfoLabel>견적 금액</PreviewInfoLabel>
                                <PreviewInfoValue>{previewFile.extractData.amount}</PreviewInfoValue>
                              </PreviewInfoRow>
                            )}
                            <PreviewInfoRow>
                              <PreviewInfoLabel>견적 일자</PreviewInfoLabel>
                              <PreviewInfoValue>{previewFile.extractData.date}</PreviewInfoValue>
                            </PreviewInfoRow>
                          </>
                        )}

                        {/* 알러젠 추출 데이터 */}
                        {previewFile.name.includes('ALLERGEN') && (
                          <>
                            <PreviewInfoRow>
                              <PreviewInfoLabel>향료명</PreviewInfoLabel>
                              <PreviewInfoValue>{ALLERGEN_EXTRACT_DATA.fragranceName}</PreviewInfoValue>
                            </PreviewInfoRow>
                            <PreviewInfoRow>
                              <PreviewInfoLabel>공급사</PreviewInfoLabel>
                              <PreviewInfoValue>{ALLERGEN_EXTRACT_DATA.vendor}</PreviewInfoValue>
                            </PreviewInfoRow>
                            <PreviewInfoRow>
                              <PreviewInfoLabel>알러젠 타입</PreviewInfoLabel>
                              <PreviewInfoValue>Type {ALLERGEN_EXTRACT_DATA.allergenType}</PreviewInfoValue>
                            </PreviewInfoRow>
                            <div style={{ marginTop: 16 }}>
                              <PreviewInfoLabel style={{ marginBottom: 8 }}>알러젠 리스트 ({Object.keys(ALLERGEN_EXTRACT_DATA.allergenList).length}개)</PreviewInfoLabel>
                              <AllergenTable>
                                <AllergenHeader>
                                  <span>성분명</span>
                                  <span style={{ textAlign: 'right' }}>함량 (%)</span>
                                </AllergenHeader>
                                {Object.entries(ALLERGEN_EXTRACT_DATA.allergenList).map(([name, value]) => (
                                  <AllergenRow key={name}>
                                    <AllergenName>{name}</AllergenName>
                                    <AllergenValue>{value}</AllergenValue>
                                  </AllergenRow>
                                ))}
                              </AllergenTable>
                            </div>
                          </>
                        )}
                      </>
                    )}

                    {previewFile.extractStatus === 'failed' && (
                      <div style={{ fontSize: 13, color: COLOR.GRAY70 }}>
                        파일 형식이 지원되지 않거나 내용을 읽을 수 없습니다.
                      </div>
                    )}

                    <CerticosButton>Certicos에서 확인 →</CerticosButton>
                  </PreviewSidebarSection>
                )}
              </PreviewSidebar>
            </PreviewLayout>
          </PreviewContainer>
        )}
      </PreviewOverlay>

      {/* 파일 이동 모달 */}
      <AppModal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        title="파일 이동"
        width={420}
      >
        <ModalSection>
          <ModalLabel>이동할 파일</ModalLabel>
          <SelectedFilesList>
            {getSelectedFileNames().map((name, idx) => (
              <SelectedFileTag key={idx}>
                <AppIcon name="file" size={12} fillColor="ICON_NEUTRAL" />
                {name}
              </SelectedFileTag>
            ))}
          </SelectedFilesList>
        </ModalSection>

        <ModalSection>
          <ModalLabel>이동할 위치 선택</ModalLabel>
          <FolderTree>
            {folderStructure.map(folder => (
              <FolderTreeItem
                key={folder.id}
                $depth={folder.depth}
                $selected={moveFolderTarget === folder.id}
                onClick={() => setMoveFolderTarget(folder.id)}
              >
                <AppIcon
                  name={folder.depth === 0 ? 'folder' : 'folderOpen'}
                  size={16}
                  fillColor={moveFolderTarget === folder.id ? 'ICON_PRIMARY' : 'ICON_NEUTRAL'}
                />
                {folder.name}
                {moveFolderTarget === folder.id && (
                  <span style={{ marginLeft: 'auto' }}><AppIcon name="check" size={14} fillColor="ICON_PRIMARY" /></span>
                )}
              </FolderTreeItem>
            ))}
          </FolderTree>
        </ModalSection>

        <ModalFooter>
          <AppTextButton variant="SECONDARY" size="MEDIUM" onClick={() => setIsMoveModalOpen(false)}>취소</AppTextButton>
          <AppTextButton
            variant="PRIMARY"
            size="MEDIUM"
            onClick={() => {
              setIsMoveModalOpen(false);
              setMoveFolderTarget(null);
            }}
            disabled={!moveFolderTarget}
          >
            이동하기
          </AppTextButton>
        </ModalFooter>
      </AppModal>
    </PageContainer>
  );
}

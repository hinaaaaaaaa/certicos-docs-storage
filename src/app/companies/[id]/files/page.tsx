'use client';

import React from 'react';
import styled from 'styled-components';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  COLOR,
  AppTypography,
  AppIcon,
  AppTextButton,
  AppIconButton,
  AppSelect,
  AppBreadcrumb,
  AppPagination,
} from '@/design-system';
import AppDrawer from '@/design-system/components/AppDrawer';

// Types
interface FileData {
  id: string;
  name: string;
  size: string;
  date: string;
  uploader: string;
  type: string;
  isDeleted?: boolean;
  deletedAt?: string;
  status?: 'required' | 'completed';
  extractStatus?: 'completed' | 'failed' | 'none' | 'extracting';
  extractData?: ExtractedData;
  isFolder?: boolean;
}

interface ExtractedData {
  type: 'quote' | 'allergen';
  // 견적서 데이터
  productName?: string;
  productCode?: string;
  customer?: string;
  quoteAmount?: string;
  quoteDate?: string;
  consultant?: string;
  // 알러젠 데이터
  vendor?: string;
  fragranceName?: string;
  allergenType?: string;
  allergenList?: Record<string, string>;
  documentDate?: string;
  usageLevel?: string;
}

interface UploadingFile {
  id: string;
  name: string;
  size: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

interface FolderNode {
  id: string;
  name: string;
  children?: FolderNode[];
}

interface FolderPermission {
  teamName: string;
  department: string;
  permissions: {
    upload: boolean;
    preview: boolean;
    download: boolean;
    delete: boolean;
    move: boolean;
  };
}

interface ExtractingFile {
  id: string;
  name: string;
  progress: number;
  status: 'extracting' | 'completed' | 'error';
}

interface Notification {
  id: string;
  type: 'upload' | 'share' | 'storage' | 'extract' | 'info';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

interface OrgUnit {
  id: string;
  name: string;
  type: 'division' | 'team';
  parent?: string;
  manager?: string;
}

interface SharedUser {
  id: string;
  name: string;
  email: string;
  permission: 'view' | 'download' | 'delete';
  sharedAt: string;
  notifyEmail: boolean;
  notifyInApp: boolean;
}

// Mock Data
interface CompanyInfo {
  name: string;
  consultant: string;
  documentManager: string;
  qualityManager: string;
}

const MOCK_COMPANIES: Record<string, CompanyInfo> = {
  '1': { name: '(주)화장품회사', consultant: '박컨설턴트', documentManager: '김서류담당', qualityManager: '이품질담당' },
  '2': { name: '(주)뷰티케어', consultant: '김컨설턴트', documentManager: '최서류담당', qualityManager: '정품질담당' },
  '3': { name: '(주)스킨랩', consultant: '박컨설턴트', documentManager: '한서류담당', qualityManager: '조품질담당' },
};

const MOCK_FOLDERS: FolderNode[] = [
  {
    id: '1',
    name: '25년 1차',
    children: [
      {
        id: '1-1',
        name: '제품A',
        children: [
          { id: '1-1-1', name: '견적서/의뢰서' },
          { id: '1-1-2', name: '취합 서류' },
          { id: '1-1-3', name: 'PIF' },
          { id: '1-1-4', name: '해외 인허가 등록증' },
          { id: '1-1-5', name: 'QCQA' },
          { id: '1-1-6', name: '기타' },
        ],
      },
      {
        id: '1-2',
        name: '제품B',
        children: [
          { id: '1-2-1', name: '견적서/의뢰서' },
          { id: '1-2-2', name: 'PIF' },
        ],
      },
    ],
  },
  {
    id: '2',
    name: '24년 2차',
    children: [{ id: '2-1', name: '제품C', children: [] }],
  },
];

const INITIAL_FILES: FileData[] = [
  { id: 'f1', name: '견적서/의뢰서', size: '', date: '2026-03-10', uploader: '', type: 'FOLDER', isFolder: true, extractStatus: 'none' },
  { id: 'f2', name: 'PIF', size: '', date: '2026-03-08', uploader: '', type: 'FOLDER', isFolder: true, extractStatus: 'none' },
  {
    id: '1',
    name: '제품B_견적서_v2.pdf',
    size: '2.4 MB',
    date: '2026-03-14',
    uploader: '김담당',
    type: 'PDF',
    extractStatus: 'completed',
    extractData: {
      type: 'quote',
      productName: '제품B (ProductB-2000)',
      productCode: 'PB-2000',
      customer: '삼성메디칼',
      quoteAmount: '₩12,500,000',
      quoteDate: '2026-03-14',
      consultant: '김민준'
    }
  },
  { id: '2', name: '의뢰서_삼성메디칼.xlsx', size: '512 KB', date: '2026-03-11', uploader: '이매니저', type: 'XLSX', extractStatus: 'failed' },
  { id: '3', name: '제품사진_001.jpg', size: '8.1 MB', date: '2026-03-09', uploader: '박컨설턴트', type: 'JPG', extractStatus: 'none' },
  { id: '4', name: '해외인허가_등록증.pdf', size: '1.2 MB', date: '2026-03-07', uploader: '김담당', type: 'PDF', extractStatus: 'none' },
  {
    id: '5',
    name: '성분분석표.pdf',
    size: '3.8 MB',
    date: '2026-03-06',
    uploader: '최연구원',
    type: 'PDF',
    extractStatus: 'completed',
    extractData: {
      type: 'quote',
      productName: '제품A (ProductA-1000)',
      productCode: 'PA-1000',
      customer: 'LG생활건강',
      quoteAmount: '₩8,750,000',
      quoteDate: '2026-03-06',
      consultant: '박민수'
    }
  },
  // 취합 서류 - 알러젠 리스트
  { id: 'f3', name: '취합 서류', size: '', date: '2026-03-12', uploader: '', type: 'FOLDER', isFolder: true, extractStatus: 'none' },
  {
    id: '6',
    name: 'ALLERGEN_코어인터네셔널_G.C자료_ORANGE_OIL.pdf',
    size: '1.8 MB',
    date: '2026-03-15',
    uploader: '최연구원',
    type: 'PDF',
    extractStatus: 'completed',
    extractData: {
      type: 'allergen',
      vendor: '㈜한빛향료',
      fragranceName: 'ORANGE OIL(GC)',
      allergenType: '81',
      allergenList: {
        'CITRAL': '0.037',
        'GERANIOL': '0.006',
        'LINALOOL': '0.434',
        'BENZYL BENZOATE': '0.003',
        'CITRONELLOL': '0.012',
        'LIMONENE': '95.311',
        'ALPHA-TERPINENE': '0.095',
        'TERPINOLENE': '0.010',
        'BETA-CARYOPHYLLENE': '0.016',
        'CARVONE': '0.044',
        'VANILLIN': '0.018',
        'PINENE': '0.523'
      }
    }
  },
  {
    id: '7',
    name: 'ALLERGEN_한국향료_LAVENDER_OIL.pdf',
    size: '2.1 MB',
    date: '2026-03-14',
    uploader: '박연구원',
    type: 'PDF',
    extractStatus: 'completed',
    extractData: {
      type: 'allergen',
      vendor: '㈜한국향료',
      fragranceName: 'LAVENDER OIL',
      allergenType: '26',
      allergenList: {
        'LINALOOL': '42.500',
        'LINALYL ACETATE': '38.200',
        'GERANIOL': '2.100',
        'LIMONENE': '0.850',
        'COUMARIN': '0.045'
      }
    }
  },
];

const MOCK_FOLDER_PERMISSIONS: Record<string, FolderPermission[]> = {
  '1-1-3': [
    { teamName: '데이터팀', department: '컨설팅본부', permissions: { upload: true, preview: true, download: true, delete: true, move: true } },
    { teamName: 'RA 1팀', department: '자동화솔루션본부', permissions: { upload: true, preview: true, download: true, delete: false, move: false } },
    { teamName: 'QCQA팀', department: '컨설팅본부', permissions: { upload: false, preview: true, download: true, delete: false, move: false } },
  ],
};

const MOCK_ORG_UNITS: OrgUnit[] = [
  { id: 'div1', name: '컨설팅본부', type: 'division', manager: '김본부장' },
  { id: 'div2', name: '자동화솔루션본부', type: 'division', manager: '박본부장' },
  { id: 'team1', name: '데이터팀', type: 'team', parent: 'div1', manager: '이팀장' },
  { id: 'team2', name: 'RA 1팀', type: 'team', parent: 'div2', manager: '최팀장' },
  { id: 'team3', name: 'QCQA팀', type: 'team', parent: 'div1', manager: '정팀장' },
];

const MOCK_SHARED_USERS: SharedUser[] = [
  { id: 'u1', name: '김외부', email: 'kim@partner.com', permission: 'view', sharedAt: '2026-03-10', notifyEmail: true, notifyInApp: true },
  { id: 'u2', name: '이고객', email: 'lee@client.co.kr', permission: 'download', sharedAt: '2026-03-08', notifyEmail: true, notifyInApp: false },
];

// 공유 수신자 목 데이터
interface ShareRecipient {
  id: string;
  name: string;
  type: 'team' | 'user';
  meta: string;
  permission: 'editor' | 'viewer' | 'download';
  isDefault?: boolean;
  avatarColor?: string;
}

const MOCK_SHARE_RECIPIENTS: ShareRecipient[] = [
  { id: 'sr1', name: '컨설팅팀 전체', type: 'team', meta: '폴더 기본 권한 · 멤버 12명', permission: 'editor', isDefault: true, avatarColor: '#4285F4' },
  { id: 'sr2', name: '김민준', type: 'user', meta: '컨설팅팀 · km@certicos.com', permission: 'editor', avatarColor: '#4285F4' },
  { id: 'sr3', name: 'RA 1팀 전체', type: 'team', meta: '폴더 기본 권한 · 멤버 8명', permission: 'viewer', isDefault: true, avatarColor: '#34A853' },
  { id: 'sr4', name: '박서준', type: 'user', meta: '데이터팀 · 개별 추가', permission: 'download', avatarColor: '#FBBC05' },
];

// 권한 매트릭스 목 데이터
interface TeamPermission {
  id: string;
  name: string;
  isAssigned?: boolean;
  permissions: {
    uploadWrite: boolean;
    read: boolean;
    download: boolean;
    deleteMove: boolean;
  };
}

const FOLDER_TYPES = ['견적서/의뢰서', '취합 서류', 'PIF', '해외 인허가 등록증', 'QCQA', '기타'];

const MOCK_TEAM_PERMISSIONS: TeamPermission[] = [
  { id: 't1', name: '관리 담당자', permissions: { uploadWrite: true, read: true, download: true, deleteMove: true } },
  { id: 't2', name: '관리 팀장', permissions: { uploadWrite: true, read: true, download: true, deleteMove: true } },
  { id: 't3', name: '컨설팅팀', isAssigned: true, permissions: { uploadWrite: true, read: true, download: true, deleteMove: false } },
  { id: 't4', name: '영업지원팀', permissions: { uploadWrite: true, read: true, download: true, deleteMove: false } },
  { id: 't5', name: 'RA팀 (1·2·3)', permissions: { uploadWrite: false, read: true, download: true, deleteMove: false } },
  { id: 't6', name: '데이터팀', permissions: { uploadWrite: false, read: true, download: true, deleteMove: false } },
  { id: 't7', name: 'QCQA팀', permissions: { uploadWrite: false, read: true, download: true, deleteMove: false } },
  { id: 't8', name: '기타 모든 팀', permissions: { uploadWrite: false, read: true, download: true, deleteMove: false } },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'storage', title: '저장 공간 부족 경고', message: '사용 가능한 저장 공간이 15% 남았습니다. 불필요한 파일을 정리해주세요.', time: '5분 전', isRead: false },
  { id: 'n2', type: 'share', title: '폴더 공유됨', message: '김외부님에게 PIF 폴더가 공유되었습니다.', time: '1시간 전', isRead: false },
  { id: 'n3', type: 'upload', title: '업로드 완료', message: 'PIF_제품A_v2.pdf 파일이 업로드되었습니다.', time: '2시간 전', isRead: true },
  { id: 'n4', type: 'extract', title: 'CertiPT 추출 완료', message: '성분분석표.pdf에서 데이터 추출이 완료되었습니다.', time: '어제', isRead: true },
];

const AVAILABLE_TAGS = ['PIF', 'QCQA', '견적서', '인허가', '성분분석', '안전성'];
const FILE_EXTENSIONS = ['PDF', 'XLSX', 'DOCX', 'JPG', 'PNG'];
const FILE_SIZE_OPTIONS = [
  { value: 'all', label: '전체 크기' },
  { value: 'small', label: '1MB 미만' },
  { value: 'medium', label: '1MB ~ 5MB' },
  { value: 'large', label: '5MB ~ 10MB' },
  { value: 'xlarge', label: '10MB 이상' },
];
const UPLOADERS = [
  { value: 'all', label: '전체' },
  { value: '김담당', label: '김담당' },
  { value: '이매니저', label: '이매니저' },
  { value: '박컨설턴트', label: '박컨설턴트' },
  { value: '최연구원', label: '최연구원' },
];

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: ${COLOR.BLUEGRAY10};
`;

const Header = styled.header`
  background: ${COLOR.WHITE};
  border-bottom: 1px solid ${COLOR.GRAY30};
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: none;
  border: 1px solid ${COLOR.GRAY30};
  border-radius: 6px;
  cursor: pointer;
  color: ${COLOR.GRAY80};
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    border-color: ${COLOR.PRIMARY60};
    color: ${COLOR.PRIMARY60};
  }
`;

const CompanyName = styled.div`
  margin-right: 8px;
`;

const CompanyInfoBar = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 16px;
  background: ${COLOR.BLUEGRAY10};
  border-radius: 8px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const InfoLabel = styled.span`
  font-size: 12px;
  color: ${COLOR.GRAY60};
`;

const InfoValue = styled.span`
  font-size: 13px;
  color: ${COLOR.GRAY90};
  font-weight: 500;
`;

const InfoDivider = styled.div`
  width: 1px;
  height: 16px;
  background: ${COLOR.GRAY30};
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const SearchWrapper = styled.div`
  margin-left: auto;
`;

const MainContent = styled.div`
  display: flex;
  height: calc(100vh - 57px);
`;

const Sidebar = styled.aside`
  width: 260px;
  background: ${COLOR.WHITE};
  border-right: 1px solid ${COLOR.GRAY30};
  padding: 16px 0;
  overflow-y: auto;
`;

const SidebarTitle = styled.div`
  padding: 0 16px 12px;
`;

const FolderItem = styled.div<{ $level: number; $selected?: boolean }>`
  padding: 8px 16px 8px ${({ $level }) => 16 + $level * 20}px;
  background: ${({ $selected }) => ($selected ? COLOR.PRIMARY10 : 'transparent')};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.15s ease;

  &:hover {
    background: ${({ $selected }) => ($selected ? COLOR.PRIMARY10 : COLOR.GRAY10)};
  }
`;

const ContentArea = styled.main`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
`;

const ContentHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 16px;
`;

// NEW: 상단 탭 및 액션 버튼 디자인 (이미지 참고)
const TabGroup = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
`;

const TabButton = styled.button<{ $active?: boolean }>`
  background: none;
  border: none;
  padding: 0 0 8px 0;
  font-size: 14px;
  font-weight: ${({ $active }) => $active ? 600 : 500};
  color: ${({ $active }) => $active ? COLOR.GRAY90 : COLOR.GRAY50};
  border-bottom: 2px solid ${({ $active }) => $active ? COLOR.GRAY90 : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: ${COLOR.GRAY90};
  }
`;

const TopActionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const LeftActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RightActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const WhiteButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.GRAY30};
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  color: ${COLOR.GRAY80};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${COLOR.GRAY10};
  }
`;

const NotificationBadgeSmall = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${COLOR.PRIMARY60};
  color: ${COLOR.WHITE};
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: -2px;
  margin-right: 2px;
`;

const PaginationWrapper = styled.div`
  margin-top: 24px;
`;

const FilterPanel = styled.div`
  background: ${COLOR.WHITE};
  border-bottom: 1px solid ${COLOR.GRAY30};
  padding: 16px 24px;
`;

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
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

  &:hover {
    color: ${COLOR.PRIMARY60};
  }
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

const HighlightedText = styled.span`
  background: ${COLOR.YELLOW20};
  padding: 0 2px;
  border-radius: 2px;
`;

// 자동완성 검색
const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
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

const AutocompleteFileIcon = styled.div`
  width: 28px;
  height: 28px;
  background: ${COLOR.PRIMARY10};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 600;
  color: ${COLOR.PRIMARY60};
`;

const AutocompleteInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const AutocompleteFileName = styled.div`
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

const UploadZone = styled.div<{ $isDragging?: boolean }>`
  border: 2px dashed ${({ $isDragging }) => ($isDragging ? COLOR.PRIMARY60 : COLOR.GRAY30)};
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 16px;
  background: ${({ $isDragging }) => ($isDragging ? COLOR.PRIMARY10 : COLOR.WHITE)};
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${COLOR.PRIMARY60};
    background: ${COLOR.PRIMARY10};
  }
`;

const UploadZoneContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const UploadingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${COLOR.BLUEGRAY10};
  border-radius: 8px;
  margin-bottom: 8px;
`;

const UploadingFileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UploadingFileName = styled.div`
  font-size: 14px;
  color: ${COLOR.GRAY90};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UploadingFileMeta = styled.div`
  font-size: 12px;
  color: ${COLOR.GRAY60};
  margin-top: 2px;
`;

const ProgressBarWrapper = styled.div`
  flex: 0 0 200px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 6px;
  background: ${COLOR.GRAY30};
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $progress: number; $status: string }>`
  height: 100%;
  width: ${({ $progress }) => $progress}%;
  background: ${({ $status }) =>
    $status === 'error' ? COLOR.RED60 :
    $status === 'completed' ? COLOR.GREEN50 :
    COLOR.PRIMARY60};
  border-radius: 3px;
  transition: width 0.3s ease;
`;

const ProgressText = styled.span<{ $status: string }>`
  font-size: 12px;
  min-width: 45px;
  text-align: right;
  color: ${({ $status }) =>
    $status === 'error' ? COLOR.RED60 :
    $status === 'completed' ? COLOR.GREEN50 :
    COLOR.GRAY70};
`;

const UploadingList = styled.div`
  margin-bottom: 16px;
`;

// Folder Action Styles
const FolderActions = styled.div`
  margin-left: auto;
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s ease;
`;

const FolderItemWrapper = styled.div`
  display: flex;
  align-items: center;

  &:hover ${FolderActions} {
    opacity: 1;
  }
`;

const FolderActionBtn = styled.button`
  padding: 4px;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${COLOR.GRAY20};
  }
`;

// Permission Drawer Styles
const PermissionSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${COLOR.GRAY20};
`;

const OrgUnitCard = styled.div<{ $level: number }>`
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.GRAY30};
  border-radius: 8px;
  margin-bottom: 8px;
  margin-left: ${({ $level }) => $level * 16}px;
`;

const OrgUnitHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  cursor: pointer;

  &:hover {
    background: ${COLOR.GRAY10};
  }
`;

const OrgUnitInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const OrgTypeBadge = styled.span<{ $type: 'division' | 'team' }>`
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  background: ${({ $type }) => $type === 'division' ? COLOR.PRIMARY10 : COLOR.BLUEGRAY20};
  color: ${({ $type }) => $type === 'division' ? COLOR.PRIMARY60 : COLOR.GRAY70};
`;

const ManagerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${COLOR.GRAY60};
`;

const OrgPermissionSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const PermissionSelect = styled.select`
  padding: 4px 8px;
  border: 1px solid ${COLOR.GRAY30};
  border-radius: 4px;
  font-size: 12px;
  color: ${COLOR.GRAY80};
  background: ${COLOR.WHITE};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${COLOR.PRIMARY60};
  }
`;

const UserShareSection = styled.div`
  margin-top: 24px;
`;

const UserSearchWrapper = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const UserSearchInput = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: 1px solid ${COLOR.GRAY30};
  border-radius: 6px;
  font-size: 14px;
  color: ${COLOR.GRAY90};

  &::placeholder {
    color: ${COLOR.GRAY50};
  }

  &:focus {
    outline: none;
    border-color: ${COLOR.PRIMARY60};
  }
`;

const SharedUserCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.GRAY30};
  border-radius: 8px;
  margin-bottom: 8px;
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${COLOR.PRIMARY10};
  color: ${COLOR.PRIMARY60};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${COLOR.GRAY90};
`;

const UserEmail = styled.div`
  font-size: 12px;
  color: ${COLOR.GRAY60};
  margin-top: 2px;
`;

const UserPermission = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
`;

const NotifyWrapper = styled.div`
  display: flex;
  gap: 8px;
`;

const NotifyToggle = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  border: none;
  background: ${({ $active }) => ($active ? COLOR.PRIMARY10 : COLOR.GRAY10)};
  color: ${({ $active }) => ($active ? COLOR.PRIMARY60 : COLOR.GRAY60)};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ $active }) => ($active ? COLOR.PRIMARY20 : COLOR.GRAY20)};
  }
`;

const SharedAtText = styled.span`
  font-size: 11px;
  color: ${COLOR.GRAY50};
`;

const RemoveUserBtn = styled.button`
  padding: 4px;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${COLOR.RED60}10;
  }
`;

// Notification Styles
const NotifBellWrapper = styled.div`
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

const PermissionTeamCard = styled.div`
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.GRAY30};
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
`;

const PermissionTeamHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: ${COLOR.GRAY10};
  border-bottom: 1px solid ${COLOR.GRAY20};
`;

const PermissionTeamInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TeamBadge = styled.span`
  font-size: 11px;
  padding: 2px 8px;
  background: ${COLOR.PRIMARY10};
  color: ${COLOR.PRIMARY60};
  border-radius: 4px;
`;

const PermissionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  padding: 12px 16px;
`;

const PermissionItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const PermissionCheck = styled.div<{ $active: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: ${({ $active }) => ($active ? COLOR.GREEN50 : COLOR.GRAY30)};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PermissionLabel = styled.span`
  font-size: 11px;
  color: ${COLOR.GRAY70};
`;

// Share Modal Styles
const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const ShareModalContainer = styled.div`
  background: ${COLOR.WHITE};
  border-radius: 16px;
  width: 520px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
`;

const ShareModalHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px 24px 16px;
`;

const ShareModalTitle = styled.div``;

const ShareModalClose = styled.button`
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${COLOR.GRAY10};
  }
`;

const ShareModalBody = styled.div`
  padding: 0 24px 24px;
  overflow-y: auto;
  max-height: calc(90vh - 200px);
`;

const ShareInfoBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: ${COLOR.PRIMARY10};
  border-radius: 8px;
  margin-bottom: 16px;
`;

const ShareSearchWrapper = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
`;

const ShareSearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid ${COLOR.GRAY30};
  border-radius: 8px;
  font-size: 14px;
  color: ${COLOR.GRAY90};

  &::placeholder {
    color: ${COLOR.GRAY50};
  }

  &:focus {
    outline: none;
    border-color: ${COLOR.PRIMARY60};
  }
`;

const ShareButton = styled.button`
  padding: 12px 24px;
  background: ${COLOR.PRIMARY60};
  border: none;
  border-radius: 8px;
  color: ${COLOR.WHITE};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: ${COLOR.PRIMARY70};
  }
`;

const ShareSectionTitle = styled.div`
  font-size: 13px;
  color: ${COLOR.GRAY60};
  margin-bottom: 12px;
`;

const ShareRecipientList = styled.div`
  border: 1px solid ${COLOR.GRAY20};
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
`;

const ShareRecipientItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid ${COLOR.GRAY20};

  &:last-child {
    border-bottom: none;
  }
`;

const RecipientAvatar = styled.div<{ $color?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ $color }) => $color || COLOR.PRIMARY60};
  color: ${COLOR.WHITE};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
`;

const RecipientInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const RecipientName = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${COLOR.GRAY90};
`;

const DefaultBadge = styled.span`
  font-size: 11px;
  padding: 2px 6px;
  background: ${COLOR.PRIMARY10};
  color: ${COLOR.PRIMARY60};
  border-radius: 4px;
`;

const RecipientMeta = styled.div`
  font-size: 12px;
  color: ${COLOR.GRAY60};
  margin-top: 2px;
`;

const PermissionDropdown = styled.select`
  padding: 8px 12px;
  border: 1px solid ${COLOR.GRAY30};
  border-radius: 6px;
  font-size: 13px;
  color: ${COLOR.GRAY80};
  background: ${COLOR.WHITE};
  cursor: pointer;
  min-width: 130px;

  &:focus {
    outline: none;
    border-color: ${COLOR.PRIMARY60};
  }
`;

const LinkShareSection = styled.div`
  padding-top: 20px;
  border-top: 1px solid ${COLOR.GRAY20};
`;

const LinkShareHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const LinkShareToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ToggleSwitch = styled.button<{ $active?: boolean }>`
  width: 44px;
  height: 24px;
  border-radius: 12px;
  border: none;
  background: ${({ $active }) => ($active ? COLOR.PRIMARY60 : COLOR.GRAY30)};
  cursor: pointer;
  position: relative;
  transition: background 0.2s ease;

  &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${COLOR.WHITE};
    top: 2px;
    left: ${({ $active }) => ($active ? '22px' : '2px')};
    transition: left 0.2s ease;
  }
`;

const CopyLinkBtn = styled.button`
  padding: 8px 16px;
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.GRAY30};
  border-radius: 6px;
  color: ${COLOR.GRAY80};
  font-size: 13px;
  cursor: pointer;

  &:hover {
    background: ${COLOR.GRAY10};
  }
`;

const LinkUrlBox = styled.div`
  padding: 12px 16px;
  background: ${COLOR.GRAY10};
  border-radius: 8px;
  font-size: 13px;
  color: ${COLOR.GRAY60};
  margin-bottom: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LinkOptions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LinkOptionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: ${COLOR.GRAY70};
`;

const ShareModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid ${COLOR.GRAY20};
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.GRAY30};
  border-radius: 8px;
  color: ${COLOR.GRAY80};
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background: ${COLOR.GRAY10};
  }
`;

const ConfirmButton = styled.button`
  padding: 10px 24px;
  background: ${COLOR.PRIMARY60};
  border: none;
  border-radius: 8px;
  color: ${COLOR.WHITE};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: ${COLOR.PRIMARY70};
  }
`;

// Permission Page Styles (Full Screen)
const PermissionPageOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: ${COLOR.WHITE};
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  flex-direction: column;
  z-index: 2000;
`;

const PermissionPageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid ${COLOR.GRAY30};
  background: ${COLOR.WHITE};
`;

const PermissionPageTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PermissionPageBody = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const PermissionSidebar = styled.div`
  width: 240px;
  border-right: 1px solid ${COLOR.GRAY30};
  background: ${COLOR.WHITE};
  overflow-y: auto;
  padding: 16px 0;
`;

const PermissionSidebarTitle = styled.div`
  padding: 0 16px 12px;
  font-size: 12px;
  color: ${COLOR.GRAY60};
  font-weight: 500;
`;

const PermissionFolderItem = styled.div<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  cursor: pointer;
  background: ${({ $selected }) => ($selected ? COLOR.PRIMARY10 : 'transparent')};
  color: ${({ $selected }) => ($selected ? COLOR.PRIMARY60 : COLOR.GRAY90)};

  &:hover {
    background: ${({ $selected }) => ($selected ? COLOR.PRIMARY10 : COLOR.GRAY10)};
  }
`;

const PermissionMainArea = styled.div`
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
  background: ${COLOR.BLUEGRAY10};
`;

const PermissionMainHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const PermissionMainTitle = styled.div``;

const PermissionTableContainer = styled.div`
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.GRAY30};
  border-radius: 8px;
  overflow: hidden;
`;

const PermissionTableHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: ${COLOR.WHITE};
  border-bottom: 1px solid ${COLOR.GRAY30};
`;

const PermissionTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const PermissionThead = styled.thead`
  background: ${COLOR.GRAY10};
`;

const PermissionTh = styled.th`
  padding: 14px 20px;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  color: ${COLOR.GRAY70};
  border-bottom: 1px solid ${COLOR.GRAY30};

  &:first-child {
    text-align: left;
  }
`;

const PermissionTbody = styled.tbody``;

const PermissionTr = styled.tr<{ $highlighted?: boolean }>`
  background: ${({ $highlighted }) => ($highlighted ? '#E8F5E9' : COLOR.WHITE)};

  &:hover {
    background: ${({ $highlighted }) => ($highlighted ? '#E8F5E9' : COLOR.GRAY10)};
  }
`;

const PermissionTd = styled.td`
  padding: 14px 20px;
  text-align: center;
  font-size: 14px;
  color: ${COLOR.GRAY90};
  border-bottom: 1px solid ${COLOR.GRAY20};

  &:first-child {
    text-align: left;
  }
`;

const TeamNameCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AssignedBadge = styled.span`
  font-size: 11px;
  padding: 2px 8px;
  background: ${COLOR.PRIMARY10};
  color: ${COLOR.PRIMARY60};
  border-radius: 4px;
`;

const PermissionCheckbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: ${COLOR.PRIMARY60};
`;

const SaveButton = styled.button`
  padding: 10px 24px;
  background: ${COLOR.PRIMARY60};
  border: none;
  border-radius: 8px;
  color: ${COLOR.WHITE};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: ${COLOR.PRIMARY70};
  }
`;

const SettingsButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.GRAY30};
  border-radius: 6px;
  color: ${COLOR.GRAY80};
  font-size: 13px;
  cursor: pointer;

  &:hover {
    border-color: ${COLOR.PRIMARY60};
    color: ${COLOR.PRIMARY60};
  }
`;

// Trash Styles
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

const TrashInfo = styled.div`
  background: ${COLOR.GRAY10};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TableContainer = styled.div`
  background: ${COLOR.WHITE};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Thead = styled.thead`
  border-bottom: 1px solid ${COLOR.GRAY20};
  border-top: 1px solid ${COLOR.GRAY20};
`;

const Th = styled.th`
  padding: 16px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 500;
  color: ${COLOR.GRAY90};
  white-space: nowrap;
`;

const Tbody = styled.tbody``;

const Tr = styled.tr`
  &:hover {
    background: ${COLOR.GRAY10};
  }
`;

const Td = styled.td`
  padding: 16px 16px;
  font-size: 13px;
  color: ${COLOR.GRAY70};
  border-bottom: 1px solid ${COLOR.GRAY20};
  vertical-align: middle;
`;

const FileIcon = styled.div`
  width: 32px;
  height: 32px;
  background: ${COLOR.PRIMARY10};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  color: ${COLOR.PRIMARY60};
`;

const FileNameCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatusBadge = styled.span<{ $status: 'required' | 'completed' }>`
  color: ${({ $status }) => $status === 'required' ? '#E67E22' : COLOR.GRAY70};
  font-weight: ${({ $status }) => $status === 'required' ? 500 : 400};
`;

const ExtractButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: ${COLOR.PRIMARY10};
  border: 1px solid ${COLOR.PRIMARY60};
  border-radius: 4px;
  color: ${COLOR.PRIMARY60};
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: ${COLOR.PRIMARY60};
    color: ${COLOR.WHITE};
  }
`;

const ExtractingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${COLOR.PRIMARY10};
  border: 1px solid ${COLOR.PRIMARY60};
  border-radius: 8px;
  margin-bottom: 8px;
`;

const ActionMenu = styled.div`
  position: relative;
`;

const ActionDropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.GRAY30};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 120px;
  z-index: 100;
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
`;

const ActionItem = styled.button`
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  text-align: left;
  font-size: 14px;
  color: ${COLOR.GRAY90};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: ${COLOR.GRAY10};
  }

  &:first-child {
    border-radius: 8px 8px 0 0;
  }

  &:last-child {
    border-radius: 0 0 8px 8px;
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

// Selection & Bulk Action Styles
const BulkActionBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${COLOR.YELLOW20};
  border-bottom: 1px solid ${COLOR.YELLOW50};
`;

const SelectionCount = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${COLOR.GRAY90};
  padding-right: 12px;
  border-right: 1px solid ${COLOR.GRAY30};
`;

const BulkButton = styled.button<{ $variant?: 'primary' | 'danger' | 'default' }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  ${({ $variant }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: ${COLOR.WHITE};
          border: 1px solid ${COLOR.PRIMARY60};
          color: ${COLOR.PRIMARY60};
          &:hover { background: ${COLOR.PRIMARY10}; }
        `;
      case 'danger':
        return `
          background: ${COLOR.WHITE};
          border: 1px solid ${COLOR.RED60};
          color: ${COLOR.RED60};
          &:hover { background: ${COLOR.RED60}10; }
        `;
      default:
        return `
          background: ${COLOR.WHITE};
          border: 1px solid ${COLOR.GRAY30};
          color: ${COLOR.GRAY80};
          &:hover { background: ${COLOR.GRAY10}; }
        `;
    }
  }}
`;

const ClearSelectionBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: none;
  border: none;
  color: ${COLOR.GRAY70};
  font-size: 13px;
  cursor: pointer;
  margin-left: auto;

  &:hover {
    color: ${COLOR.GRAY90};
  }
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: ${COLOR.PRIMARY60};
`;

// Extraction Status Badge (Redesigned as simple text like the image)
const ExtractBadgeText = styled.span<{ $status: 'completed' | 'failed' | 'none' | 'extracting' }>`
  font-size: 13px;
  
  ${({ $status }) => {
    switch ($status) {
      case 'completed':
        return `color: ${COLOR.GRAY70};`;
      case 'failed':
      case 'none':
        return `color: ${COLOR.RED60};`;
      case 'extracting':
        return `color: ${COLOR.PRIMARY60};`;
      default:
        return `color: ${COLOR.GRAY60};`;
    }
  }}
`;

// Expanded Extraction Details
const ExtractDetailsRow = styled.tr`
  background: ${COLOR.WHITE};
`;

const ExtractDetailsCell = styled.td`
  padding: 0;
  border-bottom: 1px solid ${COLOR.GRAY20};
`;

const ExtractDetailsContent = styled.div`
  padding: 20px 24px;
  background: ${COLOR.WHITE};
  border-left: 4px solid ${COLOR.PRIMARY60};
`;

const ExtractDetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 16px;
`;

const ExtractDetailItem = styled.div``;

const ExtractDetailLabel = styled.div`
  font-size: 12px;
  color: ${COLOR.GRAY60};
  margin-bottom: 4px;
`;

const ExtractDetailValue = styled.div`
  font-size: 14px;
  color: ${COLOR.GRAY90};
  font-weight: 500;
`;

// 알러젠 리스트 스타일
const AllergenListContainer = styled.div`
  display: flex;
  gap: 32px;
`;

const AllergenInfoSection = styled.div`
  min-width: 200px;
`;

const AllergenTableSection = styled.div`
  flex: 1;
`;

const AllergenTable = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  background: ${COLOR.GRAY10};
  border-radius: 8px;
  padding: 12px;
`;

const AllergenItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 6px 10px;
  background: ${COLOR.WHITE};
  border-radius: 4px;
  font-size: 12px;
`;

const AllergenName = styled.span`
  color: ${COLOR.GRAY70};
`;

const AllergenValue = styled.span`
  font-weight: 600;
  color: ${COLOR.GRAY90};
`;

const AllergenTypeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: ${COLOR.PRIMARY10};
  color: ${COLOR.PRIMARY60};
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const ExtractDetailActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${COLOR.GRAY20};
`;

const CerticosLink = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.PRIMARY60};
  border-radius: 6px;
  color: ${COLOR.PRIMARY60};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: ${COLOR.PRIMARY10};
  }
`;

const ExtractNote = styled.span`
  font-size: 12px;
  color: ${COLOR.GRAY50};
`;

// Row Action Icons
const RowActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const RowActionBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: ${COLOR.GRAY60};

  &:hover {
    background: ${COLOR.GRAY10};
    color: ${COLOR.GRAY90};
  }
`;

const TableRowSelected = styled.tr<{ $selected?: boolean }>`
  background: ${({ $selected }) => ($selected ? COLOR.PRIMARY10 : COLOR.WHITE)};
  transition: background 0.15s ease;

  &:hover {
    background: ${({ $selected }) => ($selected ? COLOR.PRIMARY10 : COLOR.GRAY10)};
  }
`;

// Component
export default function FileListPage() {
  const [activeTab, setActiveTab] = useState('전체');
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  const companyInfo = MOCK_COMPANIES[companyId] || { name: '회사명', consultant: '-', documentManager: '-', qualityManager: '-' };
  const companyName = companyInfo.name;

  const [selectedFolder, setSelectedFolder] = useState('1-1-3');
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['1', '1-1']);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedExtensions, setSelectedExtensions] = useState<string[]>([]);
  const [uploaderFilter, setUploaderFilter] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [sizeFilter, setSizeFilter] = useState<string>('all');
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const [autocompleteIndex, setAutocompleteIndex] = useState(-1);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<FileData[]>(INITIAL_FILES);
  const [trashedFiles, setTrashedFiles] = useState<FileData[]>([]);
  const [isTrashView, setIsTrashView] = useState(false);
  const [isPermissionDrawerOpen, setIsPermissionDrawerOpen] = useState(false);
  const [selectedFolderForPermission, setSelectedFolderForPermission] = useState<string>('');
  const [extractingFiles, setExtractingFiles] = useState<ExtractingFile[]>([]);

  // 파일 선택 상태
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [expandedFileId, setExpandedFileId] = useState<string | null>(null);

  // 공유 모달 상태
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareTargetName, setShareTargetName] = useState('');
  const [shareRecipients, setShareRecipients] = useState<ShareRecipient[]>(MOCK_SHARE_RECIPIENTS);
  const [shareSearchValue, setShareSearchValue] = useState('');
  const [isLinkShareEnabled, setIsLinkShareEnabled] = useState(true);
  const [linkExpiry, setLinkExpiry] = useState('7');
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);

  // 권한 설정 페이지 상태
  const [isPermissionPageOpen, setIsPermissionPageOpen] = useState(false);
  const [selectedPermissionFolder, setSelectedPermissionFolder] = useState('견적서/의뢰서');
  const [teamPermissions, setTeamPermissions] = useState<TeamPermission[]>(MOCK_TEAM_PERMISSIONS);

  const [orgPermissions, setOrgPermissions] = useState<Record<string, 'none' | 'view' | 'download' | 'delete'>>({
    'div1': 'view',
    'team1': 'download',
    'team3': 'view',
  });
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>(MOCK_SHARED_USERS);
  const [userSearchValue, setUserSearchValue] = useState('');
  const [expandedOrgs, setExpandedOrgs] = useState<string[]>(['div1', 'div2']);

  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleExtensionToggle = (ext: string) => {
    setSelectedExtensions((prev) =>
      prev.includes(ext) ? prev.filter((e) => e !== ext) : [...prev, ext]
    );
  };

  const handleClearFilters = () => {
    setSelectedExtensions([]);
    setUploaderFilter('all');
    setSelectedTags([]);
    setDateFrom('');
    setDateTo('');
    setSizeFilter('all');
    setSearchValue('');
  };

  // 파일 크기 파싱 (KB/MB -> bytes)
  const parseFileSize = (sizeStr: string): number => {
    const match = sizeStr.match(/^([\d.]+)\s*(KB|MB|GB)?$/i);
    if (!match) return 0;
    const num = parseFloat(match[1]);
    const unit = (match[2] || 'B').toUpperCase();
    if (unit === 'KB') return num * 1024;
    if (unit === 'MB') return num * 1024 * 1024;
    if (unit === 'GB') return num * 1024 * 1024 * 1024;
    return num;
  };

  // 자동완성 결과
  const autocompleteResults = searchValue.trim()
    ? files.filter((f) => f.name.toLowerCase().includes(searchValue.toLowerCase())).slice(0, 8)
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
      setSearchValue(autocompleteResults[autocompleteIndex].name);
      setIsAutocompleteOpen(false);
      setAutocompleteIndex(-1);
    } else if (e.key === 'Escape') {
      setIsAutocompleteOpen(false);
      setAutocompleteIndex(-1);
    }
  };

  const handleSelectAutocomplete = (fileName: string) => {
    setSearchValue(fileName);
    setIsAutocompleteOpen(false);
    setAutocompleteIndex(-1);
  };

  const addNotification = (type: Notification['type'], title: string, message: string) => {
    const newNotification: Notification = {
      id: `n-${Date.now()}`,
      type,
      title,
      message,
      time: '방금 전',
      isRead: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const handleReadNotification = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleOrgPermissionChange = (orgId: string, permission: 'none' | 'view' | 'download' | 'delete') => {
    setOrgPermissions((prev) => ({ ...prev, [orgId]: permission }));
  };

  const handleAddUser = () => {
    if (!userSearchValue.trim()) return;
    const userName = userSearchValue.includes('@') ? userSearchValue.split('@')[0] : userSearchValue;
    const newUser: SharedUser = {
      id: `u-${Date.now()}`,
      name: userName,
      email: userSearchValue.includes('@') ? userSearchValue : `${userSearchValue}@company.com`,
      permission: 'view',
      sharedAt: new Date().toISOString().split('T')[0],
      notifyEmail: true,
      notifyInApp: true,
    };
    setSharedUsers((prev) => [...prev, newUser]);
    setUserSearchValue('');
    addNotification('share', '폴더 공유됨', `${userName}님에게 ${selectedFolderForPermission} 폴더가 공유되었습니다.`);
  };

  const handleUserPermissionChange = (userId: string, permission: 'view' | 'download' | 'delete') => {
    setSharedUsers((prev) =>
      prev.map((user) => user.id === userId ? { ...user, permission } : user)
    );
  };

  const handleToggleNotify = (userId: string, type: 'email' | 'inApp') => {
    setSharedUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? {
              ...user,
              notifyEmail: type === 'email' ? !user.notifyEmail : user.notifyEmail,
              notifyInApp: type === 'inApp' ? !user.notifyInApp : user.notifyInApp,
            }
          : user
      )
    );
  };

  const handleRemoveUser = (userId: string) => {
    setSharedUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const simulateUpload = (file: File) => {
    const uploadId = `upload-${Date.now()}-${Math.random()}`;
    const newUpload: UploadingFile = {
      id: uploadId,
      name: file.name,
      size: formatFileSize(file.size),
      progress: 0,
      status: 'uploading',
    };

    setUploadingFiles((prev) => [...prev, newUpload]);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadingFiles((prev) =>
          prev.map((f) => f.id === uploadId ? { ...f, progress: 100, status: 'completed' } : f)
        );
        addNotification('upload', '업로드 완료', `${file.name} 파일이 업로드되었습니다.`);
        setTimeout(() => {
          setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadId));
        }, 3000);
      } else {
        setUploadingFiles((prev) =>
          prev.map((f) => f.id === uploadId ? { ...f, progress: Math.min(progress, 99) } : f)
        );
      }
    }, 300);
  };

  const handleFilesUpload = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => simulateUpload(file));
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); handleFilesUpload(e.dataTransfer.files); };
  const handleCancelUpload = (uploadId: string) => { setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadId)); };

  const handleOpenPermission = (folderId: string, folderName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    openShareModal(folderName);
  };

  const handleDeleteFile = (fileId: string) => {
    const fileToDelete = files.find((f) => f.id === fileId);
    if (fileToDelete) {
      const deletedFile = { ...fileToDelete, isDeleted: true, deletedAt: new Date().toISOString().split('T')[0] };
      setTrashedFiles((prev) => [...prev, deletedFile]);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    }
    setOpenMenuId(null);
  };

  const handleRestoreFile = (fileId: string) => {
    const fileToRestore = trashedFiles.find((f) => f.id === fileId);
    if (fileToRestore) {
      setFiles((prev) => [...prev, { ...fileToRestore, isDeleted: false, deletedAt: undefined }]);
      setTrashedFiles((prev) => prev.filter((f) => f.id !== fileId));
    }
  };

  const handlePermanentDelete = (fileId: string) => {
    setTrashedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleEmptyTrash = () => {
    setTrashedFiles([]);
  };

  const handleExtractWithCertiPT = (file: FileData) => {
    const extractId = `extract-${Date.now()}`;
    setExtractingFiles((prev) => [...prev, { id: extractId, name: file.name, progress: 0, status: 'extracting' }]);
    setOpenMenuId(null);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setExtractingFiles((prev) => prev.map((f) => f.id === extractId ? { ...f, progress: 100, status: 'completed' } : f));
        addNotification('extract', 'CertiPT 추출 완료', `${file.name}에서 데이터 추출이 완료되었습니다.`);
        setTimeout(() => { setExtractingFiles((prev) => prev.filter((f) => f.id !== extractId)); }, 3000);
      } else {
        setExtractingFiles((prev) => prev.map((f) => f.id === extractId ? { ...f, progress: Math.min(progress, 99) } : f));
      }
    }, 500);
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <HighlightedText key={i}>{part}</HighlightedText> : part
    );
  };

  // 파일 선택 핸들러
  const handleFileSelect = (fileId: string) => {
    setSelectedFileIds((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFileIds(filteredFiles.map((f) => f.id));
    } else {
      setSelectedFileIds([]);
    }
  };

  const handleClearSelection = () => {
    setSelectedFileIds([]);
  };

  const handleToggleExpand = (fileId: string) => {
    setExpandedFileId((prev) => (prev === fileId ? null : fileId));
  };

  // 벌크 액션 핸들러
  const handleBulkExtract = () => {
    const selectedFiles = files.filter((f) => selectedFileIds.includes(f.id) && !f.isFolder);
    selectedFiles.forEach((file) => {
      if (file.extractStatus === 'none' || file.extractStatus === 'failed') {
        handleExtractWithCertiPT(file);
      }
    });
    setSelectedFileIds([]);
  };

  const handleBulkDownload = () => {
    addNotification('info', '다운로드 시작', `${selectedFileIds.length}개 파일 다운로드를 시작합니다.`);
    setSelectedFileIds([]);
  };

  const handleBulkShare = () => {
    openShareModal(`선택된 ${selectedFileIds.length}개 파일`);
  };

  const handleBulkDelete = () => {
    selectedFileIds.forEach((id) => handleDeleteFile(id));
    setSelectedFileIds([]);
  };

  // 추출 상태에 따른 아이콘
  const getExtractStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <AppIcon name="check" size={14} fillColor="STATE_SUCCESS" />;
      case 'failed':
        return <AppIcon name="close" size={14} fillColor="STATE_ERROR" />;
      default:
        return null;
    }
  };

  const getExtractStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return '등록 완료';
      case 'failed':
      case 'none':
        return '입력 필요';
      case 'extracting':
        return '추출 중';
      default:
        return '입력 필요';
    }
  };

  // 공유 모달 핸들러
  const openShareModal = (targetName: string) => {
    setShareTargetName(targetName);
    setIsShareModalOpen(true);
  };

  const closeShareModal = () => {
    setIsShareModalOpen(false);
    setShareSearchValue('');
  };

  const handleAddShareRecipient = () => {
    if (!shareSearchValue.trim()) return;
    const newRecipient: ShareRecipient = {
      id: `sr-${Date.now()}`,
      name: shareSearchValue,
      type: 'user',
      meta: '개별 추가',
      permission: 'viewer',
      avatarColor: '#9E9E9E',
    };
    setShareRecipients((prev) => [...prev, newRecipient]);
    setShareSearchValue('');
  };

  const handleRecipientPermissionChange = (recipientId: string, permission: 'editor' | 'viewer' | 'download') => {
    setShareRecipients((prev) =>
      prev.map((r) => (r.id === recipientId ? { ...r, permission } : r))
    );
  };

  const handleRemoveRecipient = (recipientId: string) => {
    setShareRecipients((prev) => prev.filter((r) => r.id !== recipientId));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://docs.certicos.com/share/xK9mP2qR8vL...');
    addNotification('info', '링크 복사됨', '공유 링크가 클립보드에 복사되었습니다.');
  };

  const handleShareComplete = () => {
    addNotification('share', '공유 완료', `${shareTargetName}이(가) 공유되었습니다.`);
    closeShareModal();
  };

  // 권한 설정 페이지 핸들러
  const openPermissionPage = () => {
    setIsPermissionPageOpen(true);
  };

  const closePermissionPage = () => {
    setIsPermissionPageOpen(false);
  };

  const handleTeamPermissionChange = (teamId: string, permissionKey: keyof TeamPermission['permissions']) => {
    setTeamPermissions((prev) =>
      prev.map((t) =>
        t.id === teamId
          ? { ...t, permissions: { ...t.permissions, [permissionKey]: !t.permissions[permissionKey] } }
          : t
      )
    );
  };

  const handleSavePermissions = () => {
    addNotification('info', '권한 저장됨', `${selectedPermissionFolder} 폴더의 권한이 저장되었습니다.`);
    closePermissionPage();
  };

  const currentFiles = isTrashView ? trashedFiles : files;

  const filteredFiles = currentFiles.filter((file) => {
    // 파일명 검색
    if (searchValue && !file.name.toLowerCase().includes(searchValue.toLowerCase())) return false;

    // 확장자 필터
    if (selectedExtensions.length > 0) {
      const fileExt = file.type.toUpperCase();
      if (!selectedExtensions.includes(fileExt)) return false;
    }

    // 업로더 필터
    if (uploaderFilter !== 'all' && file.uploader !== uploaderFilter) return false;

    // 날짜 범위 필터
    if (dateFrom && file.date < dateFrom) return false;
    if (dateTo && file.date > dateTo) return false;

    // 파일 크기 필터
    if (sizeFilter !== 'all') {
      const sizeBytes = parseFileSize(file.size);
      const MB = 1024 * 1024;
      if (sizeFilter === 'small' && sizeBytes >= MB) return false;
      if (sizeFilter === 'medium' && (sizeBytes < MB || sizeBytes >= 5 * MB)) return false;
      if (sizeFilter === 'large' && (sizeBytes < 5 * MB || sizeBytes >= 10 * MB)) return false;
      if (sizeFilter === 'xlarge' && sizeBytes < 10 * MB) return false;
    }

    return true;
  });

  // 활성 필터 개수
  const activeFilterCount =
    selectedExtensions.length +
    (uploaderFilter !== 'all' ? 1 : 0) +
    selectedTags.length +
    (dateFrom || dateTo ? 1 : 0) +
    (sizeFilter !== 'all' ? 1 : 0);

  const renderFolder = (folder: FolderNode, level: number = 0) => {
    const hasChildren = folder.children && folder.children.length > 0;
    const isExpanded = expandedFolders.includes(folder.id);
    const isSelected = selectedFolder === folder.id;

    return (
      <div key={folder.id}>
        <FolderItemWrapper>
          <FolderItem
            $level={level}
            $selected={isSelected}
            onClick={() => { setSelectedFolder(folder.id); if (hasChildren) toggleFolder(folder.id); }}
            style={{ flex: 1 }}
          >
            <AppIcon name={hasChildren ? (isExpanded ? 'folderOpen' : 'folder') : 'file'} size={18} fillColor={isSelected ? 'ICON_PRIMARY' : 'ICON_ASSISTIVE'} />
            <AppTypography variant="BODY2_400" color={isSelected ? 'TEXT_PRIMARY' : 'TEXT_NORMAL'}>{folder.name}</AppTypography>
          </FolderItem>
          <FolderActions>
            <FolderActionBtn onClick={(e) => handleOpenPermission(folder.id, folder.name, e)} title="공유 및 권한">
              <AppIcon name="share" size={14} fillColor="ICON_ASSISTIVE" />
            </FolderActionBtn>
          </FolderActions>
        </FolderItemWrapper>
        {hasChildren && isExpanded && folder.children?.map((child) => renderFolder(child, level + 1))}
      </div>
    );
  };

  return (
    <PageContainer onClick={() => { setOpenMenuId(null); setIsNotificationOpen(false); }}>
      <Header>
        <BackButton onClick={() => router.push('/companies')}>
          <AppIcon name="chevronLeft" size={16} fillColor="ICON_NEUTRAL" />
          목록
        </BackButton>

        <CompanyName>
          <AppTypography variant="TITLE3_500" color="TEXT_STRONG">{companyName}</AppTypography>
        </CompanyName>

        <CompanyInfoBar>
          <InfoItem>
            <InfoLabel>컨설턴트</InfoLabel>
            <InfoValue>{companyInfo.consultant}</InfoValue>
          </InfoItem>
          <InfoDivider />
          <InfoItem>
            <InfoLabel>서류 취합</InfoLabel>
            <InfoValue>{companyInfo.documentManager}</InfoValue>
          </InfoItem>
          <InfoDivider />
          <InfoItem>
            <InfoLabel>품질 담당</InfoLabel>
            <InfoValue>{companyInfo.qualityManager}</InfoValue>
          </InfoItem>
        </CompanyInfoBar>

        <FilterGroup>
          {/* 자동완성 검색바는 테이블 상단 액션 영역으로 이동됨 */}
          <FilterToggle $active={isFilterOpen} onClick={() => setIsFilterOpen(!isFilterOpen)}>
            <AppIcon name="filter" size={16} fillColor={isFilterOpen ? 'ICON_PRIMARY' : 'ICON_ASSISTIVE'} />
            세부 필터
            {activeFilterCount > 0 && (
              <ActiveFilterBadge style={{ marginLeft: 4, padding: '2px 6px' }}>
                {activeFilterCount}
              </ActiveFilterBadge>
            )}
          </FilterToggle>

          <NotifBellWrapper>
            <NotificationBell onClick={(e) => { e.stopPropagation(); setIsNotificationOpen(!isNotificationOpen); }}>
              <AppIcon name="bell" size={18} fillColor="ICON_NEUTRAL" />
              {unreadCount > 0 && <NotificationBadge>{unreadCount}</NotificationBadge>}
            </NotificationBell>

            <NotificationPanel $isOpen={isNotificationOpen} onClick={(e) => e.stopPropagation()}>
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
          </NotifBellWrapper>

          <AppTextButton variant="PRIMARY" size="MEDIUM" prefixIcon={<AppIcon name="upload" size={16} fillColor="TEXT_WHITE" />} onClick={() => fileInputRef.current?.click()}>
            업로드
          </AppTextButton>
        </FilterGroup>
      </Header>

      {isFilterOpen && (
        <FilterPanel>
          <FilterRow>
            <FilterSection>
              <FilterLabel>확장자</FilterLabel>
              <TagList>
                {FILE_EXTENSIONS.map((ext) => (
                  <Tag key={ext} $active={selectedExtensions.includes(ext)} onClick={() => handleExtensionToggle(ext)}>{ext}</Tag>
                ))}
              </TagList>
            </FilterSection>
            <FilterSection>
              <FilterLabel>업로드 날짜</FilterLabel>
              <DateRangeWrapper>
                <DateInput type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="시작일" />
                <AppTypography variant="SMALL_400" color="TEXT_ASSISTIVE">~</AppTypography>
                <DateInput type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="종료일" />
              </DateRangeWrapper>
            </FilterSection>
          </FilterRow>
          <FilterRow style={{ marginTop: 12 }}>
            <FilterSection>
              <FilterLabel>파일 크기</FilterLabel>
              <TagList>
                {FILE_SIZE_OPTIONS.filter(o => o.value !== 'all').map((opt) => (
                  <Tag key={opt.value} $active={sizeFilter === opt.value} onClick={() => setSizeFilter(sizeFilter === opt.value ? 'all' : opt.value)}>{opt.label}</Tag>
                ))}
              </TagList>
            </FilterSection>
            <FilterSection>
              <FilterLabel>업로더</FilterLabel>
              <AppSelect placeholder="전체" width={120} value={uploaderFilter} onChange={(value) => setUploaderFilter(String(value))} options={UPLOADERS} />
            </FilterSection>
          </FilterRow>
          <FilterRow style={{ marginTop: 12 }}>
            <FilterSection>
              <FilterLabel>태그</FilterLabel>
              <TagList>{AVAILABLE_TAGS.map((tag) => (<Tag key={tag} $active={selectedTags.includes(tag)} onClick={() => handleTagToggle(tag)}>{tag}</Tag>))}</TagList>
            </FilterSection>
            {activeFilterCount > 0 && (
              <ClearFilterButton onClick={handleClearFilters}><AppIcon name="close" size={12} fillColor="ICON_ASSISTIVE" />필터 초기화</ClearFilterButton>
            )}
          </FilterRow>
        </FilterPanel>
      )}

      <MainContent>
        <Sidebar>
          <SidebarTitle><AppTypography variant="SMALL_500" color="TEXT_ASSISTIVE">폴더</AppTypography></SidebarTitle>
          {MOCK_FOLDERS.map((folder) => renderFolder(folder))}
        </Sidebar>

        <ContentArea>
          <ContentHeader>
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <AppBreadcrumb items={[{ label: '홈', onClick: () => {} }, { label: '회사별 제품 관리', onClick: () => {} }, { label: '회사 제품 상세' }]} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <AppTypography variant="TITLE2_600" color="TEXT_STRONG">
                  {companyName} | 111-05-00000
                </AppTypography>
              </div>
              
              <TabGroup>
                <TabButton $active={activeTab === '진행 전'} onClick={() => setActiveTab('진행 전')}>진행 전</TabButton>
                <TabButton $active={activeTab === '진행 중'} onClick={() => setActiveTab('진행 중')}>진행 중</TabButton>
                <TabButton $active={activeTab === '인증 완료'} onClick={() => setActiveTab('인증 완료')}>인증 완료</TabButton>
              </TabGroup>

              <TopActionRow>
                <LeftActions>
                  <WhiteButton>
                    <AppIcon name="download" size={14} fillColor="ICON_ASSISTIVE" />
                    인증 현황 시트
                  </WhiteButton>
                  <WhiteButton>
                    <NotificationBadgeSmall>1</NotificationBadgeSmall>
                    <AppIcon name="plus" size={14} fillColor="ICON_ASSISTIVE" />
                    MoCRA XML 생성
                  </WhiteButton>
                </LeftActions>
                <RightActions>
                  <AppSelect placeholder="문서명(영문)" width={140} value="" onChange={() => {}} options={[{ label: '문서명(영문)', value: '' }]} />
                  <SearchContainer style={{ width: '240px', maxWidth: 'none', flex: 'none' }}>
                    <MainSearchInput
                      ref={searchInputRef}
                      type="text"
                      placeholder="검색"
                      value={searchValue}
                      onChange={(e) => {
                        setSearchValue(e.target.value);
                        setIsAutocompleteOpen(e.target.value.length > 0);
                        setAutocompleteIndex(-1);
                      }}
                      onFocus={() => searchValue && setIsAutocompleteOpen(true)}
                      onBlur={() => setTimeout(() => setIsAutocompleteOpen(false), 200)}
                      onKeyDown={handleSearchKeyDown}
                      style={{ padding: '8px 36px 8px 14px' }}
                    />
                    <SearchIconWrapper>
                      <AppIcon name="search" size={16} fillColor="ICON_ASSISTIVE" />
                    </SearchIconWrapper>
                    <AutocompleteDropdown $isOpen={isAutocompleteOpen && searchValue.length > 0}>
                      {autocompleteResults.length > 0 ? (
                        autocompleteResults.map((file, index) => (
                          <AutocompleteItem
                            key={file.id}
                            $selected={index === autocompleteIndex}
                            onMouseDown={() => handleSelectAutocomplete(file.name)}
                          >
                            <AutocompleteFileIcon>{file.type}</AutocompleteFileIcon>
                            <AutocompleteInfo>
                              <AutocompleteFileName>{highlightText(file.name, searchValue)}</AutocompleteFileName>
                              <AutocompleteMeta>{file.size} · {file.date} · {file.uploader}</AutocompleteMeta>
                            </AutocompleteInfo>
                          </AutocompleteItem>
                        ))
                      ) : (
                        <NoResultsText>검색 결과가 없습니다</NoResultsText>
                      )}
                    </AutocompleteDropdown>
                  </SearchContainer>
                </RightActions>
              </TopActionRow>
            </div>
          </ContentHeader>

          {isTrashView && trashedFiles.length > 0 && (
            <TrashInfo>
              <AppIcon name="trash" size={24} fillColor="ICON_ASSISTIVE" />
              <div style={{ flex: 1 }}>
                <AppTypography variant="BODY2_500" color="TEXT_NORMAL">휴지통의 파일은 30일 후 자동 삭제됩니다</AppTypography>
                <AppTypography variant="SMALL_400" color="TEXT_ASSISTIVE">복원하려면 파일 옆의 복원 버튼을 클릭하세요</AppTypography>
              </div>
              <AppTextButton variant="SECONDARY" size="SMALL" onClick={handleEmptyTrash}>휴지통 비우기</AppTextButton>
            </TrashInfo>
          )}

          {!isTrashView && (
            <UploadZone $isDragging={isDragging} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}>
              <UploadZoneContent>
                <AppIcon name="upload" size={32} fillColor={isDragging ? 'ICON_PRIMARY' : 'ICON_ASSISTIVE'} />
                <AppTypography variant="BODY2_500" color={isDragging ? 'TEXT_PRIMARY' : 'TEXT_NORMAL'}>파일을 드래그하거나 클릭하여 업로드</AppTypography>
                <AppTypography variant="SMALL_400" color="TEXT_ASSISTIVE">PDF, Excel, Word, 이미지 파일 지원 (최대 100MB)</AppTypography>
              </UploadZoneContent>
              <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={(e) => handleFilesUpload(e.target.files)} />
            </UploadZone>
          )}

          {!isTrashView && uploadingFiles.length > 0 && (
            <UploadingList>
              {uploadingFiles.map((file) => (
                <UploadingRow key={file.id}>
                  <FileIcon>{file.name.split('.').pop()?.toUpperCase() || 'FILE'}</FileIcon>
                  <UploadingFileInfo>
                    <UploadingFileName>{file.name}</UploadingFileName>
                    <UploadingFileMeta>{file.size} • {file.status === 'completed' ? '완료' : file.status === 'error' ? '오류' : '업로드 중...'}</UploadingFileMeta>
                  </UploadingFileInfo>
                  <ProgressBarWrapper>
                    <ProgressBar><ProgressFill $progress={file.progress} $status={file.status} /></ProgressBar>
                    <ProgressText $status={file.status}>{file.status === 'completed' ? '완료' : file.status === 'error' ? '실패' : `${Math.round(file.progress)}%`}</ProgressText>
                  </ProgressBarWrapper>
                  {file.status === 'uploading' && <AppIconButton icon="close" size="SMALL" onClick={() => handleCancelUpload(file.id)} />}
                </UploadingRow>
              ))}
            </UploadingList>
          )}

          {extractingFiles.length > 0 && (
            <UploadingList>
              {extractingFiles.map((file) => (
                <ExtractingRow key={file.id}>
                  <AppIcon name="extract" size={24} fillColor="ICON_PRIMARY" />
                  <UploadingFileInfo>
                    <UploadingFileName>{file.name}</UploadingFileName>
                    <UploadingFileMeta>CertiPT로 서류 내용 추출 중...</UploadingFileMeta>
                  </UploadingFileInfo>
                  <ProgressBarWrapper>
                    <ProgressBar><ProgressFill $progress={file.progress} $status={file.status} /></ProgressBar>
                    <ProgressText $status={file.status}>{file.status === 'completed' ? '완료' : `${Math.round(file.progress)}%`}</ProgressText>
                  </ProgressBarWrapper>
                </ExtractingRow>
              ))}
            </UploadingList>
          )}

          {/* 벌크 액션 바 */}
          {selectedFileIds.length > 0 && (
            <BulkActionBar>
              <SelectionCount>{selectedFileIds.length}개 선택됨</SelectionCount>
              <AppTextButton
                variant="SECONDARY"
                size="SMALL"
                prefixIcon={<AppIcon name="extract" size={14} fillColor="ICON_PRIMARY" />}
                onClick={handleBulkExtract}
              >
                Certicos 추출
              </AppTextButton>
              <AppTextButton
                variant="SECONDARY"
                size="SMALL"
                prefixIcon={<AppIcon name="download" size={14} fillColor="ICON_NEUTRAL" />}
                onClick={handleBulkDownload}
              >
                다운로드
              </AppTextButton>
              <AppTextButton
                variant="SECONDARY"
                size="SMALL"
                prefixIcon={<AppIcon name="share" size={14} fillColor="ICON_NEUTRAL" />}
                onClick={handleBulkShare}
              >
                공유
              </AppTextButton>
              <AppTextButton
                variant="DANGER"
                size="SMALL"
                prefixIcon={<AppIcon name="trash" size={14} fillColor="TEXT_WHITE" />}
                onClick={handleBulkDelete}
              >
                삭제
              </AppTextButton>
              <AppIconButton
                icon="close"
                size="SMALL"
                variant="TERTIARY"
                onClick={handleClearSelection}
                title="선택 해제"
              />
            </BulkActionBar>
          )}

          {/* 테이블 디자인 */}
          <TableContainer>
            <Table>
              <Thead>
                <Tr>
                  <Th style={{ width: 50 }}>
                    <Checkbox
                      type="checkbox"
                      checked={filteredFiles.length > 0 && selectedFileIds.length === filteredFiles.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </Th>
                  <Th>문서명</Th>
                  <Th style={{ width: 100 }}>크기</Th>
                  <Th style={{ width: 140 }}>{isTrashView ? '삭제일' : '수정일'}</Th>
                  <Th style={{ width: 160 }}>데이터 담당자</Th>
                  {!isTrashView && <Th style={{ width: 120 }}>상태</Th>}
                  <Th style={{ width: 100 }}>관리</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredFiles.map((file) => (
                  <React.Fragment key={file.id}>
                    <TableRowSelected $selected={selectedFileIds.includes(file.id)}>
                      <Td>
                        <Checkbox
                          type="checkbox"
                          checked={selectedFileIds.includes(file.id)}
                          onChange={() => handleFileSelect(file.id)}
                        />
                      </Td>
                      <Td>
                        <FileNameCell>
                          <FileIcon style={{ background: file.isFolder ? COLOR.GRAY20 : COLOR.PRIMARY10, color: file.isFolder ? COLOR.GRAY70 : COLOR.PRIMARY60 }}>
                            {file.isFolder ? '폴더' : file.type}
                          </FileIcon>
                          <span
                            style={{ cursor: file.extractStatus === 'completed' ? 'pointer' : 'default' }}
                            onClick={() => file.extractStatus === 'completed' && handleToggleExpand(file.id)}
                          >
                            {highlightText(file.name, searchValue)}
                          </span>
                        </FileNameCell>
                      </Td>
                      <Td>{file.size || '—'}</Td>
                      <Td style={{ color: COLOR.GRAY90 }}>{isTrashView ? file.deletedAt : file.date}</Td>
                      <Td>{file.uploader || '—'}</Td>
                      {!isTrashView && (
                        <Td>
                          {!file.isFolder && (
                            <ExtractBadgeText
                              $status={file.extractStatus || 'none'}
                              style={{ cursor: file.extractStatus === 'completed' ? 'pointer' : 'default' }}
                              onClick={() => file.extractStatus === 'completed' && handleToggleExpand(file.id)}
                            >
                              {getExtractStatusLabel(file.extractStatus || 'none')}
                            </ExtractBadgeText>
                          )}
                        </Td>
                      )}
                      <Td>
                        {isTrashView ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <AppTextButton variant="SECONDARY" size="SMALL" onClick={() => handleRestoreFile(file.id)}>복원</AppTextButton>
                            <AppTextButton variant="SECONDARY" size="SMALL" onClick={() => handlePermanentDelete(file.id)} style={{ color: COLOR.RED60 }}>영구삭제</AppTextButton>
                          </div>
                        ) : (
                          <RowActions>
                            {selectedFileIds.includes(file.id) && (
                              <>
                                <RowActionBtn title="미리보기"><AppIcon name="eye" size={16} fillColor="ICON_NEUTRAL" /></RowActionBtn>
                                <RowActionBtn title="다운로드"><AppIcon name="download" size={16} fillColor="ICON_NEUTRAL" /></RowActionBtn>
                                <RowActionBtn title="공유" onClick={() => openShareModal(file.name)}>
                                  <AppIcon name="share" size={16} fillColor="ICON_NEUTRAL" />
                                </RowActionBtn>
                              </>
                            )}
                            <ActionMenu>
                              <RowActionBtn onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === file.id ? null : file.id); }}>
                                <AppIcon name="more" size={16} fillColor="ICON_NEUTRAL" />
                              </RowActionBtn>
                              <ActionDropdown $isOpen={openMenuId === file.id}>
                                {!file.isFolder && file.extractStatus !== 'completed' && (
                                  <ActionItem onClick={() => handleExtractWithCertiPT(file)}>
                                    <AppIcon name="extract" size={16} fillColor="ICON_PRIMARY" />Certicos 추출
                                  </ActionItem>
                                )}
                                <ActionItem><AppIcon name="download" size={16} fillColor="ICON_NEUTRAL" />다운로드</ActionItem>
                                <ActionItem onClick={() => openShareModal(file.name)}>
                                  <AppIcon name="share" size={16} fillColor="ICON_NEUTRAL" />공유
                                </ActionItem>
                                <ActionItem onClick={() => handleDeleteFile(file.id)} style={{ color: COLOR.RED60 }}>
                                  <AppIcon name="trash" size={16} fillColor="ICON_NEUTRAL" />휴지통으로 이동
                                </ActionItem>
                              </ActionDropdown>
                            </ActionMenu>
                          </RowActions>
                        )}
                      </Td>
                    </TableRowSelected>

                    {/* 추출 상세 정보 (확장 행) */}
                    {expandedFileId === file.id && file.extractData && (
                      <ExtractDetailsRow>
                        <ExtractDetailsCell colSpan={6}>
                          <ExtractDetailsContent>
                            {file.extractData.type === 'allergen' ? (
                              // 알러젠 데이터 표시
                              <AllergenListContainer>
                                <AllergenInfoSection>
                                  <ExtractDetailItem style={{ marginBottom: 16 }}>
                                    <ExtractDetailLabel>향료명</ExtractDetailLabel>
                                    <ExtractDetailValue>{file.extractData.fragranceName}</ExtractDetailValue>
                                  </ExtractDetailItem>
                                  <ExtractDetailItem style={{ marginBottom: 16 }}>
                                    <ExtractDetailLabel>공급사</ExtractDetailLabel>
                                    <ExtractDetailValue>{file.extractData.vendor}</ExtractDetailValue>
                                  </ExtractDetailItem>
                                  <ExtractDetailItem>
                                    <ExtractDetailLabel>알러젠 타입</ExtractDetailLabel>
                                    <AllergenTypeBadge>
                                      <AppIcon name="check" size={12} fillColor="ICON_PRIMARY" />
                                      {file.extractData.allergenType}종 검출
                                    </AllergenTypeBadge>
                                  </ExtractDetailItem>
                                </AllergenInfoSection>
                                <AllergenTableSection>
                                  <ExtractDetailLabel style={{ marginBottom: 8 }}>알러젠 성분 ({Object.keys(file.extractData.allergenList || {}).length}종)</ExtractDetailLabel>
                                  <AllergenTable>
                                    {Object.entries(file.extractData.allergenList || {}).map(([name, value]) => (
                                      <AllergenItem key={name}>
                                        <AllergenName>{name}</AllergenName>
                                        <AllergenValue>{value}%</AllergenValue>
                                      </AllergenItem>
                                    ))}
                                  </AllergenTable>
                                </AllergenTableSection>
                              </AllergenListContainer>
                            ) : (
                              // 견적서 데이터 표시
                              <ExtractDetailsGrid>
                                <ExtractDetailItem>
                                  <ExtractDetailLabel>제품명</ExtractDetailLabel>
                                  <ExtractDetailValue>{file.extractData.productName}</ExtractDetailValue>
                                </ExtractDetailItem>
                                <ExtractDetailItem>
                                  <ExtractDetailLabel>고객사</ExtractDetailLabel>
                                  <ExtractDetailValue>{file.extractData.customer}</ExtractDetailValue>
                                </ExtractDetailItem>
                                <ExtractDetailItem>
                                  <ExtractDetailLabel>견적 금액</ExtractDetailLabel>
                                  <ExtractDetailValue>{file.extractData.quoteAmount}</ExtractDetailValue>
                                </ExtractDetailItem>
                                <ExtractDetailItem>
                                  <ExtractDetailLabel>견적 일자</ExtractDetailLabel>
                                  <ExtractDetailValue>{file.extractData.quoteDate}</ExtractDetailValue>
                                </ExtractDetailItem>
                                <ExtractDetailItem>
                                  <ExtractDetailLabel>담당 컨설턴트</ExtractDetailLabel>
                                  <ExtractDetailValue>{file.extractData.consultant}</ExtractDetailValue>
                                </ExtractDetailItem>
                              </ExtractDetailsGrid>
                            )}
                            <ExtractDetailActions>
                              <CerticosLink>
                                Certicos에서 확인 →
                              </CerticosLink>
                              <ExtractNote>내용이 잘못된 경우 Certicos에서 직접 수정하세요</ExtractNote>
                            </ExtractDetailActions>
                          </ExtractDetailsContent>
                        </ExtractDetailsCell>
                      </ExtractDetailsRow>
                    )}
                  </React.Fragment>
                ))}
              </Tbody>
            </Table>
          </TableContainer>

          <PaginationWrapper style={{ display: 'flex', justifyContent: 'center', marginTop: '32px', marginBottom: '40px' }}>
            <AppPagination total={filteredFiles.length} perPage={10} currentPage={currentPage} onChangePage={setCurrentPage} />
          </PaginationWrapper>
        </ContentArea>
      </MainContent>

      {/* 폴더 권한 및 공유 드로어 */}
      <AppDrawer isOpen={isPermissionDrawerOpen} onClose={() => setIsPermissionDrawerOpen(false)} title={`${selectedFolderForPermission} 권한 및 공유`} width={520}>
        <PermissionSection>
          <SectionTitle><AppTypography variant="BODY1_500" color="TEXT_STRONG">조직도 기반 권한 관리</AppTypography></SectionTitle>
          <div style={{ marginBottom: 8 }}><AppTypography variant="SMALL_400" color="TEXT_ASSISTIVE">조직별 접근 권한을 설정하세요. 하위 팀은 상위 본부의 권한을 상속받습니다.</AppTypography></div>

          {MOCK_ORG_UNITS.filter((org) => org.type === 'division').map((division) => (
            <div key={division.id}>
              <OrgUnitCard $level={0}>
                <OrgUnitHeader>
                  <OrgUnitInfo>
                    <AppIcon name={expandedOrgs.includes(division.id) ? 'chevronDown' : 'chevronRight'} size={14} fillColor="ICON_ASSISTIVE" />
                    <OrgTypeBadge $type="division">본부</OrgTypeBadge>
                    <AppTypography variant="BODY2_500" color="TEXT_NORMAL">{division.name}</AppTypography>
                  </OrgUnitInfo>
                  <OrgPermissionSelector>
                    <ManagerInfo><AppIcon name="settings" size={12} fillColor="ICON_ASSISTIVE" />{division.manager}</ManagerInfo>
                    <PermissionSelect value={orgPermissions[division.id] || 'none'} onChange={(e) => handleOrgPermissionChange(division.id, e.target.value as 'none' | 'view' | 'download' | 'delete')}>
                      <option value="none">권한 없음</option>
                      <option value="view">보기</option>
                      <option value="download">다운로드</option>
                      <option value="delete">삭제 포함</option>
                    </PermissionSelect>
                  </OrgPermissionSelector>
                </OrgUnitHeader>
              </OrgUnitCard>

              {expandedOrgs.includes(division.id) && MOCK_ORG_UNITS.filter((org) => org.type === 'team' && org.parent === division.id).map((team) => (
                <OrgUnitCard key={team.id} $level={1}>
                  <OrgUnitHeader>
                    <OrgUnitInfo>
                      <div style={{ width: 14 }} />
                      <OrgTypeBadge $type="team">팀</OrgTypeBadge>
                      <AppTypography variant="BODY2_400" color="TEXT_NORMAL">{team.name}</AppTypography>
                    </OrgUnitInfo>
                    <OrgPermissionSelector>
                      <ManagerInfo><AppIcon name="settings" size={12} fillColor="ICON_ASSISTIVE" />{team.manager}</ManagerInfo>
                      <PermissionSelect value={orgPermissions[team.id] || orgPermissions[division.id] || 'none'} onChange={(e) => handleOrgPermissionChange(team.id, e.target.value as 'none' | 'view' | 'download' | 'delete')}>
                        <option value="none">권한 없음</option>
                        <option value="view">보기</option>
                        <option value="download">다운로드</option>
                        <option value="delete">삭제 포함</option>
                      </PermissionSelect>
                    </OrgPermissionSelector>
                  </OrgUnitHeader>
                </OrgUnitCard>
              ))}
            </div>
          ))}
        </PermissionSection>

        <UserShareSection>
          <SectionTitle>
            <AppTypography variant="BODY1_500" color="TEXT_STRONG">사용자 공유</AppTypography>
            <AppTypography variant="SMALL_400" color="TEXT_ASSISTIVE">{sharedUsers.length}명 공유됨</AppTypography>
          </SectionTitle>
          <UserSearchWrapper>
            <UserSearchInput type="text" placeholder="이메일 또는 ID로 사용자 검색..." value={userSearchValue} onChange={(e) => setUserSearchValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddUser()} />
            <AppTextButton variant="PRIMARY" size="MEDIUM" onClick={handleAddUser}>추가</AppTextButton>
          </UserSearchWrapper>

          {sharedUsers.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center' }}><AppTypography variant="BODY2_400" color="TEXT_ASSISTIVE">공유된 사용자가 없습니다</AppTypography></div>
          ) : (
            sharedUsers.map((user) => (
              <SharedUserCard key={user.id}>
                <UserAvatar>{user.name[0]}</UserAvatar>
                <UserInfo><UserName>{user.name}</UserName><UserEmail>{user.email}</UserEmail></UserInfo>
                <UserPermission>
                  <PermissionSelect value={user.permission} onChange={(e) => handleUserPermissionChange(user.id, e.target.value as 'view' | 'download' | 'delete')}>
                    <option value="view">보기</option>
                    <option value="download">다운로드</option>
                    <option value="delete">삭제 포함</option>
                  </PermissionSelect>
                  <NotifyWrapper>
                    <NotifyToggle $active={user.notifyEmail} onClick={() => handleToggleNotify(user.id, 'email')} title="이메일 알림">📧 이메일</NotifyToggle>
                    <NotifyToggle $active={user.notifyInApp} onClick={() => handleToggleNotify(user.id, 'inApp')} title="인앱 알림">🔔 인앱</NotifyToggle>
                  </NotifyWrapper>
                  <SharedAtText>{user.sharedAt} 공유됨</SharedAtText>
                </UserPermission>
                <RemoveUserBtn onClick={() => handleRemoveUser(user.id)} title="공유 취소"><AppIcon name="close" size={14} fillColor="ICON_ASSISTIVE" /></RemoveUserBtn>
              </SharedUserCard>
            ))
          )}
        </UserShareSection>

        <PermissionSection style={{ marginTop: 24 }}>
          <SectionTitle><AppTypography variant="BODY1_500" color="TEXT_STRONG">상세 권한 매트릭스</AppTypography></SectionTitle>
          <div style={{ marginBottom: 8 }}><AppTypography variant="SMALL_400" color="TEXT_ASSISTIVE">팀별 세부 권한을 확인하고 관리하세요.</AppTypography></div>

          {MOCK_FOLDER_PERMISSIONS['1-1-3']?.map((team, index) => (
            <PermissionTeamCard key={index}>
              <PermissionTeamHeader>
                <PermissionTeamInfo>
                  <AppTypography variant="BODY2_500" color="TEXT_NORMAL">{team.teamName}</AppTypography>
                  <TeamBadge>{team.department}</TeamBadge>
                </PermissionTeamInfo>
              </PermissionTeamHeader>
              <PermissionGrid>
                <PermissionItem><PermissionCheck $active={team.permissions.upload}>{team.permissions.upload && <AppIcon name="check" size={12} fillColor="TEXT_WHITE" />}</PermissionCheck><PermissionLabel>업로드</PermissionLabel></PermissionItem>
                <PermissionItem><PermissionCheck $active={team.permissions.preview}>{team.permissions.preview && <AppIcon name="check" size={12} fillColor="TEXT_WHITE" />}</PermissionCheck><PermissionLabel>미리보기</PermissionLabel></PermissionItem>
                <PermissionItem><PermissionCheck $active={team.permissions.download}>{team.permissions.download && <AppIcon name="check" size={12} fillColor="TEXT_WHITE" />}</PermissionCheck><PermissionLabel>다운로드</PermissionLabel></PermissionItem>
                <PermissionItem><PermissionCheck $active={team.permissions.delete}>{team.permissions.delete && <AppIcon name="check" size={12} fillColor="TEXT_WHITE" />}</PermissionCheck><PermissionLabel>삭제</PermissionLabel></PermissionItem>
                <PermissionItem><PermissionCheck $active={team.permissions.move}>{team.permissions.move && <AppIcon name="check" size={12} fillColor="TEXT_WHITE" />}</PermissionCheck><PermissionLabel>이동</PermissionLabel></PermissionItem>
              </PermissionGrid>
            </PermissionTeamCard>
          ))}
          <AppTextButton variant="SECONDARY" size="MEDIUM" style={{ width: '100%', marginTop: 12 }}>+ 팀 추가</AppTextButton>
        </PermissionSection>
      </AppDrawer>

      {/* 공유 모달 (이미지 3 참고) */}
      <ModalOverlay $isOpen={isShareModalOpen} onClick={closeShareModal}>
          <ShareModalContainer onClick={(e) => e.stopPropagation()}>
            <ShareModalHeader>
              <ShareModalTitle>
                <AppTypography variant="BODY1_500" color="TEXT_STRONG">공유</AppTypography>
                <div style={{ marginTop: 4 }}>
                  <AppTypography variant="SMALL_400" color="TEXT_ASSISTIVE">
                    {shareTargetName}
                  </AppTypography>
                </div>
              </ShareModalTitle>
              <ShareModalClose onClick={closeShareModal}>
                <AppIcon name="close" size={20} fillColor="ICON_NEUTRAL" />
              </ShareModalClose>
            </ShareModalHeader>

            <ShareModalBody>
              {/* 정보 배너 */}
              <ShareInfoBanner>
                <AppIcon name="folder" size={20} fillColor="ICON_PRIMARY" />
                <AppTypography variant="SMALL_400" color="TEXT_NORMAL">
                  이 폴더 및 하위 파일에 대한 접근 권한을 설정합니다
                </AppTypography>
              </ShareInfoBanner>

              {/* 검색 */}
              <ShareSearchWrapper>
                <ShareSearchInput
                  type="text"
                  placeholder="팀 또는 개인 검색..."
                  value={shareSearchValue}
                  onChange={(e) => setShareSearchValue(e.target.value)}
                />
                <ShareButton>추가</ShareButton>
              </ShareSearchWrapper>

              {/* 공유 대상 목록 */}
              <ShareSectionTitle>공유 대상</ShareSectionTitle>
              <ShareRecipientList>
                {shareRecipients.map((recipient) => (
                  <ShareRecipientItem key={recipient.id}>
                    <RecipientAvatar $color={recipient.avatarColor}>
                      {recipient.type === 'team' ? '팀' : recipient.name[0]}
                    </RecipientAvatar>
                    <RecipientInfo>
                      <RecipientName>
                        {recipient.name}
                        {recipient.isDefault && <DefaultBadge>기본</DefaultBadge>}
                      </RecipientName>
                      <RecipientMeta>{recipient.meta}</RecipientMeta>
                    </RecipientInfo>
                    <PermissionDropdown
                      value={recipient.permission}
                      onChange={(e) => handleRecipientPermissionChange(recipient.id, e.target.value as 'editor' | 'viewer' | 'download')}
                    >
                      <option value="editor">편집 가능</option>
                      <option value="viewer">보기 전용</option>
                      <option value="download">다운로드 가능</option>
                    </PermissionDropdown>
                  </ShareRecipientItem>
                ))}
              </ShareRecipientList>

              {/* 링크 공유 */}
              <LinkShareSection>
                <LinkShareHeader>
                  <LinkShareToggle>
                    <AppTypography variant="BODY2_500" color="TEXT_NORMAL">링크 공유</AppTypography>
                    <ToggleSwitch $active={isLinkShareEnabled} onClick={() => setIsLinkShareEnabled(!isLinkShareEnabled)} />
                  </LinkShareToggle>
                  {isLinkShareEnabled && <CopyLinkBtn>링크 복사</CopyLinkBtn>}
                </LinkShareHeader>
                {isLinkShareEnabled && (
                  <>
                    <LinkUrlBox>https://certicos.com/share/abc123xyz...</LinkUrlBox>
                    <LinkOptions>
                      <LinkOptionItem>
                        <span>만료일:</span>
                        <PermissionDropdown
                          value={linkExpiry}
                          onChange={(e) => setLinkExpiry(e.target.value)}
                          style={{ minWidth: 100 }}
                        >
                          <option value="7">7일</option>
                          <option value="30">30일</option>
                          <option value="90">90일</option>
                          <option value="0">무제한</option>
                        </PermissionDropdown>
                      </LinkOptionItem>
                      <LinkOptionItem>
                        <span>비밀번호 보호</span>
                        <ToggleSwitch $active={isPasswordProtected} onClick={() => setIsPasswordProtected(!isPasswordProtected)} />
                      </LinkOptionItem>
                    </LinkOptions>
                  </>
                )}
              </LinkShareSection>
            </ShareModalBody>

            <ShareModalFooter>
              <SettingsButton onClick={() => { closeShareModal(); openPermissionPage(); }}>
                <AppIcon name="settings" size={14} fillColor="ICON_NEUTRAL" />
                권한 설정
              </SettingsButton>
              <div style={{ flex: 1 }} />
              <CancelButton onClick={closeShareModal}>취소</CancelButton>
              <ConfirmButton onClick={handleShareComplete}>공유</ConfirmButton>
            </ShareModalFooter>
          </ShareModalContainer>
        </ModalOverlay>

      {/* 권한 설정 페이지 (이미지 4 참고) */}
      <PermissionPageOverlay $isOpen={isPermissionPageOpen}>
        <PermissionPageHeader>
          <PermissionPageTitle>
            <button
              onClick={closePermissionPage}
              style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
            >
              <AppIcon name="chevronLeft" size={20} fillColor="ICON_NORMAL" />
            </button>
            <AppTypography variant="BODY1_500" color="TEXT_STRONG">권한 설정</AppTypography>
          </PermissionPageTitle>
          <SaveButton onClick={handleSavePermissions}>저장</SaveButton>
        </PermissionPageHeader>

        <PermissionPageBody>
          {/* 좌측 폴더 리스트 */}
          <PermissionSidebar>
            <PermissionSidebarTitle>폴더 유형</PermissionSidebarTitle>
            {FOLDER_TYPES.map((folderType) => (
              <PermissionFolderItem
                key={folderType}
                $selected={selectedPermissionFolder === folderType}
                onClick={() => setSelectedPermissionFolder(folderType)}
              >
                <AppIcon
                  name="folder"
                  size={16}
                  fillColor={selectedPermissionFolder === folderType ? 'ICON_PRIMARY' : 'ICON_NEUTRAL'}
                />
                <AppTypography
                  variant="BODY2_400"
                  color={selectedPermissionFolder === folderType ? 'TEXT_PRIMARY' : 'TEXT_NORMAL'}
                >
                  {folderType}
                </AppTypography>
              </PermissionFolderItem>
            ))}
          </PermissionSidebar>

          {/* 우측 권한 매트릭스 */}
          <PermissionMainArea>
            <PermissionMainHeader>
              <PermissionMainTitle>
                <AppTypography variant="BODY1_500" color="TEXT_STRONG">{selectedPermissionFolder}</AppTypography>
                <div style={{ marginTop: 4 }}>
                  <AppTypography variant="SMALL_400" color="TEXT_ASSISTIVE">
                    폴더 유형별로 팀의 접근 권한을 설정합니다
                  </AppTypography>
                </div>
              </PermissionMainTitle>
            </PermissionMainHeader>

            <PermissionTableContainer>
              <PermissionTableHeader>
                <AppTypography variant="BODY2_500" color="TEXT_NORMAL">팀별 권한</AppTypography>
                <AppTypography variant="SMALL_400" color="TEXT_ASSISTIVE">
                  {teamPermissions.filter((t) => t.isAssigned).length}개 팀 할당됨
                </AppTypography>
              </PermissionTableHeader>

              <PermissionTable>
                <PermissionThead>
                  <tr>
                    <PermissionTh style={{ width: '30%' }}>팀</PermissionTh>
                    <PermissionTh>업로드/쓰기</PermissionTh>
                    <PermissionTh>읽기</PermissionTh>
                    <PermissionTh>다운로드</PermissionTh>
                    <PermissionTh>삭제/이동</PermissionTh>
                  </tr>
                </PermissionThead>
                <PermissionTbody>
                  {teamPermissions.map((team) => (
                    <PermissionTr key={team.id} $highlighted={team.isAssigned}>
                      <PermissionTd>
                        <TeamNameCell>
                          <AppTypography variant="BODY2_400" color="TEXT_NORMAL">{team.name}</AppTypography>
                          {team.isAssigned && <AssignedBadge>담당</AssignedBadge>}
                        </TeamNameCell>
                      </PermissionTd>
                      <PermissionTd>
                        <PermissionCheckbox
                          type="checkbox"
                          checked={team.permissions.uploadWrite}
                          onChange={() => handleTeamPermissionChange(team.id, 'uploadWrite')}
                        />
                      </PermissionTd>
                      <PermissionTd>
                        <PermissionCheckbox
                          type="checkbox"
                          checked={team.permissions.read}
                          onChange={() => handleTeamPermissionChange(team.id, 'read')}
                        />
                      </PermissionTd>
                      <PermissionTd>
                        <PermissionCheckbox
                          type="checkbox"
                          checked={team.permissions.download}
                          onChange={() => handleTeamPermissionChange(team.id, 'download')}
                        />
                      </PermissionTd>
                      <PermissionTd>
                        <PermissionCheckbox
                          type="checkbox"
                          checked={team.permissions.deleteMove}
                          onChange={() => handleTeamPermissionChange(team.id, 'deleteMove')}
                        />
                      </PermissionTd>
                    </PermissionTr>
                  ))}
                </PermissionTbody>
              </PermissionTable>
            </PermissionTableContainer>
          </PermissionMainArea>
        </PermissionPageBody>
      </PermissionPageOverlay>
    </PageContainer>
  );
}

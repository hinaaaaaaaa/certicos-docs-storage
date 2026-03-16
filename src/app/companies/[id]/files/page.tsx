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
  AppSearchInput,
  AppBreadcrumb,
  AppPagination,
  AppTable,
} from '@/design-system';
// Types
interface FileData {
  id: string;
  name: string;
  size: string;
  date: string;
  uploader: string;
  type: string;
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

// Mock Data
const MOCK_COMPANIES: Record<string, string> = {
  '1': '(주)화장품회사',
  '2': '(주)뷰티케어',
  '3': '(주)스킨랩',
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

const MOCK_FILES: FileData[] = [
  { id: '1', name: 'PIF_제품A_v2.pdf', size: '2.3 MB', date: '2026-03-10', uploader: '김담당', type: 'PDF' },
  { id: '2', name: 'PIF_제품A_첨부.xlsx', size: '1.1 MB', date: '2026-03-09', uploader: '이매니저', type: 'XLSX' },
  { id: '3', name: 'PIF_검토의견.docx', size: '542 KB', date: '2026-03-08', uploader: '박컨설턴트', type: 'DOCX' },
  { id: '4', name: '성분분석표.pdf', size: '3.8 MB', date: '2026-03-07', uploader: '김담당', type: 'PDF' },
  { id: '5', name: '안전성자료.pdf', size: '5.2 MB', date: '2026-03-06', uploader: '최연구원', type: 'PDF' },
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
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
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

const PaginationWrapper = styled.div`
  margin-top: 24px;
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

const ActiveFilters = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
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

const AVAILABLE_TAGS = ['PIF', 'QCQA', '견적서', '인허가', '성분분석', '안전성'];
const FILE_TYPES = [
  { value: 'all', label: '전체 파일' },
  { value: 'pdf', label: 'PDF' },
  { value: 'xlsx', label: 'Excel' },
  { value: 'docx', label: 'Word' },
  { value: 'image', label: '이미지' },
];
const UPLOADERS = [
  { value: 'all', label: '전체 업로더' },
  { value: '김담당', label: '김담당' },
  { value: '이매니저', label: '이매니저' },
  { value: '박컨설턴트', label: '박컨설턴트' },
  { value: '최연구원', label: '최연구원' },
];

// Component
export default function FileListPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  const companyName = MOCK_COMPANIES[companyId] || '회사명';

  const [selectedFolder, setSelectedFolder] = useState('1-1-3');
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['1', '1-1']);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>([]);
  const [uploaderFilter, setUploaderFilter] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  const handleFileTypeToggle = (type: string) => {
    setSelectedFileTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleClearFilters = () => {
    setSelectedFileTypes([]);
    setUploaderFilter('all');
    setSelectedTags([]);
    setSearchValue('');
  };

  // 파일 업로드 처리
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

    // 업로드 시뮬레이션
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === uploadId ? { ...f, progress: 100, status: 'completed' } : f
          )
        );
        // 3초 후 완료된 파일 제거
        setTimeout(() => {
          setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadId));
        }, 3000);
      } else {
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === uploadId ? { ...f, progress: Math.min(progress, 99) } : f
          )
        );
      }
    }, 300);
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => simulateUpload(file));
  };

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
    handleFileSelect(e.dataTransfer.files);
  };

  const handleCancelUpload = (uploadId: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadId));
  };

  // 검색어 하이라이팅 함수
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <HighlightedText key={i}>{part}</HighlightedText> : part
    );
  };

  // 파일 필터링
  const filteredFiles = MOCK_FILES.filter((file) => {
    // 파일명 검색
    if (searchValue && !file.name.toLowerCase().includes(searchValue.toLowerCase())) {
      return false;
    }
    // 파일 타입 필터 (다중 선택)
    if (selectedFileTypes.length > 0) {
      const fileExt = file.type.toLowerCase();
      const matchesType = selectedFileTypes.some((type) => {
        if (type === 'image') {
          return ['jpg', 'png', 'gif', 'jpeg'].includes(fileExt);
        }
        return fileExt === type;
      });
      if (!matchesType) return false;
    }
    // 업로더 필터
    if (uploaderFilter !== 'all' && file.uploader !== uploaderFilter) {
      return false;
    }
    return true;
  });

  const renderFolder = (folder: FolderNode, level: number = 0) => {
    const hasChildren = folder.children && folder.children.length > 0;
    const isExpanded = expandedFolders.includes(folder.id);
    const isSelected = selectedFolder === folder.id;

    return (
      <div key={folder.id}>
        <FolderItem
          $level={level}
          $selected={isSelected}
          onClick={() => {
            setSelectedFolder(folder.id);
            if (hasChildren) toggleFolder(folder.id);
          }}
        >
          <AppIcon
            name={hasChildren ? (isExpanded ? 'folderOpen' : 'folder') : 'file'}
            size={18}
            fillColor={isSelected ? 'ICON_PRIMARY' : 'ICON_ASSISTIVE'}
          />
          <AppTypography
            variant="BODY2_400"
            color={isSelected ? 'TEXT_PRIMARY' : 'TEXT_NORMAL'}
          >
            {folder.name}
          </AppTypography>
        </FolderItem>
        {hasChildren &&
          isExpanded &&
          folder.children?.map((child) => renderFolder(child, level + 1))}
      </div>
    );
  };

  const tableColumns: Array<{
    key: string;
    title: string;
    width?: string;
    render?: (value: unknown, record: FileData, index: number) => React.ReactNode;
  }> = [
    {
      key: 'name',
      title: '파일명',
      width: '40%',
      render: (_: unknown, record: FileData) => (
        <FileNameCell>
          <FileIcon>{record.type}</FileIcon>
          <AppTypography variant="BODY2_400" color="TEXT_NORMAL">
            {highlightText(record.name, searchValue)}
          </AppTypography>
        </FileNameCell>
      ),
    },
    { key: 'size', title: '크기', width: '100px' },
    { key: 'date', title: '수정일', width: '120px' },
    { key: 'uploader', title: '업로더', width: '100px' },
    {
      key: 'actions',
      title: '',
      width: '100px',
      render: (_: unknown, record: FileData) => (
        <div style={{ display: 'flex', gap: '4px' }}>
          <AppIconButton icon="download" size="SMALL" />
          <ActionMenu>
            <AppIconButton
              icon="more"
              size="SMALL"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(openMenuId === record.id ? null : record.id);
              }}
            />
            <ActionDropdown $isOpen={openMenuId === record.id}>
              <ActionItem>
                <AppIcon name="download" size={16} fillColor="ICON_NEUTRAL" />
                다운로드
              </ActionItem>
              <ActionItem style={{ color: COLOR.RED60 }}>
                <AppIcon name="delete" size={16} fillColor="ICON_NEUTRAL" />
                삭제
              </ActionItem>
            </ActionDropdown>
          </ActionMenu>
        </div>
      ),
    },
  ];

  return (
    <PageContainer onClick={() => setOpenMenuId(null)}>
      <Header>
        <BackButton onClick={() => router.push('/companies')}>
          <AppIcon name="chevronLeft" size={16} fillColor="ICON_NEUTRAL" />
          목록
        </BackButton>

        <CompanyName>
          <AppTypography variant="TITLE3_500" color="TEXT_STRONG">
            {companyName}
          </AppTypography>
        </CompanyName>

        <FilterGroup>
          <AppSelect
            placeholder="컨설턴트"
            width={140}
            options={[
              { value: '1', label: '박컨설턴트' },
              { value: '2', label: '김컨설턴트' },
            ]}
          />
          <AppSelect
            placeholder="서류취합 담당자"
            width={140}
            options={[
              { value: '1', label: '이담당' },
              { value: '2', label: '최담당' },
            ]}
          />
          <AppSelect
            placeholder="품질 담당자"
            width={140}
            options={[{ value: '1', label: '정품질' }]}
          />

          <SearchWrapper>
            <AppSearchInput
              value={searchValue}
              onChange={setSearchValue}
              placeholder="파일명 검색..."
              width={240}
            />
          </SearchWrapper>

          <FilterToggle
            $active={isFilterOpen}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <AppIcon name="filter" size={16} fillColor={isFilterOpen ? 'ICON_PRIMARY' : 'ICON_ASSISTIVE'} />
            고급 필터
            {(selectedFileTypes.length > 0 || uploaderFilter !== 'all' || selectedTags.length > 0) && (
              <ActiveFilterBadge style={{ marginLeft: 4, padding: '2px 6px' }}>
                {selectedFileTypes.length + (uploaderFilter !== 'all' ? 1 : 0) + selectedTags.length}
              </ActiveFilterBadge>
            )}
          </FilterToggle>

          <AppTextButton
            variant="PRIMARY"
            size="MEDIUM"
            prefixIcon={<AppIcon name="upload" size={16} fillColor="TEXT_WHITE" />}
            onClick={() => fileInputRef.current?.click()}
          >
            업로드
          </AppTextButton>
        </FilterGroup>
      </Header>

      {isFilterOpen && (
        <FilterPanel>
          <FilterRow>
            <FilterSection>
              <FilterLabel>파일 타입</FilterLabel>
              <TagList>
                {FILE_TYPES.filter(t => t.value !== 'all').map((type) => (
                  <Tag
                    key={type.value}
                    $active={selectedFileTypes.includes(type.value)}
                    onClick={() => handleFileTypeToggle(type.value)}
                  >
                    {type.label}
                  </Tag>
                ))}
              </TagList>
            </FilterSection>

            <FilterSection>
              <FilterLabel>업로더</FilterLabel>
              <AppSelect
                placeholder="전체 업로더"
                width={130}
                value={uploaderFilter}
                onChange={(value) => setUploaderFilter(String(value))}
                options={UPLOADERS}
              />
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

            {(selectedFileTypes.length > 0 || uploaderFilter !== 'all' || selectedTags.length > 0 || searchValue) && (
              <ClearFilterButton onClick={handleClearFilters}>
                <AppIcon name="close" size={12} fillColor="ICON_ASSISTIVE" />
                필터 초기화
              </ClearFilterButton>
            )}
          </FilterRow>
        </FilterPanel>
      )}

      <MainContent>
        <Sidebar>
          <SidebarTitle>
            <AppTypography variant="SMALL_500" color="TEXT_ASSISTIVE">
              폴더
            </AppTypography>
          </SidebarTitle>
          {MOCK_FOLDERS.map((folder) => renderFolder(folder))}
        </Sidebar>

        <ContentArea>
          <ContentHeader>
            <AppBreadcrumb
              items={[
                { label: '25년 1차', onClick: () => {} },
                { label: '제품A', onClick: () => {} },
                { label: 'PIF' },
              ]}
            />
            <AppTypography variant="BODY2_400" color="TEXT_ASSISTIVE">
              총 {filteredFiles.length}개 파일
              {filteredFiles.length !== MOCK_FILES.length && ` (전체 ${MOCK_FILES.length}개)`}
            </AppTypography>
          </ContentHeader>

          {/* 업로드 영역 */}
          <UploadZone
            $isDragging={isDragging}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadZoneContent>
              <AppIcon name="upload" size={32} fillColor={isDragging ? 'ICON_PRIMARY' : 'ICON_ASSISTIVE'} />
              <AppTypography variant="BODY2_500" color={isDragging ? 'TEXT_PRIMARY' : 'TEXT_NORMAL'}>
                파일을 드래그하거나 클릭하여 업로드
              </AppTypography>
              <AppTypography variant="SMALL_400" color="TEXT_ASSISTIVE">
                PDF, Excel, Word, 이미지 파일 지원 (최대 100MB)
              </AppTypography>
            </UploadZoneContent>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </UploadZone>

          {/* 업로드 중인 파일 목록 */}
          {uploadingFiles.length > 0 && (
            <UploadingList>
              {uploadingFiles.map((file) => (
                <UploadingRow key={file.id}>
                  <FileIcon>
                    {file.name.split('.').pop()?.toUpperCase() || 'FILE'}
                  </FileIcon>
                  <UploadingFileInfo>
                    <UploadingFileName>{file.name}</UploadingFileName>
                    <UploadingFileMeta>
                      {file.size} • {file.status === 'completed' ? '완료' : file.status === 'error' ? '오류' : '업로드 중...'}
                    </UploadingFileMeta>
                  </UploadingFileInfo>
                  <ProgressBarWrapper>
                    <ProgressBar>
                      <ProgressFill $progress={file.progress} $status={file.status} />
                    </ProgressBar>
                    <ProgressText $status={file.status}>
                      {file.status === 'completed' ? '완료' : file.status === 'error' ? '실패' : `${Math.round(file.progress)}%`}
                    </ProgressText>
                  </ProgressBarWrapper>
                  {file.status === 'uploading' && (
                    <AppIconButton
                      icon="close"
                      size="SMALL"
                      onClick={() => handleCancelUpload(file.id)}
                    />
                  )}
                </UploadingRow>
              ))}
            </UploadingList>
          )}

          <AppTable<FileData> columns={tableColumns} data={filteredFiles} rowKey="id" />

          <PaginationWrapper>
            <AppPagination
              total={50}
              perPage={10}
              currentPage={currentPage}
              onChangePage={setCurrentPage}
            />
          </PaginationWrapper>
        </ContentArea>
      </MainContent>
    </PageContainer>
  );
}

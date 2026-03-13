'use client';

import styled from 'styled-components';
import { useState, useRef } from 'react';
import { COLOR, SEMANTIC, AppTypography, AppIcon, AppTextButton } from '@/design-system';
import AppModal from '@/design-system/components/AppModal';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DropZone = styled.div<{ $isDragging: boolean }>`
  border: 2px dashed ${({ $isDragging }) => ($isDragging ? COLOR.PRIMARY60 : COLOR.GRAY30)};
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  background: ${({ $isDragging }) => ($isDragging ? COLOR.PRIMARY10 : COLOR.GRAY10)};
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: ${COLOR.PRIMARY50};
    background: ${COLOR.PRIMARY10};
  }
`;

const DropZoneIcon = styled.div`
  width: 48px;
  height: 48px;
  background: ${COLOR.PRIMARY10};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
`;

const HiddenInput = styled.input`
  display: none;
`;

const FileList = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: ${COLOR.GRAY10};
  border-radius: 8px;
`;

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileName = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ProgressBar = styled.div`
  height: 4px;
  background: ${COLOR.GRAY30};
  border-radius: 2px;
  margin-top: 8px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $progress: number; $status: string }>`
  height: 100%;
  width: ${({ $progress }) => $progress}%;
  background: ${({ $status }) =>
    $status === 'error' ? COLOR.RED60 : $status === 'complete' ? COLOR.GREEN50 : COLOR.PRIMARY60};
  border-radius: 2px;
  transition: width 0.3s ease;
`;

const FileSize = styled.span`
  color: ${SEMANTIC.TEXT_ASSISTIVE};
  font-size: 12px;
`;

const StatusIcon = styled.div<{ $status: string }>`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid ${COLOR.GRAY20};
`;

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
};

export const UploadModal = ({ isOpen, onClose }: UploadModalProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const uploadFiles: UploadFile[] = newFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'pending',
    }));
    setFiles((prev) => [...prev, ...uploadFiles]);

    // Simulate upload progress
    uploadFiles.forEach((uploadFile) => {
      simulateUpload(uploadFile.id);
    });
  };

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, progress: 100, status: 'complete' } : f
          )
        );
      } else {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, progress, status: 'uploading' } : f
          )
        );
      }
    }, 500);
  };

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleClose = () => {
    setFiles([]);
    onClose();
  };

  return (
    <AppModal isOpen={isOpen} onClose={handleClose} title="파일 업로드" width={520}>
      <DropZone
        $isDragging={isDragging}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <DropZoneIcon>
          <AppIcon name="upload" size={24} fillColor="ICON_PRIMARY" />
        </DropZoneIcon>
        <AppTypography variant="BODY1_500" color="TEXT_NORMAL">
          파일을 드래그하거나 클릭하여 선택
        </AppTypography>
        <div style={{ marginTop: 8 }}>
          <AppTypography variant="BODY2_400" color="TEXT_ASSISTIVE">
            최대 20GB까지 업로드 가능
          </AppTypography>
        </div>
        <HiddenInput
          ref={inputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
        />
      </DropZone>

      {files.length > 0 && (
        <FileList>
          {files.map((uploadFile) => (
            <FileItem key={uploadFile.id}>
              <AppIcon name="file" size={20} fillColor="ICON_NEUTRAL" />
              <FileInfo>
                <FileName>
                  <AppTypography variant="BODY2_400" color="TEXT_NORMAL">
                    {uploadFile.file.name}
                  </AppTypography>
                </FileName>
                <FileSize>{formatFileSize(uploadFile.file.size)}</FileSize>
                {uploadFile.status !== 'complete' && (
                  <ProgressBar>
                    <ProgressFill
                      $progress={uploadFile.progress}
                      $status={uploadFile.status}
                    />
                  </ProgressBar>
                )}
              </FileInfo>
              <StatusIcon $status={uploadFile.status}>
                {uploadFile.status === 'complete' ? (
                  <AppIcon name="file" size={16} fillColor="ICON_PRIMARY" />
                ) : (
                  <AppTypography variant="SMALL_500" color="TEXT_PRIMARY">
                    {Math.round(uploadFile.progress)}%
                  </AppTypography>
                )}
              </StatusIcon>
              <button
                onClick={() => removeFile(uploadFile.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <AppIcon name="close" size={16} fillColor="ICON_ASSISTIVE" />
              </button>
            </FileItem>
          ))}
        </FileList>
      )}

      <Footer>
        <AppTextButton variant="SECONDARY" onClick={handleClose}>
          취소
        </AppTextButton>
        <AppTextButton
          variant="PRIMARY"
          disabled={files.length === 0 || files.some((f) => f.status === 'uploading')}
        >
          업로드 완료
        </AppTextButton>
      </Footer>
    </AppModal>
  );
};

export default UploadModal;

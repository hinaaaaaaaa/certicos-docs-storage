'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { COLOR } from '@/design-system';

interface GuideNote {
  id: string;
  page: string;
  x: number;
  y: number;
  text: string;
  author: string;
  createdAt: string;
}

const STORAGE_KEY = 'design-guide-notes-v2';

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  position: fixed;
  bottom: 24px;
  right: 24px;
  height: 44px;
  padding: 0 16px;
  border-radius: 22px;
  background: ${({ $active }) => ($active ? '#10B981' : COLOR.WHITE)};
  color: ${({ $active }) => ($active ? COLOR.WHITE : COLOR.GRAY80)};
  border: ${({ $active }) => ($active ? 'none' : `1px solid ${COLOR.GRAY30}`)};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  z-index: 10003;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.02);
  }
`;

const NoteBadge = styled.span`
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #10B981;
  color: ${COLOR.WHITE};
  font-size: 11px;
  font-weight: 600;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModeIndicator = styled.div`
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: #10B981;
  color: ${COLOR.WHITE};
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10003;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NoteMarker = styled.button<{ $isEditing?: boolean }>`
  position: absolute;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #10B981;
  border: 3px solid ${COLOR.WHITE};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, -50%);
  transition: all 0.15s ease;
  z-index: 10000;
  color: ${COLOR.WHITE};
  font-size: 12px;
  font-weight: 600;

  &:hover {
    transform: translate(-50%, -50%) scale(1.15);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  }
`;

const NotePopup = styled.div<{ $position: 'left' | 'right' }>`
  position: fixed;
  width: 280px;
  max-height: 80vh;
  overflow-y: auto;
  background: ${COLOR.WHITE};
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid ${COLOR.GRAY20};
  z-index: 10002;
`;

const PopupHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: #10B981;
  color: ${COLOR.WHITE};
`;

const PopupAuthor = styled.div`
  font-size: 12px;
  font-weight: 600;
`;

const PopupTime = styled.div`
  font-size: 10px;
  opacity: 0.8;
`;

const PopupBody = styled.div`
  padding: 14px;
`;

const PopupText = styled.div`
  font-size: 14px;
  color: ${COLOR.GRAY80};
  line-height: 1.6;
  white-space: pre-wrap;
`;

const PopupActions = styled.div`
  display: flex;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid ${COLOR.GRAY20};
  background: ${COLOR.GRAY10};
`;

const ActionButton = styled.button<{ $variant?: 'danger' }>`
  flex: 1;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;

  ${({ $variant }) =>
    $variant === 'danger'
      ? `
    background: ${COLOR.WHITE};
    color: #d93025;
    border: 1px solid #d93025;
    &:hover { background: #fce8e6; }
  `
      : `
    background: ${COLOR.WHITE};
    color: ${COLOR.GRAY80};
    border: 1px solid ${COLOR.GRAY30};
    &:hover { background: ${COLOR.GRAY10}; }
  `}
`;

const NewNoteForm = styled.div`
  position: absolute;
  width: 320px;
  background: ${COLOR.WHITE};
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid ${COLOR.GRAY20};
  z-index: 10002;
  overflow: hidden;
`;

const FormHeader = styled.div`
  padding: 14px 16px;
  background: #10B981;
  color: ${COLOR.WHITE};
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormBody = styled.div`
  padding: 16px;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  font-size: 14px;
  border: 1px solid ${COLOR.GRAY30};
  border-radius: 8px;
  resize: vertical;
  outline: none;
  font-family: inherit;
  line-height: 1.5;

  &:focus {
    border-color: #10B981;
  }

  &::placeholder {
    color: ${COLOR.GRAY50};
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const FormButton = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;

  ${({ $primary }) =>
    $primary
      ? `
    background: #10B981;
    color: ${COLOR.WHITE};
    border: none;
    &:hover { background: #059669; }
    &:disabled { background: ${COLOR.GRAY40}; cursor: not-allowed; }
  `
      : `
    background: ${COLOR.WHITE};
    color: ${COLOR.GRAY80};
    border: 1px solid ${COLOR.GRAY30};
    &:hover { background: ${COLOR.GRAY10}; }
  `}
`;

const ConnectorLine = styled.div<{ $position: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${({ $position }) => ($position === 'right' ? 'left: 14px;' : 'right: 14px;')}
  width: 20px;
  height: 2px;
  background: #10B981;
  transform: translateY(-50%);
`;

const BlockingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9998;
  cursor: crosshair;
`;

export default function DesignGuide({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isEnabled, setIsEnabled] = useState(false);
  const [allNotes, setAllNotes] = useState<GuideNote[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [newNotePos, setNewNotePos] = useState<{ x: number; y: number } | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 현재 페이지 식별자 (pathname + view만 사용, companyId는 제외)
  const currentPageId = useMemo(() => {
    const view = searchParams.get('view');
    return view ? `${pathname}?view=${view}` : pathname;
  }, [pathname, searchParams]);

  // 현재 페이지의 노트만 필터링
  const currentPageNotes = useMemo(() => {
    if (!currentPageId) return [];
    return allNotes.filter(note => note.page === currentPageId);
  }, [allNotes, currentPageId]);

  // 최초 마운트 시 localStorage에서 노트 로드
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAllNotes(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error('Failed to load notes:', e);
        setAllNotes([]);
      }
    }
  }, []);

  // 페이지 변경 시 UI 상태 초기화
  useEffect(() => {
    setActiveNoteId(null);
    setNewNotePos(null);
    setIsEnabled(false);
  }, [currentPageId]);

  // 노트 변경 시 localStorage에 저장
  useEffect(() => {
    if (allNotes.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allNotes));
    }
  }, [allNotes]);

  const handleWrapperClick = (e: React.MouseEvent) => {
    if (!isEnabled) return;

    const target = e.target as HTMLElement;
    if (target.closest('[data-design-guide]') && !target.closest('[data-blocking-overlay]')) return;

    // 문서 좌표 사용 (콘텐츠와 함께 스크롤)
    const x = e.clientX + window.scrollX;
    const y = e.clientY + window.scrollY;

    setActiveNoteId(null);
    setNewNotePos({ x, y });
    setNewNoteText('');
  };

  const handleAddNote = () => {
    if (!newNotePos || !newNoteText.trim() || !currentPageId) return;

    const newNote: GuideNote = {
      id: `note-${Date.now()}`,
      page: currentPageId,
      x: newNotePos.x,
      y: newNotePos.y,
      text: newNoteText.trim(),
      author: '디자이너',
      createdAt: new Date().toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setAllNotes((prev) => [...prev, newNote]);
    setNewNotePos(null);
    setNewNoteText('');
  };

  const handleDeleteNote = (id: string) => {
    setAllNotes((prev) => prev.filter((n) => n.id !== id));
    setActiveNoteId(null);
  };

  const handleNoteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNewNotePos(null);
    setActiveNoteId(activeNoteId === id ? null : id);
  };

  // 팝업 위치 계산 (화면 내에 유지)
  const getPopupStyle = (noteX: number, noteY: number) => {
    const popupWidth = 280;
    const popupHeight = 200;
    const margin = 30;

    // 뷰포트 좌표로 변환
    const viewportX = noteX - window.scrollX;
    const viewportY = noteY - window.scrollY;

    // 좌우 위치 결정
    const showOnLeft = viewportX > window.innerWidth / 2;

    // X 좌표 계산
    let left: number;
    if (showOnLeft) {
      left = viewportX - popupWidth - margin;
    } else {
      left = viewportX + margin;
    }

    // 화면 밖으로 나가지 않도록 조정
    left = Math.max(10, Math.min(left, window.innerWidth - popupWidth - 10));

    // Y 좌표 계산 (중앙 정렬, 화면 내 유지)
    let top = viewportY - popupHeight / 2;
    top = Math.max(10, Math.min(top, window.innerHeight - popupHeight - 10));

    return { left, top, showOnLeft };
  };

  return (
    <Wrapper ref={wrapperRef}>
      {children}

      {/* Blocking overlay when edit mode is enabled */}
      {isEnabled && (
        <BlockingOverlay onClick={handleWrapperClick} data-design-guide data-blocking-overlay />
      )}

      {/* Note markers */}
      {currentPageNotes.map((note, index) => (
        <div key={note.id} style={{ position: 'absolute', left: note.x, top: note.y, zIndex: 9999 }} data-design-guide>
          <NoteMarker onClick={(e) => handleNoteClick(e, note.id)}>
            {index + 1}
          </NoteMarker>

          {activeNoteId === note.id && (() => {
            const popupStyle = getPopupStyle(note.x, note.y);
            return (
              <NotePopup
                $position={popupStyle.showOnLeft ? 'left' : 'right'}
                style={{ left: popupStyle.left, top: popupStyle.top }}
                onClick={(e) => e.stopPropagation()}
              >
                <PopupHeader>
                  <PopupAuthor>{note.author}</PopupAuthor>
                  <PopupTime>{note.createdAt}</PopupTime>
                </PopupHeader>
                <PopupBody>
                  <PopupText>{note.text}</PopupText>
                </PopupBody>
                {isEnabled && (
                  <PopupActions>
                    <ActionButton $variant="danger" onClick={() => handleDeleteNote(note.id)}>
                      삭제
                    </ActionButton>
                  </PopupActions>
                )}
              </NotePopup>
            );
          })()}
        </div>
      ))}

      {/* New note form */}
      {newNotePos && isEnabled && (() => {
        const formStyle = getPopupStyle(newNotePos.x, newNotePos.y);
        return (
          <>
            <div style={{ position: 'absolute', left: newNotePos.x, top: newNotePos.y, zIndex: 9999 }} data-design-guide>
              <NoteMarker $isEditing>+</NoteMarker>
            </div>
            <NewNoteForm
              style={{
                position: 'fixed',
                left: formStyle.left,
                top: formStyle.top,
              }}
              onClick={(e) => e.stopPropagation()}
              data-design-guide
            >
              <FormHeader>
                <span>📝</span> 설명 추가
              </FormHeader>
              <FormBody>
                <TextArea
                  placeholder="이 부분에 대한 설명을 작성하세요..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  autoFocus
                />
                <FormActions>
                  <FormButton onClick={() => setNewNotePos(null)}>취소</FormButton>
                  <FormButton $primary onClick={handleAddNote} disabled={!newNoteText.trim()}>
                    추가
                  </FormButton>
                </FormActions>
              </FormBody>
            </NewNoteForm>
          </>
        );
      })()}

      {/* Mode indicator */}
      {isEnabled && (
        <ModeIndicator data-design-guide>
          <span>📝</span> 편집 모드 — 화면을 클릭하여 설명을 추가하세요
        </ModeIndicator>
      )}

      {/* Toggle button */}
      <ToggleButton $active={isEnabled} onClick={() => { setIsEnabled(!isEnabled); setActiveNoteId(null); setNewNotePos(null); }} data-design-guide>
        <span>📝</span>
        {isEnabled ? '편집 종료' : '디자인 가이드'}
        {!isEnabled && currentPageNotes.length > 0 && <NoteBadge>{currentPageNotes.length}</NoteBadge>}
      </ToggleButton>
    </Wrapper>
  );
}

'use client';

import styled from 'styled-components';
import { useState } from 'react';
import {
  COLOR,
  SEMANTIC,
  AppTypography,
  AppIcon,
  AppTextButton,
  AppSelect,
  AppIconButton,
} from '@/design-system';
import AppDrawer from '@/design-system/components/AppDrawer';

interface TeamPermission {
  id: string;
  name: string;
  department: string;
  permissions: {
    upload: boolean;
    preview: boolean;
    download: boolean;
    delete: boolean;
    move: boolean;
  };
}

interface FolderPermissionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  folderName?: string;
}

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const FolderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: ${COLOR.GRAY10};
  border-radius: 8px;
  margin-bottom: 20px;
`;

const FolderIconWrapper = styled.div`
  width: 40px;
  height: 40px;
  background: ${COLOR.PRIMARY10};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TeamList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TeamCard = styled.div`
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.GRAY30};
  border-radius: 8px;
  overflow: hidden;
`;

const TeamHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: ${COLOR.GRAY10};
  border-bottom: 1px solid ${COLOR.GRAY20};
`;

const TeamInfo = styled.div`
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

const PermissionItem = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: ${COLOR.PRIMARY60};
  cursor: pointer;
`;

const PermissionLabel = styled.span`
  font-size: 11px;
  color: ${COLOR.GRAY70};
  text-align: center;
`;

const AddTeamButton = styled.button`
  width: 100%;
  padding: 12px;
  border: 2px dashed ${COLOR.GRAY30};
  border-radius: 8px;
  background: transparent;
  color: ${COLOR.GRAY60};
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    border-color: ${COLOR.PRIMARY60};
    color: ${COLOR.PRIMARY60};
  }
`;

const QuickPermission = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const QuickButton = styled.button<{ $active?: boolean }>`
  padding: 6px 12px;
  border: 1px solid ${({ $active }) => ($active ? COLOR.PRIMARY60 : COLOR.GRAY30)};
  border-radius: 6px;
  background: ${({ $active }) => ($active ? COLOR.PRIMARY10 : COLOR.WHITE)};
  color: ${({ $active }) => ($active ? COLOR.PRIMARY60 : COLOR.GRAY70)};
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${COLOR.PRIMARY60};
  }
`;

const Divider = styled.div`
  height: 1px;
  background: ${COLOR.GRAY20};
  margin: 24px 0;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid ${COLOR.GRAY20};
`;

const PERMISSION_PRESETS = {
  full: { upload: true, preview: true, download: true, delete: true, move: true },
  write: { upload: true, preview: true, download: true, delete: false, move: false },
  read: { upload: false, preview: true, download: true, delete: false, move: false },
};

const MOCK_TEAMS: TeamPermission[] = [
  {
    id: '1',
    name: '데이터팀',
    department: '컨설팅본부',
    permissions: { upload: true, preview: true, download: true, delete: true, move: true },
  },
  {
    id: '2',
    name: 'RA 1팀',
    department: '자동화솔루션본부',
    permissions: { upload: true, preview: true, download: true, delete: false, move: false },
  },
  {
    id: '3',
    name: 'QCQA팀',
    department: '컨설팅본부',
    permissions: { upload: false, preview: true, download: true, delete: false, move: false },
  },
];

export const FolderPermissionDrawer = ({
  isOpen,
  onClose,
  folderName = 'PIF',
}: FolderPermissionDrawerProps) => {
  const [teams, setTeams] = useState<TeamPermission[]>(MOCK_TEAMS);

  const handlePermissionChange = (
    teamId: string,
    permission: keyof TeamPermission['permissions']
  ) => {
    setTeams((prev) =>
      prev.map((team) =>
        team.id === teamId
          ? {
              ...team,
              permissions: {
                ...team.permissions,
                [permission]: !team.permissions[permission],
              },
            }
          : team
      )
    );
  };

  const handlePresetChange = (
    teamId: string,
    preset: keyof typeof PERMISSION_PRESETS
  ) => {
    setTeams((prev) =>
      prev.map((team) =>
        team.id === teamId
          ? { ...team, permissions: PERMISSION_PRESETS[preset] }
          : team
      )
    );
  };

  const getActivePreset = (permissions: TeamPermission['permissions']) => {
    if (
      permissions.upload &&
      permissions.preview &&
      permissions.download &&
      permissions.delete &&
      permissions.move
    ) {
      return 'full';
    }
    if (
      permissions.upload &&
      permissions.preview &&
      permissions.download &&
      !permissions.delete &&
      !permissions.move
    ) {
      return 'write';
    }
    if (
      !permissions.upload &&
      permissions.preview &&
      permissions.download &&
      !permissions.delete &&
      !permissions.move
    ) {
      return 'read';
    }
    return null;
  };

  const handleRemoveTeam = (teamId: string) => {
    setTeams((prev) => prev.filter((team) => team.id !== teamId));
  };

  return (
    <AppDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="폴더 권한 설정"
      width={480}
    >
      <FolderInfo>
        <FolderIconWrapper>
          <AppIcon name="folder" size={24} fillColor="ICON_PRIMARY" />
        </FolderIconWrapper>
        <div>
          <AppTypography variant="BODY1_500" color="TEXT_STRONG">
            {folderName}
          </AppTypography>
          <AppTypography variant="SMALL_400" color="TEXT_ASSISTIVE">
            25년 1차 {'>'} 제품A {'>'} {folderName}
          </AppTypography>
        </div>
      </FolderInfo>

      <Section>
        <SectionHeader>
          <AppTypography variant="BODY2_600" color="TEXT_NORMAL">
            권한 대상 팀 ({teams.length})
          </AppTypography>
        </SectionHeader>

        <TeamList>
          {teams.map((team) => {
            const activePreset = getActivePreset(team.permissions);

            return (
              <TeamCard key={team.id}>
                <TeamHeader>
                  <TeamInfo>
                    <AppTypography variant="BODY2_500" color="TEXT_NORMAL">
                      {team.name}
                    </AppTypography>
                    <TeamBadge>{team.department}</TeamBadge>
                  </TeamInfo>
                  <AppIconButton
                    icon="close"
                    size="SMALL"
                    onClick={() => handleRemoveTeam(team.id)}
                  />
                </TeamHeader>

                <div style={{ padding: '12px 16px' }}>
                  <AppTypography variant="SMALL_500" color="TEXT_ASSISTIVE">
                    빠른 설정
                  </AppTypography>
                  <QuickPermission>
                    <QuickButton
                      $active={activePreset === 'full'}
                      onClick={() => handlePresetChange(team.id, 'full')}
                    >
                      전체 권한
                    </QuickButton>
                    <QuickButton
                      $active={activePreset === 'write'}
                      onClick={() => handlePresetChange(team.id, 'write')}
                    >
                      쓰기/읽기
                    </QuickButton>
                    <QuickButton
                      $active={activePreset === 'read'}
                      onClick={() => handlePresetChange(team.id, 'read')}
                    >
                      읽기 전용
                    </QuickButton>
                  </QuickPermission>
                </div>

                <Divider style={{ margin: '0' }} />

                <PermissionGrid>
                  <PermissionItem>
                    <Checkbox
                      type="checkbox"
                      checked={team.permissions.upload}
                      onChange={() => handlePermissionChange(team.id, 'upload')}
                    />
                    <PermissionLabel>업로드</PermissionLabel>
                  </PermissionItem>
                  <PermissionItem>
                    <Checkbox
                      type="checkbox"
                      checked={team.permissions.preview}
                      onChange={() => handlePermissionChange(team.id, 'preview')}
                    />
                    <PermissionLabel>미리보기</PermissionLabel>
                  </PermissionItem>
                  <PermissionItem>
                    <Checkbox
                      type="checkbox"
                      checked={team.permissions.download}
                      onChange={() => handlePermissionChange(team.id, 'download')}
                    />
                    <PermissionLabel>다운로드</PermissionLabel>
                  </PermissionItem>
                  <PermissionItem>
                    <Checkbox
                      type="checkbox"
                      checked={team.permissions.delete}
                      onChange={() => handlePermissionChange(team.id, 'delete')}
                    />
                    <PermissionLabel>삭제</PermissionLabel>
                  </PermissionItem>
                  <PermissionItem>
                    <Checkbox
                      type="checkbox"
                      checked={team.permissions.move}
                      onChange={() => handlePermissionChange(team.id, 'move')}
                    />
                    <PermissionLabel>이동</PermissionLabel>
                  </PermissionItem>
                </PermissionGrid>
              </TeamCard>
            );
          })}

          <AddTeamButton>
            <AppIcon name="plus" size={16} fillColor="ICON_ASSISTIVE" />
            팀 추가
          </AddTeamButton>
        </TeamList>
      </Section>

      <Footer>
        <AppTextButton variant="SECONDARY" onClick={onClose}>
          취소
        </AppTextButton>
        <AppTextButton variant="PRIMARY" onClick={onClose}>
          저장
        </AppTextButton>
      </Footer>
    </AppDrawer>
  );
};

export default FolderPermissionDrawer;

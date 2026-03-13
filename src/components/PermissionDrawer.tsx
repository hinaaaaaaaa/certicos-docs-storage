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
  AppSearchInput,
  AppIconButton,
} from '@/design-system';
import AppDrawer from '@/design-system/components/AppDrawer';

interface SharedUser {
  id: string;
  name: string;
  email: string;
  permission: 'view' | 'download' | 'edit';
  type: 'user' | 'team';
}

interface PermissionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  fileName?: string;
}

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.div`
  margin-bottom: 12px;
`;

const SearchRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: ${COLOR.GRAY10};
  border-radius: 8px;
`;

const Avatar = styled.div<{ $isTeam?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: ${({ $isTeam }) => ($isTeam ? '8px' : '50%')};
  background: ${({ $isTeam }) => ($isTeam ? COLOR.PRIMARY10 : COLOR.GRAY30)};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TeamBadge = styled.span`
  font-size: 10px;
  padding: 2px 6px;
  background: ${COLOR.PRIMARY10};
  color: ${COLOR.PRIMARY60};
  border-radius: 4px;
`;

const Divider = styled.div`
  height: 1px;
  background: ${COLOR.GRAY20};
  margin: 24px 0;
`;

const LinkSection = styled.div`
  background: ${COLOR.GRAY10};
  border-radius: 8px;
  padding: 16px;
`;

const LinkRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
`;

const LinkInput = styled.input`
  flex: 1;
  height: 36px;
  padding: 0 12px;
  border: 1px solid ${COLOR.GRAY30};
  border-radius: 4px;
  font-size: 13px;
  color: ${SEMANTIC.TEXT_NORMAL};
  background: ${COLOR.WHITE};

  &:read-only {
    background: ${COLOR.GRAY10};
  }
`;

const OptionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid ${COLOR.GRAY20};
`;

const MOCK_SHARED_USERS: SharedUser[] = [
  { id: '1', name: '홍길동', email: 'hong@company.com', permission: 'download', type: 'user' },
  { id: '2', name: 'RA 1팀', email: '', permission: 'edit', type: 'team' },
  { id: '3', name: '김영희', email: 'kim@company.com', permission: 'view', type: 'user' },
];

export const PermissionDrawer = ({ isOpen, onClose, fileName }: PermissionDrawerProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>(MOCK_SHARED_USERS);
  const [linkExpiry, setLinkExpiry] = useState('7');
  const [shareLink] = useState('https://certicos.co.kr/share/abc123xyz');

  const handlePermissionChange = (userId: string, permission: string) => {
    setSharedUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, permission: permission as SharedUser['permission'] } : user
      )
    );
  };

  const handleRemoveUser = (userId: string) => {
    setSharedUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
  };

  return (
    <AppDrawer isOpen={isOpen} onClose={onClose} title="공유 설정" width={420}>
      {fileName && (
        <div style={{ marginBottom: 20 }}>
          <AppTypography variant="BODY2_400" color="TEXT_ASSISTIVE">
            파일: {fileName}
          </AppTypography>
        </div>
      )}

      <Section>
        <SectionTitle>
          <AppTypography variant="BODY2_600" color="TEXT_NORMAL">
            사용자 추가
          </AppTypography>
        </SectionTitle>
        <SearchRow>
          <AppSearchInput
            value={searchValue}
            onChange={setSearchValue}
            placeholder="이름, 이메일 또는 팀 검색..."
            width="100%"
          />
        </SearchRow>
      </Section>

      <Section>
        <SectionTitle>
          <AppTypography variant="BODY2_600" color="TEXT_NORMAL">
            공유 대상 ({sharedUsers.length})
          </AppTypography>
        </SectionTitle>
        <UserList>
          {sharedUsers.map((user) => (
            <UserItem key={user.id}>
              <Avatar $isTeam={user.type === 'team'}>
                <AppIcon
                  name={user.type === 'team' ? 'folder' : 'file'}
                  size={18}
                  fillColor={user.type === 'team' ? 'ICON_PRIMARY' : 'ICON_NEUTRAL'}
                />
              </Avatar>
              <UserInfo>
                <UserName>
                  <AppTypography variant="BODY2_500" color="TEXT_NORMAL">
                    {user.name}
                  </AppTypography>
                  {user.type === 'team' && <TeamBadge>팀</TeamBadge>}
                </UserName>
                {user.email && (
                  <AppTypography variant="SMALL_400" color="TEXT_ASSISTIVE">
                    {user.email}
                  </AppTypography>
                )}
              </UserInfo>
              <AppSelect
                value={user.permission}
                width={100}
                options={[
                  { value: 'view', label: '보기' },
                  { value: 'download', label: '다운로드' },
                  { value: 'edit', label: '편집' },
                ]}
                onChange={(value) => handlePermissionChange(user.id, String(value))}
              />
              <AppIconButton
                icon="close"
                size="SMALL"
                onClick={() => handleRemoveUser(user.id)}
              />
            </UserItem>
          ))}
        </UserList>
      </Section>

      <Divider />

      <Section>
        <SectionTitle>
          <AppTypography variant="BODY2_600" color="TEXT_NORMAL">
            공유 링크
          </AppTypography>
        </SectionTitle>
        <LinkSection>
          <AppTypography variant="SMALL_400" color="TEXT_ASSISTIVE">
            링크가 있는 사용자는 파일을 볼 수 있습니다.
          </AppTypography>
          <LinkRow>
            <LinkInput type="text" value={shareLink} readOnly />
            <AppTextButton variant="SECONDARY" size="SMALL" onClick={copyLink}>
              복사
            </AppTextButton>
          </LinkRow>
          <OptionRow>
            <AppTypography variant="SMALL_400" color="TEXT_NEUTRAL">
              만료 기간
            </AppTypography>
            <AppSelect
              value={linkExpiry}
              width={100}
              options={[
                { value: '1', label: '1일' },
                { value: '7', label: '7일' },
                { value: '30', label: '30일' },
              ]}
              onChange={(value) => setLinkExpiry(String(value))}
            />
          </OptionRow>
        </LinkSection>
      </Section>

      <Footer>
        <AppTextButton variant="SECONDARY" onClick={onClose}>
          취소
        </AppTextButton>
        <AppTextButton variant="PRIMARY">저장</AppTextButton>
      </Footer>
    </AppDrawer>
  );
};

export default PermissionDrawer;

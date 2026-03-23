'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { COLOR } from '@/design-system';

interface CSSProperty {
  name: string;
  value: string;
  category: 'layout' | 'spacing' | 'typography' | 'colors' | 'border' | 'effects';
}

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  position: fixed;
  bottom: 24px;
  right: 180px;
  height: 44px;
  padding: 0 16px;
  border-radius: 22px;
  background: ${({ $active }) => ($active ? COLOR.PRIMARY60 : COLOR.WHITE)};
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


const HighlightBox = styled.div`
  position: fixed;
  border: 2px solid ${COLOR.PRIMARY60};
  background: rgba(55, 133, 247, 0.1);
  pointer-events: none;
  z-index: 9999;
  transition: all 0.1s ease;
`;

const SizeLabel = styled.div`
  position: absolute;
  top: -24px;
  left: 0;
  background: ${COLOR.PRIMARY60};
  color: white;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 3px;
  white-space: nowrap;
`;

const Panel = styled.div`
  position: fixed;
  top: 80px;
  right: 24px;
  width: 320px;
  max-height: calc(100vh - 120px);
  background: ${COLOR.WHITE};
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid ${COLOR.GRAY30};
  z-index: 10001;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const PanelHeader = styled.div`
  padding: 14px 16px;
  background: ${COLOR.GRAY10};
  border-bottom: 1px solid ${COLOR.GRAY20};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PanelTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${COLOR.GRAY90};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ViewToggle = styled.div`
  display: flex;
  background: ${COLOR.GRAY20};
  border-radius: 6px;
  padding: 2px;
`;

const ViewToggleButton = styled.button<{ $active: boolean }>`
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 500;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
  background: ${({ $active }) => ($active ? COLOR.WHITE : 'transparent')};
  color: ${({ $active }) => ($active ? COLOR.GRAY90 : COLOR.GRAY60)};
  box-shadow: ${({ $active }) => ($active ? '0 1px 2px rgba(0,0,0,0.1)' : 'none')};

  &:hover {
    color: ${COLOR.GRAY90};
  }
`;

const CodeView = styled.div`
  position: relative;
  padding: 16px;
  background: #1e1e1e;
  border-radius: 0;
  overflow: auto;
  flex: 1;
`;

const CodeBlock = styled.pre`
  margin: 0;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
  font-size: 12px;
  line-height: 1.6;
  color: #d4d4d4;
  white-space: pre-wrap;
  word-break: break-all;
`;

const CodeCopyButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 500;
  color: ${COLOR.WHITE};
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const ElementTag = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: ${COLOR.PRIMARY60};
  background: ${COLOR.PRIMARY10};
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
`;

const CloseButton = styled.button`
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: ${COLOR.GRAY60};

  &:hover {
    background: ${COLOR.GRAY20};
  }
`;

const CopyAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  color: ${COLOR.PRIMARY60};
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.PRIMARY60};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: ${COLOR.PRIMARY10};
  }
`;

const PanelFooter = styled.div`
  padding: 12px 16px;
  border-top: 1px solid ${COLOR.GRAY20};
  background: ${COLOR.GRAY10};
`;

const PanelBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
`;

const CategorySection = styled.div`
  margin-bottom: 8px;
`;

const CategoryTitle = styled.div`
  font-size: 10px;
  font-weight: 600;
  color: ${COLOR.GRAY60};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 8px 16px 6px;
`;

const PropertyRow = styled.div`
  display: flex;
  align-items: center;
  padding: 6px 16px;
  gap: 8px;

  &:hover {
    background: ${COLOR.GRAY10};
  }
`;

const PropertyName = styled.div`
  flex: 1;
  font-size: 12px;
  color: ${COLOR.GRAY70};
  font-family: monospace;
`;

const PropertyValue = styled.div`
  font-size: 12px;
  color: ${COLOR.GRAY90};
  font-weight: 500;
  font-family: monospace;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ColorPreview = styled.span<{ $color: string }>`
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 3px;
  background: ${({ $color }) => $color};
  border: 1px solid ${COLOR.GRAY30};
  margin-right: 6px;
  flex-shrink: 0;
`;

const CopyButton = styled.button`
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: ${COLOR.GRAY50};
  flex-shrink: 0;

  &:hover {
    background: ${COLOR.PRIMARY10};
    color: ${COLOR.PRIMARY60};
  }
`;

const CopiedToast = styled.div<{ $visible: boolean }>`
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%) translateY(${({ $visible }) => ($visible ? '0' : '20px')});
  background: ${COLOR.GRAY90};
  color: ${COLOR.WHITE};
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: all 0.2s ease;
  z-index: 10004;
  pointer-events: none;
`;

const ModeIndicator = styled.div`
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: ${COLOR.PRIMARY60};
  color: ${COLOR.WHITE};
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10003;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const isColorValue = (value: string): boolean => {
  return value.startsWith('#') ||
         value.startsWith('rgb') ||
         value.startsWith('hsl') ||
         ['transparent', 'currentcolor', 'inherit'].includes(value.toLowerCase());
};

const rgbToHex = (rgb: string): string => {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`.toUpperCase();
  }
  return rgb;
};

export default function CSSInspector({ children }: { children: React.ReactNode }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [cssProperties, setCssProperties] = useState<CSSProperty[]>([]);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'code'>('list');

  const extractCSSProperties = useCallback((element: HTMLElement): CSSProperty[] => {
    const styles = window.getComputedStyle(element);
    const props: CSSProperty[] = [];

    // Layout
    props.push({ name: 'display', value: styles.display, category: 'layout' });
    if (styles.display === 'flex' || styles.display === 'inline-flex') {
      props.push({ name: 'flex-direction', value: styles.flexDirection, category: 'layout' });
      props.push({ name: 'justify-content', value: styles.justifyContent, category: 'layout' });
      props.push({ name: 'align-items', value: styles.alignItems, category: 'layout' });
      props.push({ name: 'gap', value: styles.gap, category: 'layout' });
    }
    if (styles.display === 'grid') {
      props.push({ name: 'grid-template-columns', value: styles.gridTemplateColumns, category: 'layout' });
    }
    props.push({ name: 'width', value: styles.width, category: 'layout' });
    props.push({ name: 'height', value: styles.height, category: 'layout' });

    // Spacing
    if (styles.padding !== '0px') {
      props.push({ name: 'padding', value: styles.padding, category: 'spacing' });
    }
    if (styles.margin !== '0px') {
      props.push({ name: 'margin', value: styles.margin, category: 'spacing' });
    }

    // Typography
    if (element.textContent?.trim()) {
      props.push({ name: 'font-size', value: styles.fontSize, category: 'typography' });
      props.push({ name: 'font-weight', value: styles.fontWeight, category: 'typography' });
      props.push({ name: 'line-height', value: styles.lineHeight, category: 'typography' });
      props.push({ name: 'font-family', value: styles.fontFamily.split(',')[0].trim().replace(/"/g, ''), category: 'typography' });
    }

    // Colors
    if (styles.color && styles.color !== 'rgba(0, 0, 0, 0)') {
      props.push({ name: 'color', value: rgbToHex(styles.color), category: 'colors' });
    }
    if (styles.backgroundColor && styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      props.push({ name: 'background', value: rgbToHex(styles.backgroundColor), category: 'colors' });
    }

    // Border
    if (styles.borderWidth !== '0px') {
      props.push({ name: 'border', value: `${styles.borderWidth} ${styles.borderStyle} ${rgbToHex(styles.borderColor)}`, category: 'border' });
    }
    if (styles.borderRadius !== '0px') {
      props.push({ name: 'border-radius', value: styles.borderRadius, category: 'border' });
    }

    // Effects
    if (styles.boxShadow !== 'none') {
      props.push({ name: 'box-shadow', value: styles.boxShadow, category: 'effects' });
    }
    if (styles.opacity !== '1') {
      props.push({ name: 'opacity', value: styles.opacity, category: 'effects' });
    }

    return props;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isEnabled || selectedElement) return;

    const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
    if (target && !target.closest('[data-css-inspector]')) {
      setHoveredElement(target);
      setHighlightRect(target.getBoundingClientRect());
    }
  }, [isEnabled, selectedElement]);

  const handleClick = useCallback((e: MouseEvent) => {
    if (!isEnabled) return;

    const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
    if (!target || target.closest('[data-css-inspector]')) return;

    e.preventDefault();
    e.stopPropagation();

    setSelectedElement(target);
    setHighlightRect(target.getBoundingClientRect());
    setCssProperties(extractCSSProperties(target));
  }, [isEnabled, extractCSSProperties]);

  useEffect(() => {
    if (isEnabled) {
      document.addEventListener('mousemove', handleMouseMove, true);
      document.addEventListener('click', handleClick, true);
      document.body.style.cursor = 'crosshair';
    } else {
      document.body.style.cursor = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, true);
      document.removeEventListener('click', handleClick, true);
      document.body.style.cursor = '';
    };
  }, [isEnabled, handleMouseMove, handleClick]);

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(value);
      setTimeout(() => setCopiedValue(null), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyAll = async () => {
    const cssCode = cssProperties
      .map(prop => `${prop.name}: ${prop.value};`)
      .join('\n');

    try {
      await navigator.clipboard.writeText(cssCode);
      setCopiedValue('전체 CSS 코드');
      setTimeout(() => setCopiedValue(null), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClose = () => {
    setSelectedElement(null);
    setHighlightRect(null);
    setCssProperties([]);
  };

  const handleToggle = () => {
    setIsEnabled(!isEnabled);
    if (isEnabled) {
      setSelectedElement(null);
      setHoveredElement(null);
      setHighlightRect(null);
      setCssProperties([]);
    }
  };

  const groupedProperties = cssProperties.reduce((acc, prop) => {
    if (!acc[prop.category]) acc[prop.category] = [];
    acc[prop.category].push(prop);
    return acc;
  }, {} as Record<string, CSSProperty[]>);

  const categoryLabels: Record<string, string> = {
    layout: 'Layout',
    spacing: 'Spacing',
    typography: 'Typography',
    colors: 'Colors',
    border: 'Border',
    effects: 'Effects',
  };

  return (
    <Wrapper>
      {children}

      {highlightRect && isEnabled && (
        <HighlightBox
          style={{
            left: highlightRect.left,
            top: highlightRect.top,
            width: highlightRect.width,
            height: highlightRect.height,
          }}
          data-css-inspector
        >
          <SizeLabel>
            {Math.round(highlightRect.width)} × {Math.round(highlightRect.height)}
          </SizeLabel>
        </HighlightBox>
      )}

      {selectedElement && cssProperties.length > 0 && (
        <Panel data-css-inspector>
          <PanelHeader>
            <PanelTitle>
              <span>CSS 스펙</span>
              <ElementTag>{selectedElement.tagName.toLowerCase()}</ElementTag>
            </PanelTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ViewToggle>
                <ViewToggleButton $active={viewMode === 'list'} onClick={() => setViewMode('list')}>리스트</ViewToggleButton>
                <ViewToggleButton $active={viewMode === 'code'} onClick={() => setViewMode('code')}>코드</ViewToggleButton>
              </ViewToggle>
              <CloseButton onClick={handleClose}>✕</CloseButton>
            </div>
          </PanelHeader>

          {viewMode === 'list' ? (
            <>
              <PanelBody>
                {Object.entries(groupedProperties).map(([category, props]) => (
                  <CategorySection key={category}>
                    <CategoryTitle>{categoryLabels[category]}</CategoryTitle>
                    {props.map((prop, idx) => (
                      <PropertyRow key={idx}>
                        <PropertyName>{prop.name}</PropertyName>
                        <PropertyValue title={prop.value}>
                          {isColorValue(prop.value) && (
                            <ColorPreview $color={prop.value} />
                          )}
                          {prop.value}
                        </PropertyValue>
                        <CopyButton onClick={() => handleCopy(prop.value)} title="복사">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                          </svg>
                        </CopyButton>
                      </PropertyRow>
                    ))}
                  </CategorySection>
                ))}
              </PanelBody>
            </>
          ) : (
            <CodeView>
              <CodeCopyButton onClick={handleCopyAll}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                복사
              </CodeCopyButton>
              <CodeBlock>
{`.${selectedElement.tagName.toLowerCase()} {
${cssProperties.map(prop => `  ${prop.name}: ${prop.value};`).join('\n')}
}`}
              </CodeBlock>
            </CodeView>
          )}
        </Panel>
      )}

      {isEnabled && !selectedElement && (
        <ModeIndicator data-css-inspector>
          <span>🎨</span> 요소를 클릭하면 CSS 스펙을 확인할 수 있습니다
        </ModeIndicator>
      )}

      <CopiedToast $visible={!!copiedValue} data-css-inspector>
        복사됨: {copiedValue}
      </CopiedToast>

      <ToggleButton $active={isEnabled} onClick={handleToggle} data-css-inspector>
        <span>🎨</span>
        {isEnabled ? 'Inspector 종료' : 'CSS Inspector'}
      </ToggleButton>
    </Wrapper>
  );
}

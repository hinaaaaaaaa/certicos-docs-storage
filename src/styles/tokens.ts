// Color Tokens from Design System
export const COLOR = {
  // Primary
  PRIMARY10: '#F5F9FF',
  PRIMARY20: '#F1F6FF',
  PRIMARY30: '#E6F0FF',
  PRIMARY60: '#3785F7',
  PRIMARY70: '#1F5FBD',
  PRIMARY80: '#154181',
  PRIMARY90: '#04224D',

  // Gray
  GRAY10: '#F9F9F9',
  GRAY20: '#F1F1F1',
  GRAY30: '#E4E4E4',
  GRAY40: '#CFCFCF',
  GRAY50: '#B9B9B9',
  GRAY60: '#ACAEB0',
  GRAY70: '#8D8F91',
  GRAY80: '#5D6063',
  GRAY90: '#363637',
  GRAY100: '#1F1F20',

  // Blue Gray
  BLUEGRAY10: '#F0F2F5',
  BLUEGRAY20: '#E2E8EE',

  // Status
  GREEN50: '#29BF5F',
  RED60: '#FF4D4F',
  YELLOW50: '#FFD340',
  BLUE60: '#1890FF',

  WHITE: '#FFFFFF',
} as const;

// Semantic Colors
export const SEMANTIC = {
  TEXT_STRONG: COLOR.GRAY100,
  TEXT_NORMAL: COLOR.GRAY90,
  TEXT_NEUTRAL: COLOR.GRAY80,
  TEXT_ASSISTIVE: COLOR.GRAY70,
  TEXT_PRIMARY: COLOR.PRIMARY60,

  BACKGROUND_WHITE: COLOR.WHITE,
  BACKGROUND_NORMAL: COLOR.BLUEGRAY10,
  BACKGROUND_WEAK: COLOR.GRAY10,
  BACKGROUND_PRIMARY: COLOR.PRIMARY60,
  BACKGROUND_NAVIGATION: COLOR.PRIMARY90,

  BORDER_NORMAL: COLOR.GRAY30,
  BORDER_HOVER: COLOR.PRIMARY60,
} as const;

// Typography
export const TYPOGRAPHY = {
  TITLE2_600: { size: '20px', weight: 600, lineHeight: '28px' },
  BODY1_500: { size: '16px', weight: 500, lineHeight: '24px' },
  BODY2_400: { size: '14px', weight: 400, lineHeight: '20px' },
  BODY2_500: { size: '14px', weight: 500, lineHeight: '20px' },
  SMALL_400: { size: '12px', weight: 400, lineHeight: '16px' },
  SMALL_500: { size: '12px', weight: 500, lineHeight: '16px' },
} as const;

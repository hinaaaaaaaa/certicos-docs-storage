// Design System Tokens - from shared/config/tokens
export const COLOR = {
  // Primary
  PRIMARY10: '#F5F9FF',
  PRIMARY20: '#F1F6FF',
  PRIMARY30: '#E6F0FF',
  PRIMARY40: '#D7E7FE',
  PRIMARY50: '#A9CBFC',
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
  YELLOW20: '#FFF9E6',
  YELLOW50: '#FFD340',
  BLUE60: '#1890FF',

  WHITE: '#FFFFFF',
  TRANSPARENT: '#00000000',
} as const;

export const SEMANTIC = {
  // Text
  TEXT_STRONG: COLOR.GRAY100,
  TEXT_NORMAL: COLOR.GRAY90,
  TEXT_NEUTRAL: COLOR.GRAY80,
  TEXT_ASSISTIVE: COLOR.GRAY70,
  TEXT_WEAK: COLOR.GRAY60,
  TEXT_DISABLED: COLOR.GRAY50,
  TEXT_PRIMARY: COLOR.PRIMARY60,
  TEXT_WHITE: COLOR.WHITE,

  // Icon
  ICON_STRONG: COLOR.GRAY100,
  ICON_NORMAL: COLOR.GRAY90,
  ICON_NEUTRAL: COLOR.GRAY80,
  ICON_ASSISTIVE: COLOR.GRAY70,
  ICON_WEAK: COLOR.GRAY60,
  ICON_DISABLED: COLOR.GRAY50,
  ICON_PRIMARY: COLOR.PRIMARY60,

  // Background
  BACKGROUND_WHITE: COLOR.WHITE,
  BACKGROUND_NORMAL: COLOR.BLUEGRAY10,
  BACKGROUND_WEAK: COLOR.GRAY10,
  BACKGROUND_ASSISTIVE: COLOR.GRAY20,
  BACKGROUND_PRIMARY: COLOR.PRIMARY60,
  BACKGROUND_PRIMARY_WEAK: COLOR.PRIMARY20,
  BACKGROUND_SELECTED: COLOR.PRIMARY10,
  BACKGROUND_NAVIGATION: COLOR.PRIMARY90,

  // Border
  BORDER_NORMAL: COLOR.GRAY30,
  BORDER_NEUTRAL: COLOR.GRAY40,
  BORDER_HOVER: COLOR.PRIMARY50,
  BORDER_PRIMARY: COLOR.PRIMARY60,

  // State
  STATE_SUCCESS: COLOR.GREEN50,
  STATE_ERROR: COLOR.RED60,
  STATE_WARNING: COLOR.YELLOW50,
  STATE_INFO: COLOR.BLUE60,
} as const;

export const TYPOGRAPHY = {
  DISPLAY1_600: { size: '56px', weight: 600, lineHeight: '72px' },
  TITLE1_600: { size: '24px', weight: 600, lineHeight: '34px' },
  TITLE2_500: { size: '20px', weight: 500, lineHeight: '28px' },
  TITLE2_600: { size: '20px', weight: 600, lineHeight: '28px' },
  TITLE3_500: { size: '18px', weight: 500, lineHeight: '26px' },
  BODY1_400: { size: '16px', weight: 400, lineHeight: '24px' },
  BODY1_500: { size: '16px', weight: 500, lineHeight: '24px' },
  BODY2_400: { size: '14px', weight: 400, lineHeight: '20px' },
  BODY2_500: { size: '14px', weight: 500, lineHeight: '20px' },
  BODY2_600: { size: '14px', weight: 600, lineHeight: '20px' },
  SMALL_400: { size: '12px', weight: 400, lineHeight: '16px' },
  SMALL_500: { size: '12px', weight: 500, lineHeight: '16px' },
  CAPTION_400: { size: '10px', weight: 400, lineHeight: '14px' },
} as const;

export const SHADOW = {
  XSMALL: '0 1px 2px 0 rgba(0, 0, 0, 0.08)',
  SMALL: '0 1px 4px 0 rgba(0, 0, 0, 0.10)',
  MEDIUM: '0 2px 6px 0 rgba(0, 0, 0, 0.12)',
  LARGE: '0 2px 10px 0 rgba(0, 0, 0, 0.16)',
} as const;

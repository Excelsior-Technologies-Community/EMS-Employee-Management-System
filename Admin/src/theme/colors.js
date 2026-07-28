// Design tokens — Admin Panel
// Same brand family as the Employee Portal: deep indigo-navy + warm amber accent,
// so the two apps read as one product even though they're separate builds.
export const colors = {
  ink: '#141A2E',
  inkSoft: '#4A5170',
  paper: '#F6F7FB',
  surface: '#FFFFFF',
  line: '#E4E6F0',

  navy: '#26335C',
  navyDeep: '#161F3D',
  navySoft: '#EEF0F8',

  amber: '#E8A33D',
  amberDeep: '#C97F1E',
  amberSoft: '#FCF1DD',

  success: '#2F9E68',
  successSoft: '#E7F6EE',
  danger: '#D6455A',
  dangerSoft: '#FBE9EC',
  info: '#3E7CB1',
  infoSoft: '#E8F1F9',
  neutral: '#6B7280',
  neutralSoft: '#F1F2F5',

  avatarGradients: [
    ['#26335C', '#3E5A99'],
    ['#C97F1E', '#E8A33D'],
    ['#2F9E68', '#63C48D'],
    ['#3E7CB1', '#6FB2E0'],
    ['#8B4A9C', '#B27BC4'],
    ['#D6455A', '#EA7C8C'],
  ],
};

export const getAvatarGradient = (seed = '') => {
  const sum = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const [from, to] = colors.avatarGradients[sum % colors.avatarGradients.length];
  return `linear-gradient(135deg, ${from}, ${to})`;
};

// Consistent role -> color mapping used across chips, avatars, and dashboard stats
export const roleTone = {
  admin: { fg: colors.danger, bg: colors.dangerSoft },
  hr: { fg: colors.amberDeep, bg: colors.amberSoft },
  manager: { fg: colors.info, bg: colors.infoSoft },
  employee: { fg: colors.success, bg: colors.successSoft },
};

export const statusTone = {
  active: { fg: colors.success, bg: colors.successSoft, label: 'Active' },
  inactive: { fg: colors.neutral, bg: colors.neutralSoft, label: 'Inactive' },
};

// Design tokens — Employee Portal
// Palette: deep indigo-navy (trust, structure) + warm amber (signal / signature accent)
export const colors = {
  ink: '#141A2E', // primary text
  inkSoft: '#4A5170', // secondary text
  paper: '#F6F7FB', // app background
  surface: '#FFFFFF', // card / panel surface
  line: '#E4E6F0', // hairline borders

  navy: '#26335C', // primary brand
  navyDeep: '#161F3D', // hover / pressed states
  navySoft: '#EEF0F8', // tinted backgrounds for navy

  amber: '#E8A33D', // signature accent — status rail, highlights
  amberDeep: '#C97F1E',
  amberSoft: '#FCF1DD',

  success: '#2F9E68',
  successSoft: '#E7F6EE',
  danger: '#D6455A',
  dangerSoft: '#FBE9EC',
  info: '#3E7CB1',
  infoSoft: '#E8F1F9',

  // Deterministic avatar gradients — picked by name hash, keeps identity personal
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
  const sum = seed
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const [from, to] = colors.avatarGradients[sum % colors.avatarGradients.length];
  return `linear-gradient(135deg, ${from}, ${to})`;
};

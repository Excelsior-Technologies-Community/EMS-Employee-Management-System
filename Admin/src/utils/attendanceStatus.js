import { colors } from '../theme/colors';

export const getAttendanceStatusTone = (status) => {
  switch (status) {
    case 'Present':
      return { fg: colors.success, bg: colors.successSoft };
    case 'Late':
      return { fg: colors.amberDeep, bg: colors.amberSoft };
    case 'Half Day':
      return { fg: colors.info, bg: colors.infoSoft };
    case 'Absent':
      return { fg: colors.danger, bg: colors.dangerSoft };
    default:
      return { fg: colors.inkSoft, bg: colors.line };
  }
};

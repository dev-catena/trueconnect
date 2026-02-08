import { MD3LightTheme } from 'react-native-paper';
import { CustomColors } from './colors';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: CustomColors.activeColor, // #0C2E59
    secondary: CustomColors.activeColorSecondary, // #0B3559
    background: CustomColors.backgroundPrimaryColor,
    surface: CustomColors.white,
    error: CustomColors.vividRed,
    onPrimary: CustomColors.white,
    onSecondary: CustomColors.white,
    onBackground: CustomColors.black,
    onSurface: CustomColors.black,
    onError: CustomColors.white,
  },
};


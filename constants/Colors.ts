/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

export const tintColorLight = '#0a7ea4';
export const tintColorDark = '#ffffff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#F6F6F6',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#D3D3D3',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};


export const primaryColor = '#113547'; // Primary color
export const secondaryColor = '#277CA5'; // Secondary color
export const accentColorLight = '#64C2EC'; // Accent color for light mode
export const accentColorDark = '#ecfefa'; // Accent color for dark mode

export const darkAccent = "#151718"
export const lightAccent = "#ffffff"

export const light2 = "#f6f6f6"

export const danger = "#D84040"
export const success = "#0a8f32"
export const warning = "#D1A101FF"

export const IconColors = {
  light: {
    background: lightAccent, // Light background for light mode
    icon: secondaryColor, // Accent color for icons in light mode
  },
  dark: {
    background: darkAccent, // Dark background for dark mode
    icon: accentColorDark, // Accent color for icons in dark mode
  },
};

export const SOSColors = {
  background: danger,
  text: lightAccent
}


export const onboardColors = {
  light: {
    background: lightAccent, 
    text: secondaryColor,
    activeDot: primaryColor,
    inactiveDot: accentColorLight
  },
  dark: {
    background: darkAccent, // Dark background for dark mode
    text: secondaryColor,
    activeDot: accentColorDark, 
    inactiveDot: secondaryColor
  },
}


export const TabColors = {
  light: {
    background: lightAccent, 
    active: primaryColor,
    inactive: secondaryColor,
  },
  dark: {
    background: darkAccent, // Dark background for dark mode
    active: secondaryColor,
    inactive: lightAccent,
  },
}


export const menuDivider ={
  light: {
    background: lightAccent,
    color: secondaryColor,
    text: darkAccent,
  },
  dark: {
    background: tintColorLight,
    color: lightAccent,
    text: lightAccent,  
  },
}

export const NotifColors = {
  light: {
    background: lightAccent,
    color: darkAccent,
  },
  dark: {
    background: primaryColor,
    color: lightAccent,
  },
}

export const CardsColors = {
  light: {
    background: lightAccent,
    color: darkAccent,
  },
  dark: {
    background: secondaryColor,
    color: lightAccent,
  },
}

export const HeaderColors ={
  light:{
    background: light2,
    text: darkAccent,
  },
  dark: {
    background: darkAccent,
    text: lightAccent,
  },
}
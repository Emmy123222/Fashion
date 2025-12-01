// src/theme/types.ts
import { theme } from './index';

// Infer the type of the theme object
type Theme = typeof theme;

// Extend the default theme types
declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
/// <reference types="nativewind/types" />

/* Allows typescript to recorgnize tailwind classes to avoid throwing errors */

/* TypeScript 6 checks side-effect imports, so declare the global.css import */
declare module "*.css";

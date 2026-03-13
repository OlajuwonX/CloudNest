declare module "react-native-toast-message" {
  import { ComponentType } from "react";

  interface ToastProps {}

  interface ToastStatic {
    show: (options: {
      type?: "success" | "error" | "info";
      text1?: string;
      text2?: string;
      visibilityTime?: number;
      onPress?: () => void;
      onHide?: () => void;
    }) => void;
    hide: () => void;
  }

  const Toast: ComponentType<ToastProps> & ToastStatic;
  export default Toast;
}

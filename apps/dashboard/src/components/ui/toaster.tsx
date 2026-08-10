import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

const getIcon = (color: string) => {
  const iconClass = "h-5 w-5";
  const containerClass = "rounded-full p-1 flex-shrink-0";
  switch (color) {
    case "success":
      return (
        <div className={`${containerClass} bg-green-100`}>
          <CheckCircle className={`${iconClass} text-green-600`} />
        </div>
      );
    case "destructive":
      return (
        <div className={`${containerClass} bg-red-100`}>
          <AlertCircle className={`${iconClass} text-red-600`} />
        </div>
      );
    case "info":
      return (
        <div className={`${containerClass} bg-blue-100`}>
          <Info className={`${iconClass} text-blue-600`} />
        </div>
      );
    case "warning":
      return (
        <div className={`${containerClass} bg-yellow-100`}>
          <AlertTriangle className={`${iconClass} text-yellow-600`} />
        </div>
      );
    default:
      return null;
  }
};

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({
        id,
        title,
        description,
        action,
        children,
        ...props
      }) {
        return (
          <Toast key={id} {...props}>
            {getIcon(props.color || "default")}
            <div className="flex-1 grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
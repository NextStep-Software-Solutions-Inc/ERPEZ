import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>
const SonnToaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      richColors
      closeButton
      duration={8000}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg group-[.toaster]:flex group-[.toaster]:items-center group-[.toaster]:gap-3 group-[.toaster]:p-4 group-[.toaster]:min-w-0 group-[.toaster]:max-w-md group-[.toaster]:border sonner-toast-success:bg-green-50 sonner-toast-success:text-green-900 sonner-toast-success:border-green-200 sonner-toast-error:bg-red-50 sonner-toast-error:text-red-900 sonner-toast-error:border-red-200 sonner-toast-info:bg-blue-50 sonner-toast-info:text-blue-900 sonner-toast-info:border-blue-200 sonner-toast-warning:bg-yellow-50 sonner-toast-warning:text-yellow-900 sonner-toast-warning:border-yellow-200",
          description: "group-[.toast]:text-current",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          icon: "sonner-toast-success:text-green-600 sonner-toast-success:bg-green-100 sonner-toast-success:rounded-full sonner-toast-success:p-1 sonner-toast-error:text-red-600 sonner-toast-error:bg-red-100 sonner-toast-error:rounded-full sonner-toast-error:p-1 sonner-toast-info:text-blue-600 sonner-toast-info:bg-blue-100 sonner-toast-info:rounded-full sonner-toast-info:p-1 sonner-toast-warning:text-yellow-600 sonner-toast-warning:bg-yellow-100 sonner-toast-warning:rounded-full sonner-toast-warning:p-1",
          closeButton: "left-auto right-2 top-2 bg-white/80 hover:bg-white text-gray-700 hover:text-gray-900 border border-gray-200 shadow-sm",
        },
      }}
      {...props}
    />
  );
};

export { SonnToaster };

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>
const SonnToaster = ({ ...props }: ToasterProps) => {
  const { theme = "system", resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={(resolvedTheme ?? theme) as ToasterProps["theme"]}
      richColors
      closeButton
      duration={8000}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg group-[.toaster]:flex group-[.toaster]:items-center group-[.toaster]:gap-3 group-[.toaster]:p-4 group-[.toaster]:min-w-0 group-[.toaster]:max-w-md group-[.toaster]:border sonner-toast-success:bg-green-50 dark:sonner-toast-success:bg-emerald-950/90 sonner-toast-success:text-green-900 dark:sonner-toast-success:text-emerald-100 sonner-toast-success:border-green-200 dark:sonner-toast-success:border-emerald-800 sonner-toast-error:bg-red-50 dark:sonner-toast-error:bg-red-950/90 sonner-toast-error:text-red-900 dark:sonner-toast-error:text-red-100 sonner-toast-error:border-red-200 dark:sonner-toast-error:border-red-800 sonner-toast-info:bg-blue-50 dark:sonner-toast-info:bg-blue-950/90 sonner-toast-info:text-blue-900 dark:sonner-toast-info:text-blue-100 sonner-toast-info:border-blue-200 dark:sonner-toast-info:border-blue-800 sonner-toast-warning:bg-yellow-50 dark:sonner-toast-warning:bg-amber-950/90 sonner-toast-warning:text-yellow-900 dark:sonner-toast-warning:text-amber-100 sonner-toast-warning:border-yellow-200 dark:sonner-toast-warning:border-amber-800",
          description: "group-[.toast]:text-current",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          icon: "sonner-toast-success:text-green-600 dark:sonner-toast-success:text-emerald-400 sonner-toast-success:bg-green-100 dark:sonner-toast-success:bg-emerald-500/20 sonner-toast-success:rounded-full sonner-toast-success:p-1 sonner-toast-error:text-red-600 dark:sonner-toast-error:text-red-400 sonner-toast-error:bg-red-100 dark:sonner-toast-error:bg-red-500/20 sonner-toast-error:rounded-full sonner-toast-error:p-1 sonner-toast-info:text-blue-600 dark:sonner-toast-info:text-blue-400 sonner-toast-info:bg-blue-100 dark:sonner-toast-info:bg-blue-500/20 sonner-toast-info:rounded-full sonner-toast-info:p-1 sonner-toast-warning:text-yellow-600 dark:sonner-toast-warning:text-amber-400 sonner-toast-warning:bg-yellow-100 dark:sonner-toast-warning:bg-amber-500/20 sonner-toast-warning:rounded-full sonner-toast-warning:p-1",
          closeButton: "left-auto right-2 top-2 bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground border border-border shadow-sm",
        },
      }}
      {...props}
    />
  );
};

export { SonnToaster };

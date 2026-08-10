import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { useLocation } from "@tanstack/react-router";
import { useThemeStore } from "~/store";
import { cn } from "~/lib/utils";
import { Toaster as ReactToaster } from "~/components/ui/toaster";
import { SonnToaster } from "~/components/ui/sonner";

const Providers = ({ children }: { children: React.ReactNode }) => {
    const { theme, radius } = useThemeStore();
    const location = useLocation();

    const style = {
        "--radius": `${radius}rem`,
    } as React.CSSProperties;

    if (location.pathname === "/") {
        return (
            <ThemeProvider
                attribute="class"
                enableSystem={false}
                defaultTheme="light"
            >
                <div className={cn("h-full dash-tail-app font-inter")}>
                    {children}
                    <ReactToaster />
                </div>
                <Toaster />
            </ThemeProvider>
        );
    }

    return (
        <div
            className={cn("dash-tail-app font-inter", "theme-" + theme)}
            style={style}
        >
            <ThemeProvider
                attribute="class"
                enableSystem={false}
                defaultTheme="light"
            >
                <div className={cn("h-full")}>
                    {children}
                    <ReactToaster />
                </div>
                <Toaster />
            </ThemeProvider>
        </div>
    );
};

export default Providers;

import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useLocation } from "@tanstack/react-router";
import { useThemeStore } from "~/store";
import { cn } from "~/lib/utils";
import { Toaster as ReactToaster } from "~/components/ui/toaster";

const Providers = ({ children }: { children: React.ReactNode }) => {
    const { theme, radius } = useThemeStore();
    const location = useLocation();

    useEffect(() => {
        if (typeof document === "undefined") return;
        const body = document.body;
        Array.from(body.classList).forEach((cls) => {
            if (cls.startsWith("theme-")) {
                body.classList.remove(cls);
            }
        });
        if (location.pathname !== "/" && theme) {
            body.classList.add(`theme-${theme}`);
        }
        body.style.setProperty("--radius", `${radius}rem`);
    }, [theme, radius, location.pathname]);

    const style = {
        "--radius": `${radius}rem`,
    } as React.CSSProperties;

    if (location.pathname === "/") {
        return (
            <>
                <div className={cn("h-full dash-tail-app font-inter")}>
                    {children}
                    <ReactToaster />
                </div>
                <Toaster />
            </>
        );
    }

    return (
        <div
            className={cn("dash-tail-app font-inter", "theme-" + theme)}
            style={style}
        >
            <div className={cn("h-full")}>
                {children}
                <ReactToaster />
            </div>
            <Toaster />
        </div>
    );
};

export default Providers;

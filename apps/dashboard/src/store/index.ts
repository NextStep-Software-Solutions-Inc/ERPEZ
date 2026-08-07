import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Site config defaults
const defaultSiteConfig = {
    theme: "violet",
    layout: "vertical",
    sidebarType: "module",
    navbarType: "sticky",
    footerType: "static",
    sidebarBg: "none",
    radius: 0.5,
};

interface ThemeStoreState {
    theme: string;
    setTheme: (theme: string) => void;
    radius: number;
    setRadius: (value: number) => void;
    layout: string;
    setLayout: (value: string) => void;
    navbarType: string;
    setNavbarType: (value: string) => void;
    footerType: string;
    setFooterType: (value: string) => void;
    isRtl: boolean;
    setRtl: (value: boolean) => void;
}

export const useThemeStore = create<ThemeStoreState>()(
    persist(
        (set) => ({
            theme: defaultSiteConfig.theme,
            setTheme: (theme) => set({ theme }),
            radius: defaultSiteConfig.radius,
            setRadius: (value) => set({ radius: value }),
            layout: defaultSiteConfig.layout,
            setLayout: (value) => {
                set({ layout: value });

                // If the new layout is "semibox," also set the sidebarType to "popover"
                if (value === "semibox") {
                    useSidebar.setState({ sidebarType: "popover" });
                }
                if (value === "horizontal") {
                    useSidebar.setState({ sidebarType: "classic" });
                }
                if (value === "horizontal") {
                    useThemeStore.setState({ navbarType: "sticky" });
                }
            },
            navbarType: defaultSiteConfig.navbarType,
            setNavbarType: (value) => set({ navbarType: value }),
            footerType: defaultSiteConfig.footerType,
            setFooterType: (value) => set({ footerType: value }),
            isRtl: false,
            setRtl: (value) => set({ isRtl: value }),
        }),
        { name: "theme-store", storage: createJSONStorage(() => localStorage) }
    )
);

interface SidebarState {
    collapsed: boolean;
    setCollapsed: (value: boolean) => void;
    sidebarType: string;
    setSidebarType: (value: string) => void;
    subMenu: boolean;
    setSubmenu: (value: boolean) => void;
    sidebarBg: string;
    setSidebarBg: (value: string) => void;
    mobileMenu: boolean;
    setMobileMenu: (value: boolean) => void;
}

export const useSidebar = create<SidebarState>()(
    persist(
        (set) => ({
            collapsed: false,
            setCollapsed: (value) => set({ collapsed: value }),
            sidebarType:
                defaultSiteConfig.layout === "semibox"
                    ? "popover"
                    : defaultSiteConfig.sidebarType,
            setSidebarType: (value) => {
                set({ sidebarType: value });
            },
            subMenu: false,
            setSubmenu: (value) => set({ subMenu: value }),
            sidebarBg: defaultSiteConfig.sidebarBg,
            setSidebarBg: (value) => set({ sidebarBg: value }),
            mobileMenu: false,
            setMobileMenu: (value) => set({ mobileMenu: value }),
        }),
        { name: "sidebar-store", storage: createJSONStorage(() => localStorage) }
    )
);

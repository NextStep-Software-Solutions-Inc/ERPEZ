import React from "react";
import { useLocation } from "@tanstack/react-router";
import { motion } from "framer-motion";
import Header from "~/components/partials/header";
import Sidebar from "~/components/partials/sidebar";
import Footer from "~/components/partials/footer";
import MobileSidebar from "~/components/partials/sidebar/mobile-sidebar";
import ThemeCustomize from "~/components/partials/customizer/theme-customizer";
import HeaderSearch from "~/components/header-search";
import LayoutLoader from "~/components/layout-loader";
import { cn } from "~/lib/utils";
import { useSidebar, useThemeStore } from "~/store";
import { useMediaQuery } from "~/hooks/use-media-query";
import { useMounted } from "~/hooks/use-mounted";

interface DashboardLayoutProviderProps {
    children: React.ReactNode;
}

const DashboardLayoutProvider = ({ children }: DashboardLayoutProviderProps) => {
    const { collapsed, sidebarType, setCollapsed, subMenu } = useSidebar();
    const [open, setOpen] = React.useState(false);
    const { layout } = useThemeStore();
    const location = useLocation();
    const isMobile = useMediaQuery("(min-width: 768px)");
    const mounted = useMounted();

    if (!mounted) {
        return <LayoutLoader />;
    }

    if (layout === "semibox") {
        return (
            <>
                <Header handleOpenSearch={() => setOpen(true)} />
                <Sidebar />

                <div
                    className={cn("content-wrapper transition-all duration-150 ", {
                        "ltr:xl:ml-18 rtl:xl:mr-18": collapsed,
                        "ltr:xl:ml-68 rtl:xl:mr-68": !collapsed,
                    })}
                >
                    <div
                        className={cn(
                            "pt-6 pb-8 px-4  page-min-height-semibox ",

                        )}
                    >
                        <div className="semibox-content-wrapper ">
                            <LayoutWrapper
                                isMobile={isMobile}
                                setOpen={setOpen}
                                open={open}
                                location={location.pathname}
                            >
                                {children}
                            </LayoutWrapper>
                        </div>
                    </div>
                </div>
                <Footer handleOpenSearch={() => setOpen(true)} />
                <ThemeCustomize />
            </>
        );
    }

    if (layout === "horizontal") {
        return (
            <>
                <Header handleOpenSearch={() => setOpen(true)} />

                <div className={cn("content-wrapper transition-all duration-150 ")}>
                    <div
                        className={cn(
                            "  pt-6 px-6 pb-8  page-min-height-horizontal ",
                            {}
                        )}
                    >
                        <LayoutWrapper
                            isMobile={isMobile}
                            setOpen={setOpen}
                            open={open}
                            location={location.pathname}
                        >
                            {children}
                        </LayoutWrapper>
                    </div>
                </div>
                <Footer handleOpenSearch={() => setOpen(true)} />
                <ThemeCustomize />
            </>
        );
    }

    if (sidebarType !== "module") {
        return (
            <>
                <Header handleOpenSearch={() => setOpen(true)} />
                <Sidebar />

                <div
                    className={cn("content-wrapper transition-all duration-150 ", {
                        "ltr:xl:ml-62 rtl:xl:mr-62 ": !collapsed,
                        "ltr:xl:ml-18 rtl:xl:mr-18": collapsed,
                    })}
                >
                    <div
                        className={cn(
                            "  pt-6 px-6 pb-8  page-min-height ",
                            {}
                        )}
                    >
                        <LayoutWrapper
                            isMobile={isMobile}
                            setOpen={setOpen}
                            open={open}
                            location={location.pathname}
                        >
                            {children}
                        </LayoutWrapper>
                    </div>
                </div>
                <Footer handleOpenSearch={() => setOpen(true)} />
                <ThemeCustomize />
            </>
        );
    }

    return (
        <>
            <Header handleOpenSearch={() => setOpen(true)} />
            <Sidebar />

            <div
                className={cn("content-wrapper transition-all duration-150 ", {
                    "ltr:xl:ml-75 rtl:xl:mr-75": !collapsed,
                    "ltr:xl:ml-18 rtl:xl:mr-18": collapsed,
                })}
            >
                <div
                    className={cn(
                        " layout-padding px-6 pt-6  page-min-height ",

                    )}
                >
                    <LayoutWrapper
                        isMobile={isMobile}
                        setOpen={setOpen}
                        open={open}
                        location={location.pathname}
                    >
                        {children}
                    </LayoutWrapper>
                </div>
            </div>
            <Footer handleOpenSearch={() => setOpen(true)} />
            {isMobile && <ThemeCustomize />}
        </>
    );
};

export default DashboardLayoutProvider;

interface LayoutWrapperProps {
    children: React.ReactNode;
    isMobile: boolean;
    setOpen: (open: boolean) => void;
    open: boolean;
    location: string;
}

const LayoutWrapper = ({
    children,
    isMobile,
    setOpen,
    open,
    location,
}: LayoutWrapperProps) => {
    return (
        <>
            <motion.div
                key={location}
                initial="pageInitial"
                animate="pageAnimate"
                exit="pageExit"
                variants={{
                    pageInitial: {
                        opacity: 0,
                        y: 50,
                    },
                    pageAnimate: {
                        opacity: 1,
                        y: 0,
                    },
                    pageExit: {
                        opacity: 0,
                        y: -50,
                    },
                }}
                transition={{
                    type: "tween",
                    ease: "easeInOut",
                    duration: 0.5,
                }}
            >
                <main>{children}</main>
            </motion.div>

            <MobileSidebar className="left-75" />
            <HeaderSearch open={open} setOpen={setOpen} />
        </>
    );
};

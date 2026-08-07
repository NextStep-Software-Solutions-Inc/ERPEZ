import React from "react";
import ModuleSidebar from "./module";
import PopoverSidebar from "./popover";
import ClassicSidebar from "./classic";
import MobileSidebar from "./mobile-sidebar";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { useSidebar, useThemeStore } from "@/store";

const Sidebar = () => {
  const { sidebarType, collapsed } = useSidebar();
  const { layout } = useThemeStore();

  const isDesktop = useMediaQuery("(min-width: 1280px)");

  let selectedSidebar = null;

  if (!isDesktop && (sidebarType === "popover" || sidebarType === "classic")) {
    selectedSidebar = <MobileSidebar />;
  } else {
    const sidebarComponents: { [key: string]: React.JSX.Element } = {
      module: <ModuleSidebar />,
      popover: <PopoverSidebar />,
      classic: <ClassicSidebar />,
    };

    selectedSidebar = sidebarComponents[sidebarType] || <ModuleSidebar />;
  }

  return <div>{selectedSidebar}</div>;
};

export default Sidebar;

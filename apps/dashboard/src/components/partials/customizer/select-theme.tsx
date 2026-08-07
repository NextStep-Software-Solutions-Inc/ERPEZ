import * as React from "react";
import { useTheme } from "next-themes";
import { Icon } from "@iconify/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { themes } from "@/config/thems";
import { useThemeStore } from "@/store";

const allThemes = [
  { key: "light", label: "Light", icon: "heroicons:sun" },
  { key: "dark", label: "Dark", icon: "heroicons:moon" },
];

const SelectTheme = () => {
  const { theme, setTheme, resolvedTheme: mode } = useTheme();
  const { theme: config, setTheme: setConfig } = useThemeStore();
  const newTheme = themes.find((t) => t.name === config);

  return (
    <div
      style={{
        "--theme-primary": `hsl(${newTheme?.cssVars[mode === "dark" ? "dark" : "light"].primary
          })`,
      } as React.CSSProperties
      }
    >
      <div className="mb-2 relative inline-block px-3 py-[3px] rounded-md before:bg-[var(--theme-primary)] before:absolute before:top-0 before:left-0 before:w-full  before:h-full before:rounded before:opacity-10 before:z-[-1]  text-[var(--theme-primary)]  text-xs font-medium">
        Color Scheme
      </div>
      <div className="text-muted-foreground font-normal text-xs mb-4">
        Choose Light or Dark Scheme.
      </div>
      <div className=" grid grid-cols-2 gap-3">
        {allThemes?.map((themeOption) => (
          <div key={themeOption.key} className="flex-1 w-full">
            <button
              onClick={() => setTheme(themeOption.key)}
              className={cn(
                "border  flex  w-full text-center items-center justify-center py-[14px]  px-10 rounded relative",
                {
                  "text-[var(--theme-primary)] border-[var(--theme-primary)]":
                    theme === themeOption.key,
                  "text-default-400": theme !== themeOption.key,
                }
              )}
            >
              {theme === themeOption.key && (
                <Icon
                  icon="heroicons:check-circle-20-solid"
                  className=" text-[var(--theme-primary)] absolute top-1 right-1"
                />
              )}
              <div>
                <Icon icon={themeOption.icon} className=" h-5 w-5" />
              </div>
            </button>
            <Label className=" text-muted-foreground font-normal block mt-2">
              {themeOption.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectTheme;

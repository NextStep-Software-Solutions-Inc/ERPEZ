import React from "react";
import { DirectionProvider as RadixDirectionProvider } from "@radix-ui/react-direction";
import { useThemeStore } from "~/store";

const DirectionProvider = ({ children }: { children: React.ReactNode }) => {
    const { isRtl } = useThemeStore();

    const direction = isRtl ? "rtl" : "ltr";

    return (
        <div dir={direction}>
            <RadixDirectionProvider dir={direction}>
                {children}
            </RadixDirectionProvider>
        </div>
    );
};

export default DirectionProvider;

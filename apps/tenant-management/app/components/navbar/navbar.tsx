import React, { useState, useEffect } from "react";
import { cn } from "~/lib/utils";
interface NavbarProps {
    className?: string;
    children: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ children }) => {
    const [isVisible, setIsVisible] = useState<boolean>(true);
    const [lastScrollY, setLastScrollY] = useState<number>(0);


    useEffect(() => {
        const controlNavbar = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && currentScrollY > 260) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", controlNavbar);

        return () => {
            window.removeEventListener("scroll", controlNavbar);
        };
    }, [lastScrollY]);

    return (
        <>
            <nav
                className={cn(
                    "group: fixed left-0 right-0 top-4 px-6 md:px-16 z-20 transition-all duration-600 ease-in-out",
                    {
                        "translate-y-[-200%]": !isVisible,
                        "":
                            lastScrollY > 170,
                    },
                )}
            >
                {children}
            </nav>
        </>
    );
};

export default Navbar;

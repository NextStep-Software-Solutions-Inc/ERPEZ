import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Menu } from "lucide-react";
import { NavbarMenu } from "./NavbarMenu";
import { Link } from "react-router";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/react-router";

export const NavigationSheet = () => {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent className="px-6 py-3 bg-gradient-to-br from-[#b7c7e7] to-[#a0c3b7] backdrop-blur-[5px] border dark:border-slate-700/70 rounded-lg w-64 sm:w-72 flex flex-col">
                {/* Logo */}
                <Link to="/" className="flex items-center justify-between gap-3 pr-6">
                    <img
                        src="/image/Logo1.png"
                        alt="ERPEZ Logo"
                        className="h-8 w-auto"
                    />
                    <UserButton
                        appearance={{
                            elements: {
                                avatarBox: "h-10 w-10 rounded-full border border-gray-300",
                            },
                        }}
                    />
                </Link>
                {/* Auth buttons */}

                <div className="mt-6 flex flex-col gap-3">
                    <SignedOut>
                        <Link to="/sign-up">
                            <Button variant="outline" className="w-full">
                                Sign Up
                            </Button>
                        </Link>
                        <SignInButton mode="modal">
                            <Button className="bg-[#10B981] hover:bg-[#0a5139] w-full">
                                Get Started
                            </Button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <Link to="/overview">
                            <Button variant="outline" className="w-full">Get Started</Button>
                        </Link>
                    </SignedIn>
                </div>
                {/* Menu */}
                <NavbarMenu orientation="vertical" className="mt-6 flex-1 [&>div]:h-full" />


            </SheetContent>
        </Sheet>
    );
};

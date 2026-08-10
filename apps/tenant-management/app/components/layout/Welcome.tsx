import Navbar from "~/components/navbar/navbar";
import { Link } from "react-router";
import { NavbarMenu } from "~/components/navbar/NavbarMenu";
import { Button } from "~/components/ui/button";
import { NavigationSheet } from "~/components/navbar/NavigationSheet";
import GradientEllipses from "~/components/design/GradientEllipse";
import GridLines from "~/components/design/GridLines";
import { MissionSection } from "~/components/section/MissionSection";
import ModuleSection from "~/components/section/ModuleSection";
import PlanSection from "~/components/section/PlanSection";
import FAQSection from "~/components/section/FAQSection";
import ContactSection from "~/components/section/ContactSection";
import Footer from "~/components/footer/Footer";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/react-router";
import { HeroSectionCarousel } from "../section/HeroSectionCarousel";

export default function Welcome() {
    return (
        <>
            <Navbar>
                <div className="container flex max-w-7xl items-center justify-between px-4 py-2 lg:justify-items-center h-16 bg-transparent backdrop-blur-[5px] border dark:border-slate-700/70 mx-auto rounded-full z-98">
                    <Link to="/" className="flex items-center gap-3">
                        <img
                            src="/image/navbar_footer.png"
                            alt="ERPEZ Logo"
                            className="h-32 w-40 object-contain"
                        />
                    </Link>
                    <NavbarMenu className="hidden lg:block" />
                    <div className="flex items-center gap-3">
                        <SignedOut>
                            <div className="flex gap-2">
                                <Link to="/sign-up">
                                    <Button variant="outline" className="hidden sm:inline-flex">Sign Up</Button>
                                </Link>
                                <SignInButton mode="modal" fallbackRedirectUrl="/" >
                                    <Button className="bg-[#10B981] hover:bg-[#0a5139] text-white hover:text-white">
                                        Get Started
                                    </Button>
                                </SignInButton>
                            </div>
                        </SignedOut>
                        <SignedIn>
                            <Link to="/overview">
                                <Button variant="outline" className="bg-[#10B981] hover:bg-[#0a5139] text-white hover:text-white">Get Started</Button>
                            </Link>
                            <UserButton
                                appearance={{
                                    elements: {
                                        avatarBox: "h-8 w-8 rounded-full border border-gray-300",
                                    },
                                }}
                            />
                        </SignedIn>
                        <div className="lg:hidden z-20">
                            <NavigationSheet />
                        </div>
                    </div>
                </div>
            </Navbar>
            <div className="relative">
                <GridLines />
                <GradientEllipses />
                <HeroSectionCarousel />
                {/* <HeroSection /> */}
                <div className="relative z-1">
                    <MissionSection />
                </div>
                <ModuleSection />
                <PlanSection />
                <div className="relative z-1">
                    <FAQSection />
                </div>
                <ContactSection />
            </div>
            <Footer />
        </>
    );
}

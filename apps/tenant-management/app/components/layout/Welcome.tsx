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
import { useKeycloak } from "~/providers/KeycloakProvider";
import { UserMenu } from "~/components/navbar/UserMenu";
import { HeroSectionCarousel } from "../section/HeroSectionCarousel";

export default function Welcome() {
    const { isAuthenticated, login } = useKeycloak();

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
                        {!isAuthenticated ? (
                            <div className="flex gap-2">
                                <Link to="/sign-up">
                                    <Button variant="outline" className="hidden sm:inline-flex">Sign Up</Button>
                                </Link>
                                <Button 
                                    onClick={() => login()}
                                    className="bg-[#10B981] hover:bg-[#0a5139] text-white hover:text-white"
                                >
                                    Get Started
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/overview">
                                    <Button variant="outline" className="bg-[#10B981] hover:bg-[#0a5139] text-white hover:text-white">
                                        Go to Dashboard
                                    </Button>
                                </Link>
                                <UserMenu showDetails={false} />
                            </div>
                        )}
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

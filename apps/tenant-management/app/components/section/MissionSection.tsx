import { Card, CardContent } from "~/components/ui/card"

export const MissionSection = () => {
    return (
        <section className="py-20 px-4 w-full bg-gradient-to-r from-[#2563EB] to-[#10B981] opacity-70" id="mission">
            <div className="container max-w-7xl mx-auto px-16">
                <Card className="bg-transparent border-none shadow-none">
                    <CardContent className="grid gap-12 md:grid-cols-[70%_30%] items-center justify-center">
                        <div className="text-white mx-auto md:mx-0 gap-10 flex flex-col">
                            <h2 className="text-[64px] leading-[70px] font-bold text-white text-center md:text-left">
                                Our Mission
                            </h2>
                            <p className="pl-10 text-lg text-[20px] max-w-[801px] mx-auto  font-normal md:mx-0 text-center md:text-left leading-[70px] break-words ">
                                To build a unified ERP system that streamlines planning,
                                procurement, supply and asset management, and account
                                management into one secure platform—driving efficiency,
                                transparency, and smarter decision-making.
                            </p>
                        </div>
                        <div className="flex justify-center">
                            <img
                                src="/image/OurMission.png"
                                alt="Mission illustration"
                                className="w-80 h-80 object-contain"
                            />
                        </div>
                    </CardContent>

                </Card>
            </div>
        </section>
    )
}

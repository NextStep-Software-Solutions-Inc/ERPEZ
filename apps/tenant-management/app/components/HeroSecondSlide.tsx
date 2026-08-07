export default function HeroSecondSlide() {
    return (
        <section className="bg-transparent w-full">
            <div className="relative overflow-hidden bg-hero">
                <div className="pointer-events-none absolute inset-0 bg-grid" />
                <div className="pointer-events-none absolute inset-0 bg-glow" />
                <div className="container relative mx-auto flex min-h-[72vh] flex-col items-center justify-center py-24 text-center sm:py-32">
                    <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
                        <span className="block">See ERP EZ in
                        </span>
                        <span className="block bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
                            Action
                        </span>
                    </h1>
                    <p className="mt-6 max-w-2xl text-balance text-base text-slate-600 sm:text-lg">
                        Watch how leading enterprises streamline their operations and boost productivity by up to 40% with our comprehensive ERP solution.
                    </p>
                    <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row w-full max-w-5xl  ">
                        <div className="w-full max-w-5xl ">

                            <iframe
                                className="w-full h-48 aspect-video sm:h-64 md:h-80 rounded-md shadow-lg"
                                src="https://www.youtube.com/embed/ZK-rNEhJIDs?autoplay=1&mute=1&controls=1"
                                title="ERP demo"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
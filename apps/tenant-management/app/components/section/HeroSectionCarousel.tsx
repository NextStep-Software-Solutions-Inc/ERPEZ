
import { useEffect, useRef, useState } from "react"
import { Play } from "lucide-react"
import { Button } from "~/components/ui/button"
import HeroMainSlide from "../HeroMainSlide"
import HeroSecondSlide from "../HeroSecondSlide"
const AUTOPLAY_DELAY_MS = 10000
export function HeroSectionCarousel() {
    const slides = [
        // First slide: the existing main hero
        <main
            key="hero-main"
            className="relative isolate h-screen overflow-hidden flex items-center justify-center bg-transparent"
            id="home"
        >
            <HeroMainSlide />
        </main>,
        <main
            key="hero-demo"
            className="relative isolate h-screen overflow-hidden flex items-center justify-center bg-transparent"
            id="home"
        >
            <HeroSecondSlide />
        </main>,

        <main
            key="slide-3"
            className="relative isolate h-screen overflow-hidden flex items-center justify-center bg-transparent"
        >
            <div className="container relative mx-auto flex min-h-[72vh] flex-col items-center justify-center py-24 text-center sm:py-32">
                <h2 className="text-4xl font-bold">Slide Three</h2>
                <p className="mt-4 text-slate-600 max-w-xl">
                    Third carousel item.
                </p>
            </div>
        </main>,
    ]

    const [index, setIndex] = useState(0)
    const delay = AUTOPLAY_DELAY_MS
    const timerRef = useRef<number | null>(null)
    const isHovering = useRef(false)

    useEffect(() => {
        function tick() {
            setIndex((i) => (i + 1) % slides.length)
        }

        function start() {
            stop() 
            timerRef.current = window.setInterval(() => {
                if (!isHovering.current) tick()
            }, delay)
        }

        function stop() {
            if (timerRef.current !== null) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
        }

        start()
        return stop
    }, [slides.length])

    // Controls
    const goTo = (i: number) => setIndex(((i % slides.length) + slides.length) % slides.length)
    const prev = () => goTo(index - 1)
    const next = () => goTo(index + 1)

    return (
        <div
            className="relative h-screen w-full overflow-hidden"
            onMouseEnter={() => {
                isHovering.current = true
            }}
            onMouseLeave={() => {
                isHovering.current = false
            }}
        >
            {/* slides track */}
            <div
                className="flex h-full w-full transition-transform duration-500 ease-in-out"
                style={{
                    width: `${slides.length * 100}%`,
                    transform: `translateX(-${index * (100 / slides.length)}%)`,
                }}
            >
                {slides.map((slide, i) => (
                    <div
                        key={i}
                        className="h-full flex-shrink-0 w-full bg-transparent"
                        style={{ width: `${100 / slides.length}%` }}
                        aria-hidden={i !== index}
                    >
                        {slide}
                    </div>
                ))}
            </div>

            {/* nav dots */}
            <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        className={
                            "h-3 w-16 rounded-full transition-colors " +
                            (i === index ? "bg-gray-400" : "bg-blue-400/40")
                        }
                    />
                ))}
            </div>
        </div>
    )
}
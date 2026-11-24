import { Play } from "lucide-react"
import { Button } from "~/components/ui/button"

export function HeroSection() {
  return (
    <main className="relative isolate h-screen overflow-hidden flex items-center justify-center" id="home">
      <section className="bg-transparent w-full">
        <div className="relative overflow-hidden bg-hero">
          <div className="pointer-events-none absolute inset-0 bg-grid" />
          <div className="pointer-events-none absolute inset-0 bg-glow" />
          <div className="container relative mx-auto flex min-h-[72vh] flex-col items-center justify-center py-24 text-center sm:py-32">
            <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
              <span className="block">Enterprise</span>
              <span className="block bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
                Resource Planning
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-balance text-base text-slate-600 sm:text-lg">
              Transform your business operations with our integrated ERP
              platform. Unify Account Management, Strategic Planning,
              and Procurement into one powerful, intelligent system.
            </p>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
              <Button
                size="lg"
                className="h-11 px-6 text-sm bg-blue-700 font-semibold shadow-sm sm:h-12 sm:px-7"
              >
                Start Free Trial
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-11 px-6 text-sm sm:h-12 sm:px-7"
              >
                <Play className="mr-2 h-4 w-4" /> Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

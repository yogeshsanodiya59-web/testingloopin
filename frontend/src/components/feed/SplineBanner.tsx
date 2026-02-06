'use client'

import { SplineScene } from "@/components/ui/spline-scene";
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"

export default function SplineBanner() {
    return (
        <Card className="w-full h-[300px] md:h-[400px] bg-black/[0.96] relative overflow-hidden ring-1 ring-white/10 shadow-2xl">
            <Spotlight
                className="-top-40 left-0 md:left-60 md:-top-20"
                fill="white"
            />

            <div className="flex flex-col md:flex-row h-full">
                {/* Left content */}
                <div className="flex-1 p-6 md:p-8 relative z-10 flex flex-col justify-center pointer-events-none">
                    <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                        Interactive 3D
                    </h1>
                    <p className="mt-3 text-neutral-300 max-w-sm text-sm md:text-base">
                        Bring your UI to life with beautiful 3D scenes. Create immersive experiences
                        that capture attention.
                    </p>
                </div>

                {/* Right content */}
                <div className="flex-1 relative min-h-[50%] md:min-h-auto">
                    <SplineScene
                        scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                        className="w-full h-full"
                    />
                </div>
            </div>
        </Card>
    )
}

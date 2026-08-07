import { useMemo } from 'react';

interface GradientEllipsesProps {
  numEllipses?: number;
  opacityRange?: [number, number];
}

const ellipses = [
  { size: 'w-[280px] h-[234px]', gradient: 'bg-gradient-to-br from-[#2563eb] to-[#10b981]', position: 'top-[10%] -left-[12%]', floatClass: 'float-variant-1 delay-1' },
  { size: 'w-[180px] h-[200px]', gradient: 'bg-[#10b981]', position: 'top-[20%] right-[14%]', floatClass: 'float-variant-2 delay-2' },
  { size: 'w-[200px] h-[250px]', gradient: 'bg-[#2563eb]', position: 'top-[10%] right-[8%]', floatClass: 'float-variant-3 delay-3' },
  { size: 'w-[400px] h-[415px]', gradient: 'bg-[#10b981]', position: 'top-[4%] left-[39%]', floatClass: 'float-variant-2 delay-1' },
  { size: 'w-[400px] h-[415px]', gradient: 'bg-[#10b981]', position: 'top-[10%] left-[30%]', floatClass: 'float-variant-3 delay-3' },
  { size: 'w-[350px] h-[370px]', gradient: 'bg-gradient-to-tl from-[#10b981] to-[#2563eb]', position: 'top-[35%] right-[2%]', floatClass: 'float-variant-1 delay-3' },
  { size: 'w-[300px] h-[410px]', gradient: 'bg-gradient-to-bl from-[#10b981] to-[#2563eb]', position: 'top-[49%] right-[72%]', floatClass: 'float-variant-3 delay-3' },
  { size: 'w-[340px] h-[360px]', gradient: 'bg-[#2563eb]', position: 'top-[55%] left-[82%]', floatClass: 'float-variant-2 delay-2' },
  { size: 'w-[320px] h-[280px]', gradient: 'bg-gradient-to-br from-[#10b981] to-[#2563eb]', position: 'top-[75%] right-[12%]', floatClass: 'float-variant-2 delay-1' },
  { size: 'w-[280px] h-[240px]', gradient: 'bg-[#2563eb]', position: 'top-[85%] left-[20%]', floatClass: 'float-variant-1 delay-2' },
  { size: 'w-[360px] h-[300px]', gradient: 'bg-[#10b981]', position: 'top-[120%] right-[25%]', floatClass: 'float-variant-3 delay-3' },
  { size: 'w-[300px] h-[250px]', gradient: 'bg-gradient-to-br from-[#10b981] to-[#2563eb]', position: 'top-[94%] left-[78%]', floatClass: 'float-variant-1 delay-2' },
];

// Seeded random function to ensure consistency between server and client
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function GradientEllipses({ numEllipses = 12, opacityRange = [0.15, 0.18] }: GradientEllipsesProps) {

  const opacities = useMemo(() => {
    return ellipses.slice(0, numEllipses).map((_, index) => {
      const random = seededRandom(index + 1);
      return random * (opacityRange[1] - opacityRange[0]) + opacityRange[0];
    });
  }, [numEllipses, opacityRange]);

  return (
    <>
      <style>
        {`
          @keyframes float1 {
            0%, 100% { transform: translate(0, 0); }
            25% { transform: translate(150px, -100px); }
            50% { transform: translate(-120px, 80px); }
            75% { transform: translate(100px, 120px); }
          }
          @keyframes float2 {
            0%, 100% { transform: translate(0, 0); }
            20% { transform: translate(-180px, 90px); }
            40% { transform: translate(140px, -70px); }
            60% { transform: translate(-100px, -150px); }
            80% { transform: translate(120px, 100px); }
          }
          @keyframes float3 {
            0%, 100% { transform: translate(0, 0); }
            30% { transform: translate(200px, 120px); }
            60% { transform: translate(-160px, -80px); }
            90% { transform: translate(100px, -140px); }
          }

          /* generic floating class with random-like effect */
          .float-variant-1 { animation: float1 18s ease-in-out infinite alternate; }
          .float-variant-2 { animation: float2 22s ease-in-out infinite alternate; }
          .float-variant-3 { animation: float3 20s ease-in-out infinite alternate; }

          /* add delays so they don't sync */
          .delay-1 { animation-delay: 2s; }
          .delay-2 { animation-delay: 4s; }
          .delay-3 { animation-delay: 6s; }
        `}
      </style>
      <div className="absolute inset-0 overflow-hidden">
        {ellipses.slice(0, numEllipses).map((ellipse, index) => {
          return (
            <div
              key={index}
              className={`absolute rounded-full ${ellipse.size} ${ellipse.gradient} blur-2xl ${ellipse.position} ${ellipse.floatClass}`}
              style={{ opacity: opacities[index] }}
            />
          );
        })}
      </div>
    </>
  );
}

export default GradientEllipses;

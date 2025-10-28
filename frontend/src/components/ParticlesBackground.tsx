import { useEffect, useMemo } from 'react';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { type ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { useTheme } from '../hooks/useTheme';

const ParticlesBackground = () => {
  const { isDark } = useTheme();

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    });
  }, []);

  const options: ISourceOptions = useMemo(
    () => ({
      background: {
        color: {
          value: "transparent",
        },
      },
      fpsLimit: 60,
      interactivity: {
        events: {
          onClick: {
            enable: true,
            mode: "push",
          },
          onHover: {
            enable: true,
            mode: "repulse",
          },
          resize: {
            enable: true,
            delay: 0.5
          },
        },
        modes: {
          push: {
            quantity: 4,
          },
          repulse: {
            distance: 200,
            duration: 0.4,
          },
        },
      },
      particles: {
        color: {
          value: isDark 
            ? ["#60a5fa", "#3b82f6", "#2563eb", "#8b5cf6", "#a855f7", "#ec4899", "#f43f5e"]  // Palette plus colorée pour le mode sombre
            : ["#1d4ed8", "#2563eb", "#3b82f6", "#7c3aed", "#8b5cf6", "#d946ef", "#ec4899"],  // Palette plus colorée pour le mode clair
        },
        links: {
          color: isDark ? "#475569" : "#94a3b8",
          distance: 150,
          enable: true,
          opacity: isDark ? 0.15 : 0.1,
          width: 1,
        },
        collisions: {
          enable: true,
        },
        move: {
          direction: "none",
          enable: true,
          outModes: {
            default: "bounce",
          },
          random: true,
          speed: 1.2,
          straight: false,
          attract: {
            enable: true,
            rotate: {
              x: 600,
              y: 600,
            },
          },
        },
        number: {
          density: {
            enable: true,
            area: 800,
          },
          value: 60,
        },
        opacity: {
          value: isDark ? 0.4 : 0.3,
          animation: {
            enable: true,
            speed: 0.3,
            minimumValue: 0.1,
          },
        },
        shape: {
          type: ["circle", "triangle", "star"],
        },
        size: {
          value: { min: 1, max: 4 },
          animation: {
            enable: true,
            speed: 2,
            minimumValue: 0.5,
          },
        },
      },
      detectRetina: true,
    }),
    [isDark]
  );

  return (
    <Particles 
      id="tsparticles" 
      options={options} 
      className="absolute inset-0 -z-10 transition-opacity duration-1000" 
    />
  );
}

export default ParticlesBackground;
import { useEffect, useState } from "react";
import { getWorldEnvironment } from "../lib/worldEnvironment.js";

const WEATHER_SEED_KEY = "token-harbor-weather-seed";

function getOrCreateWeatherSeed() {
  if (typeof window === "undefined") return "token-harbor";
  const stored = window.localStorage.getItem(WEATHER_SEED_KEY);
  if (stored) return stored;
  const seed = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(WEATHER_SEED_KEY, seed);
  return seed;
}

export function useWorldEnvironment() {
  const [seed] = useState(getOrCreateWeatherSeed);
  const [environment, setEnvironment] = useState(() => getWorldEnvironment(new Date(), seed));

  useEffect(() => {
    const refresh = () => setEnvironment(getWorldEnvironment(new Date(), seed));
    const timer = window.setInterval(refresh, 15_000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [seed]);

  return environment;
}

import { useState, useEffect } from "react";
import { WeatherInfo } from "../types/portfolio.types.ts";

export function useWeather() {
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const requestWeather = async (forceWithSpeech = false) => {
    if (!navigator.geolocation) {
      setWeatherError("Géolocalisation indisponible");
      return;
    }

    setWeatherLoading(true);
    setWeatherError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch("/api/weather", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude, longitude }),
          });
          if (res.ok) {
            const data: WeatherInfo = await res.json();
            setWeather(data);
            
            if (forceWithSpeech && typeof window !== "undefined") {
              const speakText = (txt: string) => {
                if ("speechSynthesis" in window) {
                   window.speechSynthesis.cancel();
                   const utterance = new SpeechSynthesisUtterance(txt);
                   utterance.lang = "fr-FR";
                   window.speechSynthesis.speak(utterance);
                }
              };
              speakText(`Géolocalisation réussie. Bienvenue à ${data.city}.`);
            }
          } else {
            throw new Error("Could not fetch remote weather info");
          }
        } catch (err) {
          console.error("Weather error:", err);
          setWeatherError("Erreur météo");
        } finally {
          setWeatherLoading(false);
        }
      },
      (error) => {
        setWeatherLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setWeatherError("Autorisation refusée");
        } else {
          setWeatherError("Calcul impossible");
        }
      }
    );
  };

  useEffect(() => {
    requestWeather(false);
  }, []);

  return { weather, weatherLoading, weatherError, requestWeather };
}

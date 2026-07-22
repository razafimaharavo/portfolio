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
          const url = `/api/weather?${new URLSearchParams({
            latitude: String(latitude),
            longitude: String(longitude),
          })}`;
          const res = await fetch(url);
          const contentType = res.headers.get("content-type") || "";
          const data = contentType.includes("application/json")
            ? await res.json()
            : null;

          if (!data) {
            throw new Error("Unexpected non-JSON weather response");
          }

          if (res.ok) {
            setWeather(data as WeatherInfo);

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
            throw new Error(
              data.error || "Could not fetch remote weather info",
            );
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
      },
    );
  };

  useEffect(() => {
    requestWeather(false);
  }, []);

  return { weather, weatherLoading, weatherError, requestWeather };
}

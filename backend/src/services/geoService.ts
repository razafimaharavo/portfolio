export interface GeoDataResult {
  country: string;
  city: string;
  ipType: string;
  provider: string;
  geoResponse: any;
  failureLog: string[];
}

export interface UserAgentDetails {
  browser: string;
  platform: string;
}

const GEO_PROVIDER_TIMEOUT_MS = 1500;

export function getIpType(ip: string): "IPv4" | "IPv6" | "Inconnu" {
  const trimmed = ip.trim();
  if (trimmed.includes(".")) {
    return "IPv4";
  }
  if (trimmed.includes(":")) {
    return "IPv6";
  }
  return "Inconnu";
}

export function isLocalIp(ip: string): boolean {
  const trimmed = ip.trim().toLowerCase();

  // Loopback IPv4 & IPv6
  if (trimmed === "127.0.0.1" || trimmed === "::1" || trimmed === "localhost") {
    return true;
  }

  // Mapped IPv4 loopback
  if (trimmed.startsWith("::ffff:127.")) {
    return true;
  }

  // IPv4 Private Ranges:
  // 10.0.0.0/8
  if (trimmed.startsWith("10.")) {
    return true;
  }

  // 192.168.0.0/16
  if (trimmed.startsWith("192.168.")) {
    return true;
  }

  // 172.16.0.0/12 -> 172.16.x.x to 172.31.x.x
  const ipv4Parts = trimmed.split(".");
  if (ipv4Parts.length === 4) {
    const first = parseInt(ipv4Parts[0], 10);
    const second = parseInt(ipv4Parts[1], 10);
    if (first === 172 && second >= 16 && second <= 31) {
      return true;
    }
  }

  // IPv6 Private / Link-Local:
  // fe80::/10 (Link-Local)
  // fc00::/7 (Unique Local Address)
  if (
    trimmed.startsWith("fe80:") ||
    trimmed.startsWith("fc00:") ||
    trimmed.startsWith("fd00:")
  ) {
    return true;
  }

  return false;
}

async function fetchWithTimeout(
  url: string,
  options: any = {},
  timeoutMs = 4000,
) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function resolveGeoLocation(ip: string): Promise<GeoDataResult> {
  const ipType = getIpType(ip);
  const failureLog: string[] = [];

  if (isLocalIp(ip)) {
    return {
      country: "Développement local",
      city: "Développement local",
      ipType,
      provider: "Localhost / Réseau privé",
      geoResponse: { local: true },
      failureLog,
    };
  }

  const providers = [
    {
      name: "ipwho.is",
      fetchUrl: `https://ipwho.is/${ip}`,
      parse: (data: any) => {
        if (data.success === false) {
          throw new Error(
            data.message || "success: false returned by ipwho.is API",
          );
        }
        return {
          country: data.country || "Non identifié",
          city: data.city || "Non identifiée",
        };
      },
    },
    {
      name: "ipapi.co",
      fetchUrl: `https://ipapi.co/${ip}/json/`,
      parse: (data: any) => {
        if (data.error) {
          throw new Error(
            data.reason || "error: true returned by ipapi.co API",
          );
        }
        return {
          country: data.country_name || "Non identifié",
          city: data.city || "Non identifiée",
        };
      },
    },
    {
      name: "geojs.io",
      fetchUrl: `https://get.geojs.io/v1/ip/geo/${ip}.json`,
      parse: (data: any) => {
        return {
          country: data.country || "Non identifié",
          city: data.city || "Non identifiée",
        };
      },
    },
  ];

  const fallbackResult = (): GeoDataResult => ({
    country: "Non identifié",
    city: "Non identifiée",
    ipType,
    provider: "Aucun (fournisseurs indisponibles ou trop lents)",
    geoResponse: { error: "GeoIP providers failed or timed out" },
    failureLog,
  });

  const lookupProvider = async (
    provider: (typeof providers)[number],
  ): Promise<GeoDataResult> => {
    try {
      const response = await fetchWithTimeout(
        provider.fetchUrl,
        {},
        GEO_PROVIDER_TIMEOUT_MS,
      );
      if (!response.ok) {
        throw new Error(`HTTP Error Status ${response.status}`);
      }
      const data = await response.json();
      const parsed = provider.parse(data);
      return {
        ...parsed,
        ipType,
        provider: provider.name,
        geoResponse: data,
        failureLog,
      };
    } catch (err: any) {
      const reason = err?.message || String(err);
      failureLog.push(`Provider ${provider.name} failed. Reason: ${reason}`);
      console.log(`Provider ${provider.name} failed`);
      console.log(`Reason: ${reason}`);
      throw err;
    }
  };

  try {
    return await Promise.race([
      Promise.any(providers.map(lookupProvider)),
      new Promise<GeoDataResult>((resolve) =>
        setTimeout(resolve, GEO_PROVIDER_TIMEOUT_MS + 300, fallbackResult()),
      ),
    ]);
  } catch {
    return fallbackResult();
  }
}

export function parseUserAgent(
  userAgent: string | undefined,
): UserAgentDetails {
  if (!userAgent) {
    return { browser: "Non identifié", platform: "Non identifiée" };
  }

  let browser = "Non identifié";
  let platform = "Non identifiée";

  const ua = userAgent.toLowerCase();

  // Detect Platform
  if (ua.includes("windows")) {
    platform = "Windows";
  } else if (
    ua.includes("macintosh") ||
    ua.includes("mac os") ||
    ua.includes("mac_powerpc")
  ) {
    platform = "macOS";
  } else if (ua.includes("android")) {
    platform = "Android";
  } else if (
    ua.includes("iphone") ||
    ua.includes("ipad") ||
    ua.includes("ipod")
  ) {
    platform = "iOS";
  } else if (ua.includes("linux")) {
    platform = "Linux";
  }

  // Detect Browser
  if (ua.includes("edg/")) {
    browser = "Edge";
  } else if (ua.includes("opr/") || ua.includes("opera")) {
    browser = "Opera";
  } else if (ua.includes("chrome") || ua.includes("crios")) {
    browser = "Chrome";
  } else if (ua.includes("firefox") || ua.includes("fxios")) {
    browser = "Firefox";
  } else if (ua.includes("safari")) {
    browser = "Safari";
  } else if (ua.includes("msie") || ua.includes("trident")) {
    browser = "Internet Explorer";
  }

  return { browser, platform };
}

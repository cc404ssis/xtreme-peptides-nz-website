import { useState, useEffect } from "react";

interface SiteConfig {
  brandName: string;
  tagline: string;
  siteTitle: string;
  footerDesc: string;
  copyright: string;
  productBadge: string;
  shopSubheading: string;
}

const defaults: SiteConfig = {
  brandName: "",
  tagline: "",
  siteTitle: "",
  footerDesc: "",
  copyright: "",
  productBadge: "",
  shopSubheading: "",
};

let cache: SiteConfig | null = null;
let promise: Promise<SiteConfig> | null = null;

function getConfig(): Promise<SiteConfig> {
  if (cache) return Promise.resolve(cache);
  if (!promise) {
    promise = fetch("/api/site-config")
      .then((r) => (r.ok ? r.json() : defaults))
      .then((data) => { cache = data; return data; })
      .catch(() => defaults);
  }
  return promise;
}

export function useSiteConfig(): SiteConfig {
  const [config, setConfig] = useState<SiteConfig>(cache ?? defaults);
  useEffect(() => {
    if (cache) return;
    getConfig().then(setConfig);
  }, []);
  return config;
}

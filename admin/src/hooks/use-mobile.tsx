import * as React from "react";
import { matchMedia, getWindowWidth, isBrowser } from "@/lib/browser";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    if (!isBrowser) {
      setIsMobile(false);
      return;
    }

    const mql = matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(getWindowWidth() < MOBILE_BREAKPOINT);
    };
    
    if (mql) {
      mql.addEventListener("change", onChange);
      setIsMobile(getWindowWidth() < MOBILE_BREAKPOINT);
      return () => mql.removeEventListener("change", onChange);
    } else {
      setIsMobile(getWindowWidth() < MOBILE_BREAKPOINT);
    }
  }, []);

  return !!isMobile;
}

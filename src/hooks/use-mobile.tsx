
"use client"

import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Set initial state
    checkMobile()

    // Use standard addEventListener
    mql.addEventListener("change", checkMobile)
    
    // Cleanup
    return () => mql.removeEventListener("change", checkMobile)
  }, [])

  return isMobile
}

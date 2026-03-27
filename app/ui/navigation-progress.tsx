"use client";

import Link, { type LinkProps } from "next/link";
import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type PropsWithChildren,
  useEffect,
} from "react";
import { 
  Loader2, 
  Navigation, 
  ArrowRight, 
  CheckCircle2,
  Sparkles
} from "lucide-react";

type NavigationProgressContextValue = {
  startLoading: () => void;
  stopLoading: () => void;
  isLoading: boolean;
};

const NavigationProgressContext = createContext<NavigationProgressContextValue | null>(
  null,
);

export function NavigationProgressProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);
  const progressTimerRef = useRef<number | null>(null);

  const startLoading = () => {
    setIsLoading(true);
    setProgress(0);
    
    // Simulate progress for better UX
    if (progressTimerRef.current) {
      window.clearInterval(progressTimerRef.current);
    }
    
    progressTimerRef.current = window.setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 150);
    
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
        if (progressTimerRef.current) {
          window.clearInterval(progressTimerRef.current);
        }
      }, 200);
    }, 2000);
  };

  const stopLoading = () => {
    setProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
      }
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    }, 200);
  };

  const value = useMemo<NavigationProgressContextValue>(
    () => ({
      startLoading,
      stopLoading,
      isLoading,
    }),
    [isLoading],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
      }
    };
  }, []);

  return (
    <NavigationProgressContext.Provider value={value}>
      {children}
      
      {/* Top Progress Bar */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 transition-all duration-150 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* Loading Toast Notification */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ${
          isLoading
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <div className="group relative overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-100">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative flex items-center gap-4 px-5 py-4 min-w-[280px]">
            {/* Animated spinner */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
              <div className="relative rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 p-2.5 shadow-lg">
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Navigation className="h-3.5 w-3.5 text-emerald-600" />
                <p className="text-sm font-semibold text-gray-900">
                  Navigating
                </p>
              </div>
              <p className="text-xs text-gray-500">
                Loading the next page...
              </p>
              
              {/* Progress indicator */}
              <div className="mt-2">
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            </div>
            
            {/* Decorative element */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-1 h-8 bg-gradient-to-b from-emerald-200 to-emerald-300 rounded-full opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* Alternative: Compact loading indicator for mobile */}
      <div
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 md:hidden ${
          isLoading
            ? "translate-y-0 opacity-100"
            : "-translate-y-8 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-2 rounded-full bg-gray-900/90 backdrop-blur-md px-4 py-2 shadow-lg">
          <Loader2 className="h-4 w-4 text-emerald-400 animate-spin" />
          <span className="text-xs font-medium text-white">Loading...</span>
        </div>
      </div>
    </NavigationProgressContext.Provider>
  );
}

type LoadingLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    className?: string;
    variant?: "primary" | "secondary" | "outline";
  };

export function LoadingLink({ 
  children, 
  onClick, 
  className = "", 
  variant = "primary",
  ...props 
}: LoadingLinkProps) {
  const context = useContext(NavigationProgressContext);
  const [isHovered, setIsHovered] = useState(false);

  const variantClasses = {
    primary: "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:shadow-lg hover:from-emerald-700 hover:to-emerald-800",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200",
    outline: "border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
  };

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    
    // Don't trigger loading for modifier keys or new tab
    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      props.target === "_blank"
    ) {
      return;
    }
    
    context?.startLoading();
  };

  return (
    <Link
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {variant === "primary" && (
        <ArrowRight 
          className={`h-4 w-4 transition-transform duration-200 ${
            isHovered ? "translate-x-1" : ""
          }`} 
        />
      )}
    </Link>
  );
}

// Optional: Export a custom hook for manual control
export function useNavigationProgress() {
  const context = useContext(NavigationProgressContext);
  
  if (!context) {
    throw new Error("useNavigationProgress must be used within NavigationProgressProvider");
  }
  
  return context;
}

// Optional: Export a button component that triggers loading
export function LoadingButton({ 
  children, 
  onClick, 
  isLoading = false,
  className = "",
  variant = "primary",
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline";
  isLoading?: boolean;
}) {
  const context = useContext(NavigationProgressContext);
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:shadow-lg hover:from-emerald-700 hover:to-emerald-800",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200",
    outline: "border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    context?.startLoading();
  };

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

// Optional: Export a route change indicator for manual usage
export function RouteChangeIndicator() {
  const { isLoading } = useNavigationProgress();
  
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-emerald-500/5 animate-pulse" />
    </div>
  );
}
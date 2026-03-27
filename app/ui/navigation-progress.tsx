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
} from "react";

import { Spinner } from "@/app/ui/spinner";

type NavigationProgressContextValue = {
  startLoading: () => void;
};

const NavigationProgressContext = createContext<NavigationProgressContextValue | null>(
  null,
);

export function NavigationProgressProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<number | null>(null);

  const value = useMemo<NavigationProgressContextValue>(
    () => ({
      startLoading: () => {
        setIsLoading(true);
        if (timerRef.current) {
          window.clearTimeout(timerRef.current);
        }
        timerRef.current = window.setTimeout(() => {
          setIsLoading(false);
        }, 1200);
      },
    }),
    [],
  );

  return (
    <NavigationProgressContext.Provider value={value}>
      {children}
      <div
        className={`pointer-events-none fixed right-5 top-24 z-50 transition-all duration-200 ${
          isLoading
            ? "translate-y-0 opacity-100"
            : "-translate-y-2 opacity-0"
        }`}
      >
        <div className="flex items-center gap-3 rounded-full border border-stone-900/10 bg-white/92 px-4 py-3 shadow-[0_14px_38px_rgba(28,25,23,0.12)] backdrop-blur">
          <Spinner className="text-emerald-700" label="Page loading" size="md" />
          <div className="text-sm">
            <p className="font-semibold text-stone-950">Loading page</p>
            <p className="text-stone-500">Fetching the next screen...</p>
          </div>
        </div>
      </div>
    </NavigationProgressContext.Provider>
  );
}

type LoadingLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    className?: string;
  };

export function LoadingLink({ children, onClick, ...props }: LoadingLinkProps) {
  const context = useContext(NavigationProgressContext);

  return (
    <Link
      {...props}
      onClick={(event) => {
        onClick?.(event);
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
      }}
    >
      {children}
    </Link>
  );
}

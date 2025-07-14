import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AccessibilityState {
  announceMessage: (message: string) => void;
  focusElement: (selector: string) => void;
  skipToContent: () => void;
  isKeyboardNavigation: boolean;
  fontSize: number;
  setFontSize: (size: number) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
}

const AccessibilityContext = createContext<AccessibilityState | undefined>(undefined);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [announcer, setAnnouncer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Create screen reader announcer
    const announcerElement = document.createElement("div");
    announcerElement.setAttribute("aria-live", "polite");
    announcerElement.setAttribute("aria-atomic", "true");
    announcerElement.className = "sr-only";
    announcerElement.id = "accessibility-announcer";
    document.body.appendChild(announcerElement);
    setAnnouncer(announcerElement);

    // Detect keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        setIsKeyboardNavigation(true);
        document.body.setAttribute("data-keyboard-nav", "true");
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardNavigation(false);
      document.body.removeAttribute("data-keyboard-nav");
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleMouseDown);

    // Load saved font size
    const savedFontSize = localStorage.getItem("art-souk-font-size");
    if (savedFontSize) {
      const size = parseInt(savedFontSize, 10);
      setFontSize(size);
      document.documentElement.style.fontSize = `${size}px`;
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);
      if (announcerElement.parentNode) {
        announcerElement.parentNode.removeChild(announcerElement);
      }
    };
  }, []);

  const announceMessage = (message: string) => {
    if (announcer) {
      announcer.textContent = message;
      // Clear after a short delay to allow multiple announcements
      setTimeout(() => {
        announcer.textContent = "";
      }, 1000);
    }
  };

  const focusElement = (selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
      announceMessage(`Focused on ${element.getAttribute("aria-label") || element.tagName}`);
    }
  };

  const skipToContent = () => {
    focusElement("#main-content");
  };

  const updateFontSize = (size: number) => {
    const clampedSize = Math.max(12, Math.min(24, size));
    setFontSize(clampedSize);
    document.documentElement.style.fontSize = `${clampedSize}px`;
    localStorage.setItem("art-souk-font-size", clampedSize.toString());
    announceMessage(`Font size set to ${clampedSize} pixels`);
  };

  const increaseFontSize = () => {
    updateFontSize(fontSize + 2);
  };

  const decreaseFontSize = () => {
    updateFontSize(fontSize - 2);
  };

  const resetFontSize = () => {
    updateFontSize(16);
  };

  const value: AccessibilityState = {
    announceMessage,
    focusElement,
    skipToContent,
    isKeyboardNavigation,
    fontSize,
    setFontSize: updateFontSize,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
};

// Skip to content component
export function SkipToContent() {
  const { skipToContent } = useAccessibility();

  return (
    <button
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md focus-ring"
      onClick={skipToContent}
    >
      Skip to main content
    </button>
  );
}

// Accessibility toolbar component
export function AccessibilityToolbar() {
  const { fontSize, increaseFontSize, decreaseFontSize, resetFontSize } = useAccessibility();

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-2 no-print">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Font Size:</span>
        <button
          onClick={decreaseFontSize}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Decrease font size"
        >
          A-
        </button>
        <span className="text-sm">{fontSize}px</span>
        <button
          onClick={increaseFontSize}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Increase font size"
        >
          A+
        </button>
        <button
          onClick={resetFontSize}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-xs"
          aria-label="Reset font size"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
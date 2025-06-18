"use client";

import React, { useState, useEffect } from "react";
import {
  Cookie,
  Settings,
  X,
  Check,
  Shield,
  BarChart3,
  Target,
} from "lucide-react";

type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
};

const defaultPreferences: CookiePreferences = {
  necessary: true, // Always true, can't be disabled
  analytics: false,
  marketing: false,
  personalization: false,
};

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] =
    useState<CookiePreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("avenue-fashion-cookie-consent");
    const savedPreferences = localStorage.getItem(
      "avenue-fashion-cookie-preferences"
    );

    if (!consent) {
      // Show banner after a short delay
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (savedPreferences) {
      // Apply saved preferences
      const parsed = JSON.parse(savedPreferences);
      setPreferences(parsed);
      applyPreferences(parsed);
    }
  }, []);

  const applyPreferences = (prefs: CookiePreferences) => {
    // Enable/disable analytics
    if (prefs.analytics && typeof window !== "undefined") {
      // Enable Google Analytics
      (window as any).gtag?.("consent", "update", {
        analytics_storage: "granted",
      });
    }

    // Enable/disable marketing cookies
    if (prefs.marketing && typeof window !== "undefined") {
      (window as any).gtag?.("consent", "update", {
        ad_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
      });
    }

    // Apply other preferences as needed
    if (prefs.personalization) {
      // Enable personalization features
      document.documentElement.classList.add("personalization-enabled");
    }
  };

  const handleAcceptAll = async () => {
    setIsLoading(true);

    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true,
    };

    setPreferences(allAccepted);
    applyPreferences(allAccepted);

    localStorage.setItem("avenue-fashion-cookie-consent", "accepted");
    localStorage.setItem(
      "avenue-fashion-cookie-preferences",
      JSON.stringify(allAccepted)
    );

    // Small delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    setIsLoading(false);
    setShowBanner(false);
  };

  const handleAcceptNecessary = async () => {
    setIsLoading(true);

    const necessaryOnly: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false,
    };

    setPreferences(necessaryOnly);
    applyPreferences(necessaryOnly);

    localStorage.setItem("avenue-fashion-cookie-consent", "necessary-only");
    localStorage.setItem(
      "avenue-fashion-cookie-preferences",
      JSON.stringify(necessaryOnly)
    );

    await new Promise((resolve) => setTimeout(resolve, 500));

    setIsLoading(false);
    setShowBanner(false);
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);

    applyPreferences(preferences);

    localStorage.setItem("avenue-fashion-cookie-consent", "custom");
    localStorage.setItem(
      "avenue-fashion-cookie-preferences",
      JSON.stringify(preferences)
    );

    await new Promise((resolve) => setTimeout(resolve, 500));

    setIsLoading(false);
    setShowPreferences(false);
    setShowBanner(false);
  };

  const handlePreferenceChange = (
    key: keyof CookiePreferences,
    value: boolean
  ) => {
    if (key === "necessary") return; // Can't disable necessary cookies

    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (!showBanner) return null;

  if (showPreferences) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Settings className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Cookie Preferences
                </h2>
              </div>
              <button
                onClick={() => setShowPreferences(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We use cookies to enhance your shopping experience, provide
                personalized content, and analyze our traffic. You can choose
                which types of cookies to accept below.
              </p>

              {/* Necessary Cookies */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Necessary Cookies
                    </h3>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-green-600 font-medium mr-2">
                      Always Active
                    </span>
                    <div className="w-12 h-6 bg-green-500 rounded-full flex items-center justify-end px-1">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Essential for the website to function properly. These cookies
                  enable basic features like security, network management, and
                  accessibility.
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Analytics Cookies
                    </h3>
                  </div>
                  <button
                    onClick={() =>
                      handlePreferenceChange(
                        "analytics",
                        !preferences.analytics
                      )
                    }
                    className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                      preferences.analytics
                        ? "bg-blue-500 justify-end"
                        : "bg-gray-300 dark:bg-gray-600 justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full mx-1"></div>
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Help us understand how visitors interact with our website by
                  collecting and reporting information anonymously.
                </p>
              </div>

              {/* Marketing Cookies */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Marketing Cookies
                    </h3>
                  </div>
                  <button
                    onClick={() =>
                      handlePreferenceChange(
                        "marketing",
                        !preferences.marketing
                      )
                    }
                    className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                      preferences.marketing
                        ? "bg-purple-500 justify-end"
                        : "bg-gray-300 dark:bg-gray-600 justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full mx-1"></div>
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Used to track visitors across websites to display relevant and
                  engaging advertisements.
                </p>
              </div>

              {/* Personalization Cookies */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Cookie className="w-5 h-5 text-orange-600" />
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Personalization Cookies
                    </h3>
                  </div>
                  <button
                    onClick={() =>
                      handlePreferenceChange(
                        "personalization",
                        !preferences.personalization
                      )
                    }
                    className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                      preferences.personalization
                        ? "bg-orange-500 justify-end"
                        : "bg-gray-300 dark:bg-gray-600 justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full mx-1"></div>
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enable personalized content and remember your preferences to
                  enhance your shopping experience.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={handleSavePreferences}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                We value your privacy
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We use cookies to enhance your browsing experience, serve
                personalized content, and analyze our traffic. By clicking
                "Accept All", you consent to our use of cookies.{" "}
                <a
                  href="/privacy-policy"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                >
                  Learn more
                </a>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:flex-nowrap">
            <button
              onClick={() => setShowPreferences(true)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium transition-colors"
            >
              Customize
            </button>
            <button
              onClick={handleAcceptNecessary}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              Necessary Only
            </button>
            <button
              onClick={handleAcceptAll}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import { ProgressIndicator } from "./ProgressIndicator";

export interface AuthPageProps {
  step: "phone" | "code";
  onPhoneSubmit: (phone: string) => void;
  onCodeSubmit: (phone: string, code: string) => void;
  onResendCode?: (phone: string) => void;
  onBack?: () => void;
  phoneNumber?: string;
  loading: boolean;
  error?: string;
}

export function AuthPage({
  step,
  onPhoneSubmit,
  onCodeSubmit,
  onResendCode,
  onBack,
  phoneNumber = "",
  loading,
  error,
}: AuthPageProps) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const codeInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus code input when step changes to code
  useEffect(() => {
    if (step === "code" && codeInputRef.current) {
      codeInputRef.current.focus();
    }
  }, [step]);

  // Handle resend cooldown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendCooldown]);

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-numeric characters except +
    const cleaned = value.replace(/[^\d+]/g, "");

    // If it starts with +, handle international format
    if (cleaned.startsWith("+")) {
      return cleaned;
    }

    // US format: (123) 456-7890
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      return !match[2]
        ? match[1]
        : `(${match[1]}) ${match[2]}` + (match[3] ? `-${match[3]}` : "");
    }

    return cleaned;
  };

  const normalizePhoneNumber = (formattedPhone: string): string => {
    // Remove formatting and add +1 for US numbers
    const cleaned = formattedPhone.replace(/[^\d+]/g, "");

    if (cleaned.startsWith("+")) {
      return cleaned;
    }

    return `+1${cleaned}`;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const normalized = normalizePhoneNumber(phone);
    // Basic validation: at least 10 digits after country code
    return normalized.length >= 12 && normalized.startsWith("+");
  };

  const validateCode = (code: string): boolean => {
    return code.length === 6 && /^\d{6}$/.test(code);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
    setPhoneError("");
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numeric input
    const numericValue = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(numericValue);
    setCodeError("");
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePhoneNumber(phone)) {
      setPhoneError("Please enter a valid phone number");
      return;
    }

    const normalizedPhone = normalizePhoneNumber(phone);
    onPhoneSubmit(normalizedPhone);
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCode(code)) {
      setCodeError("Please enter a 6-digit verification code");
      return;
    }

    onCodeSubmit(phoneNumber, code);
  };

  const handleResendCode = () => {
    if (onResendCode && phoneNumber && resendCooldown === 0) {
      onResendCode(phoneNumber);
      setResendCooldown(30); // 30-second cooldown
    }
  };

  const formatPhoneDisplay = (phone: string): string => {
    if (!phone) return "";

    // Extract digits from international format
    const digits = phone.replace(/[^\d]/g, "");

    // US number format
    if (phone.startsWith("+1") && digits.length === 11) {
      const usDigits = digits.slice(1); // Remove country code
      return `(${usDigits.slice(0, 3)}) ${usDigits.slice(
        3,
        6
      )}-${usDigits.slice(6)}`;
    }

    return phone;
  };

  if (step === "phone") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900 flex items-center justify-center px-6 relative overflow-hidden">
        {/* Sage floating background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-tr from-purple-500/10 to-blue-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-md mx-auto relative z-10">
          {/* SMPL Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-yellow-400">smpl</h1>
          </div>

          {/* Progress indicator */}
          <ProgressIndicator
            currentStep={1}
            totalSteps={2}
            steps={["Sign Up", "Get Started"]}
          />
          <div className="backdrop-blur-sm bg-slate-800/90 rounded-3xl p-8 shadow-2xl border border-indigo-900/40 ring-1 ring-purple-500/20">
            <div className="text-center mb-8">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full opacity-20 blur-lg"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
                  <span className="text-3xl">📚</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-200 via-purple-300 to-indigo-200 bg-clip-text text-transparent mb-3">
                Stop overpaying on bills
              </h1>
              <p className="text-indigo-200 text-lg font-medium mb-4">
                We negotiate lower rates by grouping customers together
              </p>

              <p className="text-slate-300 text-base font-medium">
                No fees. Just savings.
              </p>
            </div>

            {error && (
              <div
                className="mb-6 p-4 bg-red-900/50 backdrop-blur-sm border border-red-700/50 rounded-2xl text-red-200 shadow-lg"
                role="alert"
                aria-live="polite"
              >
                <div className="flex items-center">
                  <span className="text-lg mr-2">⚠️</span>
                  {error}
                </div>
              </div>
            )}

            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="phone"
                  className="block text-lg font-semibold text-slate-200 mb-3"
                >
                  Phone number
                </label>
                <div className="relative">
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="w-full px-5 py-4 text-lg text-white bg-slate-700/70 backdrop-blur-sm border-2 border-slate-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-400/20 focus:border-blue-400 transition-all duration-300 placeholder-slate-400"
                    placeholder="(123) 456-7890"
                    aria-required="true"
                    aria-describedby="phone-help"
                    disabled={loading}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl pointer-events-none"></div>
                </div>

                <p
                  id="phone-help"
                  className="mt-3 text-sm text-slate-400 font-medium"
                >
                  We&apos;ll send you a verification code to get started
                </p>
                {phoneError && (
                  <div className="mt-2 p-3 bg-red-900/30 border border-red-700/50 rounded-xl">
                    <p
                      className="text-sm text-red-300 font-medium"
                      role="alert"
                    >
                      {phoneError}
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full bg-gradient-to-r from-indigo-600 via-purple-500 to-blue-600 hover:from-indigo-700 hover:via-purple-600 hover:to-blue-700 text-white text-xl font-semibold py-6 rounded-lg transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 transform hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:transform-none ring-2 ring-purple-500/20 hover:ring-purple-400/40"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {loading && (
                    <div className="mr-3">
                      <LoadingSpinner size="lg" />
                    </div>
                  )}
                  {loading ? "Sending code..." : "Join"}
                </span>
                {/* Gentle glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 rounded-lg blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-500 to-blue-600 rounded-lg blur opacity-20"></div>
              </button>
            </form>
          </div>

          {/* live.smpl Branding */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500 font-medium">live.smpl</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900 flex items-center justify-center px-6 relative overflow-hidden">
      {/* Sage floating background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-tr from-purple-500/10 to-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md mx-auto relative z-10">
        {/* SMPL Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-yellow-400">smpl</h1>
        </div>

        {/* Progress indicator */}
        <ProgressIndicator
          currentStep={2}
          totalSteps={2}
          steps={["Sign Up", "Get Started"]}
        />
        <div className="backdrop-blur-sm bg-slate-800/90 rounded-3xl p-8 shadow-2xl border border-indigo-900/40 ring-1 ring-purple-500/20">
          <div className="text-center mb-8">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full opacity-20 blur-lg"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
                <span className="text-3xl">🔑</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-200 via-purple-300 to-indigo-200 bg-clip-text text-transparent mb-3">
              Verify your phone
            </h1>

            <div className="bg-gradient-to-r from-indigo-950/60 to-slate-900/80 rounded-lg p-4 mb-2 border border-indigo-800/40 ring-1 ring-purple-600/20">
              <p className="text-indigo-100 font-semibold">
                Code sent to {formatPhoneDisplay(phoneNumber)}
              </p>
            </div>
            <p className="text-slate-300 text-base sm:text-lg">
              Enter the 6-digit code to continue
            </p>
          </div>

          {error && (
            <div
              className="mb-6 p-4 bg-red-900/50 backdrop-blur-sm border border-red-700/50 rounded-2xl text-red-200 shadow-lg"
              role="alert"
              aria-live="polite"
            >
              <div className="flex items-center">
                <span className="text-lg mr-2">⚠️</span>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleCodeSubmit} className="space-y-8">
            <div>
              <div className="relative">
                <input
                  ref={codeInputRef}
                  id="code"
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  className="w-full px-6 py-6 text-3xl font-mono text-white bg-slate-700/70 backdrop-blur-sm border-2 border-slate-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-400/20 focus:border-blue-400 transition-all duration-300 text-center tracking-[0.5em] placeholder-slate-400"
                  placeholder="000000"
                  maxLength={6}
                  aria-required="true"
                  disabled={loading}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-2xl pointer-events-none"></div>
              </div>

              {codeError && (
                <div className="mt-3 p-3 bg-red-900/30 border border-red-700/50 rounded-xl">
                  <p
                    className="text-sm text-red-300 font-medium text-center"
                    role="alert"
                  >
                    {codeError}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full bg-gradient-to-r from-indigo-600 via-purple-500 to-blue-600 hover:from-indigo-700 hover:via-purple-600 hover:to-blue-700 text-white text-xl font-semibold py-6 rounded-lg transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 transform hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:transform-none ring-2 ring-purple-500/20 hover:ring-purple-400/40"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {loading && (
                    <div className="mr-3">
                      <LoadingSpinner size="lg" />
                    </div>
                  )}
                  {loading ? "Verifying..." : "Verify"}
                </span>
                {/* Gentle glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 rounded-lg blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-500 to-blue-600 rounded-lg blur opacity-20"></div>
              </button>

              <div className="flex gap-3">
                {onBack && (
                  <button
                    type="button"
                    onClick={onBack}
                    disabled={loading}
                    className="flex-1 bg-slate-700/70 backdrop-blur-sm hover:bg-slate-700/90 text-slate-200 hover:text-white text-lg font-medium py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl border border-slate-600/40 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                  >
                    Back
                  </button>
                )}

                {onResendCode && (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={loading || resendCooldown > 0}
                    className="flex-1 bg-slate-700/70 backdrop-blur-sm hover:bg-slate-700/90 text-slate-200 hover:text-white text-lg font-medium py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl border border-slate-600/40 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                  >
                    {resendCooldown > 0
                      ? `Resend (${resendCooldown}s)`
                      : "Resend code"}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* live.smpl Branding */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 font-medium">live.smpl</p>
        </div>
      </div>
    </div>
  );
}

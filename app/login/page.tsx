"use client";

import { useState } from "react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/composio-link", {
        method: "POST",
      });
      const data = await response.json();
      
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black font-sans">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-ui-border text-center">
        <h1 className="text-3xl font-serif font-bold mb-6 text-tx-primary">Welcome to Open Gamma</h1>
        <p className="text-tx-secondary mb-8">Sign in to start creating presentations and documents with AI.</p>
        
        <button
          onClick={handleSignIn}
          disabled={isLoading}
          className="w-full py-3 px-4 bg-black text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span>Connecting...</span>
          ) : (
            <>
              <span>Sign in with Composio</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

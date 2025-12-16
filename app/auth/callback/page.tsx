"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { Loader } from "@/components/ui/loader";

export default function CallbackPage() {
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    const verifyLogin = async () => {
      try {
        const res = await fetch("/api/auth/composio-verify", { method: "POST" });
        const data = await res.json();

        if (data.userId) {
          await signIn("credentials", {
            userId: data.userId,
            callbackUrl: "/",
          });
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Verification failed", error);
        setStatus("error");
      }
    };

    verifyLogin();
  }, []);

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">Login Failed</h1>
          <p className="text-gray-600">Could not verify your authentication.</p>
          <a href="/login" className="text-blue-500 mt-4 block">
            Try Again
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Loader size="lg" />
      <p className="text-gray-500">Completing sign in...</p>
    </div>
  );
}

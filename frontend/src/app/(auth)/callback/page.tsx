"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";

const OAuthCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleOAuthResponse = () => {
      try {
        // Extract tokens from query parameters
        const token = searchParams.get("token");
        const refreshToken = searchParams.get("refresh_token");

        if (token && refreshToken) {
          // Store tokens in cookies
          Cookies.set("token", token, {
            expires: 1,
            secure: true,
            sameSite: "strict",
          }); // 1 day
          Cookies.set("refresh-token", refreshToken, {
            expires: 7,
            secure: true,
            sameSite: "strict",
          }); // 7 days

          // Redirect to the chat page
          router.push("/chat");
        } else {
          // Handle missing tokens
          alert("Authentication failed. Missing tokens.");
          router.push("/login");
        }
      } catch (error) {
        console.error("Error handling OAuth response:", error);
        alert("A network error occurred. Please try again.");
        router.push("/login");
      }
    };

    handleOAuthResponse();
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-500">Processing authentication...</p>
    </div>
  );
};

export default OAuthCallback;

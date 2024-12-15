"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const OAuthCallback = () => {
  const router = useRouter();

  useEffect(() => {
    const handleOAuthResponse = async () => {
      try {
        // Assume the backend sends the JSON tokens in the response body
        const response = await fetch(window.location.href, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.headers.get("x-access-token")) {
          console.log(response.headers.get("x-access-token"));
          const jwt = response.headers.get("x-access-token");
          const refresh = response.headers.get("x-refresh-token");

          if (!jwt || !refresh) {
            alert("Invalid response from authentication server.");
            //router.push("/login");
            return;
          }

          Cookies.set("token", jwt, { expires: 1 }); // 1 day expiration
          Cookies.set("refresh-token", refresh, { expires: 7 }); // 7 days expiration

          router.push("/chat");
        } else {
          // Handle non-JSON response
          alert("Invalid response from authentication server.");
          console.log(response);
          console.log(response.headers);
          //router.push("/login");
        }
      } catch (error) {
        console.error("Error handling OAuth response:", error);
        alert("A network error occurred. Please try again.");
        //router.push("/login");
      }
    };

    handleOAuthResponse();
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-500">Processing authentication...</p>
    </div>
  );
};

export default OAuthCallback;

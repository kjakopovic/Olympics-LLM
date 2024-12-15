"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

import * as images from "@/constants/images";
import * as icons from "@/constants/icons";
import LoadingButton from "@/components/LoadingButton";

function Login() {
  const router = useRouter();

  const [userCredentials, setUserCredentials] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState<boolean>(false);

  // Prevent scrolling when loading is true
  useEffect(() => {
    if (loading) {
      // Prevent scrolling
      document.body.style.overflow = "hidden";
    } else {
      // Enable scrolling
      document.body.style.overflow = "auto";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true); // Start loading

    const API_URL = process.env.NEXT_PUBLIC_USER_API_URL;

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userCredentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || "An error occurred. Please try again.");
        setLoading(false); // End loading
        return;
      }

      const data = await response.json();
      console.log(data);

      if (data.error) {
        alert(data.error);
        setLoading(false); // End loading
        return;
      }

      Cookies.set("token", data.token);
      Cookies.set("refresh-token", data.refresh_token);

      router.push("/chat");
    } catch (error: any) {
      console.error("Fetch Error:", error);
      alert("A network error occurred. Please try again.");
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleGoogleLogin = () => {
    setLoading(true); // Start loading

    const API_URL = process.env.NEXT_PUBLIC_USER_API_URL;

    window.location.href = `${API_URL}/login/third-party?type_of_service=google`;
  };

  return (
    <div className="w-full h-screen overflow-hidden flex flex-row">
      <div className="w-1/2 h-full bg-primary-100 flex flex-col justify-center items-center">
        <Image
          src={images.logo}
          alt="Logo"
          className="absolute top-5 left-5 h-14 w-14"
        />
        <div className="p-4 items-start justify-center flex flex-col w-3/4">
          <div className="flex flex-row items-center mb-7">
            <h1 className="text-3xl font-jakarta text-white font-bold flex-row">
              Welcome to{" "}
            </h1>
            <p className="ml-2 text-3xl font-jakarta text-transparent bg-clip-text bg-gradient-to-tr from-gradientGreen-100 to-gradientGreen-200 font-bold">
              {" "}
              Olympus!
            </p>
          </div>
          <h2 className="text-lg font-jakarta text-primary-400 font-medium mb-7">
            Login to satisfy all your Olympic data needs!
          </h2>
          <form className="w-full flex flex-col mt-8">
            <input
              type="text"
              onChange={(e) => {
                setUserCredentials({
                  ...userCredentials,
                  email: e.target.value,
                });
              }}
              placeholder="Username"
              className="border text-white border-primary-500 focus:border-accent focus:outline-none focus:shadow-md shadow-accent/70 bg-primary-200 p-2 rounded-md"
              disabled={loading}
            />
            <input
              type="password"
              onChange={(e) => {
                setUserCredentials({
                  ...userCredentials,
                  password: e.target.value,
                });
              }}
              placeholder="Password"
              className="border text-white border-primary-500 focus:border-accent focus:outline-none focus:shadow-md shadow-accent/70 bg-primary-200 p-2 rounded-md mt-4"
              disabled={loading}
            />
            <div className="flex flex-row justify-between items-center mt-4">
              <div className="flex flex-row items-center justify-center gap-x-2">
                <input
                  type="checkbox"
                  className="w-6 h-6 rounded-md bg-primary-200 appearance-none checked:bg-primary-200 checked:content-['✔'] checked:text-white checked:border-transparent border border-primary-500"
                  disabled={loading}
                />
                <p className="text-white">Remember me</p>
              </div>
              <a
                href="#"
                className="text-transparent bg-clip-text bg-gradient-to-tr from-gradientGreen-100 to-gradientGreen-200"
              >
                Forgot Password?
              </a>
            </div>
            <LoadingButton
              onClick={handleSubmit}
              isLoading={loading}
              loadingText="Logging in..."
              className="bg-accent font-jakarta font-semibold text-base text-secondary-100 p-2 rounded-md mt-4"
            >
              Log in
            </LoadingButton>
          </form>
          <div className="flex flex-row justify-center items-center mt-8 w-full">
            <div className="h-0.5 w-[38%] bg-primary-400"></div>
            <p className="text-primary-400 text-xs mx-2">or continue with</p>
            <div className="h-0.5 w-[38%] bg-primary-400"></div>
          </div>
          <LoadingButton
            onClick={handleGoogleLogin}
            isLoading={loading}
            loadingText="Authenticating..."
            className="bg-primary-200 w-full font-jakarta font-semibold text-base text-primary-400 p-2 rounded-md mt-8"
          >
            <div className="flex flex-row justify-center items-center gap-x-2">
              <Image src={icons.google} alt="Google" className="w-5 h-5" />
              Continue with Google
            </div>
          </LoadingButton>
          <div className="absolute bottom-5 left-5 flex flex-row items-center gap-x-2">
            <p className="text-primary-400 text-xs">Don't have an account?</p>
            <a
              href="/register"
              className="text-transparent bg-clip-text bg-gradient-to-tr from-gradientGreen-100 to-gradientGreen-200"
            >
              Sign up
            </a>
          </div>
        </div>
      </div>
      <div className="w-1/2 h-full bg-blue-500 flex flex-col justify-center items-center">
        <Image src={images.login} alt="Login" />
      </div>
    </div>
  );
}

export default Login;

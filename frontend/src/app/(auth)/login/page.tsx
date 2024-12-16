"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema } from "@/schemas/authSchemas";
import LoadingButton from "@/components/LoadingButton";
import * as icons from "@/constants/icons";
import * as images from "@/constants/images";

// Infer the TypeScript type from the Zod schema
type LoginFormInputs = z.infer<typeof loginSchema>;

function Login() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  // Optional: Password Visibility Toggle
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_USER_API_URL;

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || "An error occurred. Please try again.");
        return;
      }

      const responseData = await response.json();
      console.log(responseData);

      if (responseData.error) {
        alert(responseData.error);
        return;
      }

      // Store tokens in cookies with security attributes
      Cookies.set("token", responseData.token, {
        expires: 1,
        secure: true,
        sameSite: "strict",
      }); // 1 day
      Cookies.set("refresh-token", responseData.refresh_token, {
        expires: 7,
        secure: true,
        sameSite: "strict",
      }); // 7 days

      // Redirect to the chat page
      router.push("/chat");
    } catch (error) {
      console.error("Login Error:", error);
      alert("A network error occurred. Please try again.");
    }
  };

  const handleGoogleLogin = () => {
    // Redirect the user to the Google OAuth endpoint
    const API_URL = process.env.NEXT_PUBLIC_USER_API_URL;
    window.location.href = `${API_URL}/login/third-party?type_of_service=google`;
  };

  // Prevent scrolling when loading is true
  useEffect(() => {
    if (isSubmitting) {
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
  }, [isSubmitting]);

  return (
    <div className="w-full h-screen overflow-hidden flex flex-row">
      <div className="w-1/2 h-full bg-primary-100 flex flex-col justify-center items-center">
        {/* Logo */}
        <Image
          src={images.logo}
          alt="Logo"
          className="absolute top-5 left-5 h-14 w-14"
        />

        {/* Content */}
        <div className="p-4 items-start justify-center flex flex-col w-3/4">
          {/* Welcome Messages */}
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

          {/* Login Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full flex flex-col mt-8 space-y-4"
          >
            {/* Email Field */}
            <div className="flex flex-col">
              <label className="text-primary-400 text-sm font-jakarta font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                {...register("email")}
                placeholder="Email"
                className={`border text-white border-primary-500 focus:border-accent focus:outline-none focus:shadow-md shadow-accent/70 bg-primary-200 p-2 rounded-md ${
                  errors.email ? "border-red-500" : ""
                }`}
                disabled={isSubmitting}
              />
              {errors.email && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Password Field with Visibility Toggle */}
            <div className="flex flex-col">
              <label className="text-primary-400 text-sm font-jakarta font-medium mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Password"
                  className={`border w-full text-white border-primary-500 focus:border-accent focus:outline-none focus:shadow-md shadow-accent/70 bg-primary-200 p-2 pr-10 rounded-md ${
                    errors.password ? "border-red-500" : ""
                  }`}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-50 right-2 top-2 text-gray-500"
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex flex-row justify-between items-center mt-4">
              <div className="flex flex-row items-center justify-center gap-x-2">
                <input
                  type="checkbox"
                  {...register("remember_me")}
                  className="w-6 h-6 rounded-md bg-primary-200 appearance-none checked:bg-primary-200 checked:content-['✔'] checked:text-white checked:border-transparent border border-primary-500"
                  disabled={isSubmitting}
                />
                <p className="text-white">Remember me</p>
              </div>
              <Link
                href="#"
                className="text-transparent bg-clip-text bg-gradient-to-tr from-gradientGreen-100 to-gradientGreen-200 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <LoadingButton
              type="submit"
              isLoading={isSubmitting}
              loadingText="Logging in..."
              className="bg-accent font-jakarta font-semibold text-base text-secondary-100 p-2 rounded-md mt-4 hover:bg-accent-dark transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              Log in
            </LoadingButton>
          </form>

          {/* Divider */}
          <div className="flex flex-row justify-center items-center mt-8 w-full">
            <div className="h-0.5 w-[38%] bg-primary-400"></div>
            <p className="text-primary-400 text-xs mx-2">or continue with</p>
            <div className="h-0.5 w-[38%] bg-primary-400"></div>
          </div>

          {/* Google Login */}
          <LoadingButton
            onClick={handleGoogleLogin}
            isLoading={isSubmitting}
            loadingText="Authenticating..."
            className="bg-primary-200 w-full font-jakarta font-semibold text-base text-primary-400 p-2 rounded-md mt-8 flex justify-center items-center hover:bg-primary-200/80 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            <div className="flex flex-row justify-center items-center gap-x-2">
              <Image src={icons.google} alt="Google" className="w-5 h-5" />
              Continue with Google
            </div>
          </LoadingButton>

          {/* Footer Links */}
          <div className="absolute bottom-5 left-5 flex flex-row items-center gap-x-2">
            <p className="text-primary-400 text-xs">Don't have an account?</p>
            <Link
              href="/register"
              className="text-transparent bg-clip-text bg-gradient-to-tr from-gradientGreen-100 to-gradientGreen-200 hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side Image */}
      <div className="w-1/2 h-full bg-blue-500 flex flex-col justify-center items-center">
        <Image src={images.login} alt="Login" />
      </div>
    </div>
  );
}

export default Login;

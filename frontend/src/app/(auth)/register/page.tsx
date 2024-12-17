"use client";

import Image from "next/image";
import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/schemas/authSchemas";
import { z } from "zod";
import { useRouter } from "next/navigation";

import * as images from "@/constants/images";

type RegisterFormInputs = z.infer<typeof registerSchema>;

function Register() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_USER_API_URL;

      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          first_name: data.first_name,
          last_name: data.last_name,
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

      // Optionally, you can set tokens here if the backend returns them
      // For example:
      // Cookies.set("token", responseData.token, { expires: 1, secure: true, sameSite: "strict" });
      // Cookies.set("refresh-token", responseData.refresh_token, { expires: 7, secure: true, sameSite: "strict" });

      alert("Registration successful! Please log in.");
      router.push("/login");
    } catch (error) {
      console.error("Registration Error:", error);
      alert("A network error occurred. Please try again.");
    }
  };

  return (
    <div className="w-full h-screen flex flex-row bg-primary-100">
      <div className="w-3/4 p-4 flex flex-col justify-between items-center">
        {/* Header */}
        <div className="flex justify-between items-center flex-row w-full">
          <Image src={images.logo} alt="Logo" className="w-14 h-14" />
          <Link
            href="/login"
            className="text-transparent text-base font-jakarta font-semibold bg-clip-text bg-gradient-to-tr from-gradientGreen-100 to-gradientGreen-200"
          >
            Log in
          </Link>
        </div>

        {/* Registration Form */}
        <div className="flex flex-col items-center justify-center w-3/4">
          <h1 className="text-white text-4xl font-jakarta font-normal text-center">
            Register for Olympus: Your Olympic Prediction Companion
          </h1>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col items-center justify-center w-full mt-5 space-y-4"
          >
            {/* First and Last Name */}
            <div className="flex flex-row items-center justify-between w-full gap-x-4">
              {/* First Name */}
              <div className="flex flex-col items-start justify-center w-3/4">
                <label className="text-primary-400 text-sm font-jakarta font-medium mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  {...register("first_name")}
                  placeholder="First Name"
                  className={`w-full border text-white border-primary-500 focus:border-accent focus:outline-none focus:shadow-md shadow-accent/70 bg-primary-200 p-2 rounded-md ${
                    errors.first_name ? "border-red-500" : ""
                  }`}
                  disabled={isSubmitting}
                />
                {errors.first_name && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.first_name.message}
                  </span>
                )}
              </div>

              {/* Last Name */}
              <div className="flex flex-col items-start justify-center w-3/4">
                <label className="text-primary-400 text-sm font-jakarta font-medium mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  {...register("last_name")}
                  placeholder="Last Name"
                  className={`w-full border text-white border-primary-500 focus:border-accent focus:outline-none focus:shadow-md shadow-accent/70 bg-primary-200 p-2 rounded-md ${
                    errors.last_name ? "border-red-500" : ""
                  }`}
                  disabled={isSubmitting}
                />
                {errors.last_name && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.last_name.message}
                  </span>
                )}
              </div>
            </div>

            {/* Email and Password */}
            <div className="flex flex-row items-center justify-between w-full gap-x-4">
              {/* Email */}
              <div className="flex flex-col items-start justify-center w-3/4">
                <label className="text-primary-400 text-sm font-jakarta font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  {...register("email")}
                  placeholder="Email"
                  className={`w-full border text-white border-primary-500 focus:border-accent focus:outline-none focus:shadow-md shadow-accent/70 bg-primary-200 p-2 rounded-md ${
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

              {/* Password */}
              <div className="flex flex-col items-start justify-center w-3/4">
                <label className="text-primary-400 text-sm font-jakarta font-medium mb-1">
                  Password
                </label>
                <input
                  type="password"
                  {...register("password")}
                  placeholder="Password"
                  className={`w-full border text-white border-primary-500 focus:border-accent focus:outline-none focus:shadow-md shadow-accent/70 bg-primary-200 p-2 rounded-md ${
                    errors.password ? "border-red-500" : ""
                  }`}
                  disabled={isSubmitting}
                />
                {errors.password && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.password.message}
                  </span>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex flex-row items-center w-full justify-start gap-x-2 mt-4">
              <input
                type="checkbox"
                {...register("terms")}
                className={`w-5 h-5 text-primary-500 border-primary-500 rounded ${
                  errors.terms ? "border-red-500" : ""
                }`}
                disabled={isSubmitting}
              />
              <div className="flex flex-row items-center justify-start">
                <p className="text-white">I agree to the </p>
                <Link
                  href="/terms"
                  className="ml-1 text-transparent bg-clip-text bg-gradient-to-r from-gradientGreen-100 to-gradientGreen-200 hover:underline"
                >
                  terms and conditions
                </Link>
              </div>
            </div>
            {errors.terms && (
              <span className="text-red-500 text-xs mt-1 w-full">
                {errors.terms.message}
              </span>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-accent font-jakarta font-semibold text-base text-secondary-100 p-2 rounded-md mt-6 hover:bg-accent-dark transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Account..." : "Create your account"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="flex flex-row items-center justify-between w-full">
          <p className="text-primary-400 text-sm font-jakarta font-medium">
            ©2024 Olympus
          </p>
          <Link
            href="/privacy"
            className="text-primary-400 text-sm font-jakarta font-medium hover:underline"
          >
            Privacy Policy
          </Link>
        </div>
      </div>

      {/* Right Side Image */}
      <div className="w-1/4">
        <Image
          src={images.register}
          alt="Register"
          className="h-screen object-cover"
        />
      </div>
    </div>
  );
}

export default Register;

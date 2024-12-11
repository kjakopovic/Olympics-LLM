"use client";

import Image from "next/image";
import React from "react";

import * as images from "@/constants/images";
import * as icons from "@/constants/icons";
import { useRouter } from "next/navigation";

function Login() {
  const router = useRouter();

  const handleGoogleLogin = () => {
    console.log("Google Login");
    router.push("/chat");
  };

  return (
    <div className="w-full h-screen flex flex-row">
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
              placeholder="Username"
              className="border border-primary-500 focus:border-accent focus:outline-none focus:shadow-md shadow-accent/70 bg-primary-200 p-2 rounded-md"
            />
            <input
              type="password"
              placeholder="Password"
              className="border border-primary-500 focus:border-accent focus:outline-none focus:shadow-md shadow-accent/70 bg-primary-200 p-2 rounded-md mt-4"
            />
            <div className="flex flex-row justify-between items-center mt-4">
              <div className="flex flex-row items-center justify-center gap-x-2">
                <input
                  type="checkbox"
                  className="w-6 h-6 rounded-md bg-primary-200 appearance-none checked:bg-primary-200 checked:content-['✔'] checked:text-white checked:border-transparent border border-primary-500"
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
            <button className="bg-accent font-jakarta font-semibold text-base text-secondary-100 p-2 rounded-md mt-4">
              Log in
            </button>
          </form>
          <div className="flex flex-row justify-center items-center mt-8 w-full">
            <div className="h-0.5 w-[38%] bg-primary-400"></div>
            <p className="text-primary-400 text-xs mx-2">or continue with</p>
            <div className="h-0.5 w-[38%] bg-primary-400"></div>
          </div>
          <button
            onClick={handleGoogleLogin}
            className="bg-primary-200 w-full font-jakarta font-semibold text-base text-primary-400 p-2 rounded-md mt-8"
          >
            <div className="flex flex-row justify-center items-center gap-x-2">
              <Image src={icons.google} alt="Google" className="w-5 h-5" />
              Continue with Google
            </div>
          </button>
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

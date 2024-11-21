"use client";

import Image from "next/image";
import React from "react";

import * as images from "@/constants/images";
import Link from "next/link";
import { useRouter } from "next/navigation";

function Register() {
  const router = useRouter();
  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log("Submitted");
    router.push("/chat");
  };

  return (
    <div className="w-full h-screen flex flex-row bg-primary-100">
      <div className="w-3/4 p-4 flex flex-col justify-between items-center">
        <div className="flex justify-between items-center flex-row w-full">
          <Image src={images.logo} alt="Logo" className="w-20 h-20" />
          <Link
            href="/login"
            className="text-transparent text-base font-jakarta font-semibold bg-clip-text bg-gradient-to-tr from-gradientGreen-100 to-gradientGreen-200"
          >
            Log in
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center w-3/4">
          <h1 className="text-white text-4xl font-jakarta font-normal">
            Register for Olympus: Your Olympic Prediction Companion
          </h1>
          <form className="flex flex-col items-center justify-center w-full mt-5">
            <div className="flex flex-row items-center justify-between w-full gap-x-4">
              <div className="flex flex-col items-start justify-center w-3/4 mt-5">
                <label className="text-primary-400 text-sm font-jakarta font-medium mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="First Name"
                  className="w-full border border-primary-500 focus:border-accent focus:outline-none focus:shadow-md shadow-accent/70 bg-primary-200 p-2 rounded-md"
                />
              </div>
              <div className="flex flex-col items-start justify-center w-3/4 mt-5">
                <label className="text-primary-400 text-sm font-jakarta font-medium mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Last Name"
                  className="w-full border border-primary-500 focus:border-accent focus:outline-none focus:shadow-md shadow-accent/70 bg-primary-200 p-2 rounded-md"
                />
              </div>
            </div>
            <div className="flex flex-row items-center justify-between w-full gap-x-4">
              <div className="flex flex-col items-start justify-center w-3/4 mt-5">
                <label className="text-primary-400 text-sm font-jakarta font-medium mb-2">
                  Email
                </label>
                <input
                  type="text"
                  placeholder="Email"
                  className="w-full border border-primary-500 focus:border-accent focus:outline-none focus:shadow-md shadow-accent/70 bg-primary-200 p-2 rounded-md"
                />
              </div>
              <div className="flex flex-col items-start justify-center w-3/4 mt-5">
                <label className="text-primary-400 text-sm font-jakarta font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full border border-primary-500 focus:border-accent focus:outline-none focus:shadow-md shadow-accent/70 bg-primary-200 p-2 rounded-md"
                />
              </div>
            </div>
            <div className="flex flex-row items-center w-full justify-start gap-x-2 mt-4">
              <input
                type="checkbox"
                className="w-6 h-6 rounded-md bg-primary-200 appearance-none checked:bg-primary-200 checked:content-['✔'] checked:text-white checked:border-transparent border border-primary-500"
              />
              <div className="flex flex-row items-center justify-start">
                <p className="text-white">I agree to the </p>
                <p className="ml-1 text-transparent bg-clip-text bg-gradient-to-r from-gradientGreen-100 to-gradientGreen-200">
                  terms and conditions
                </p>
              </div>
            </div>
            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full bg-accent font-jakarta font-semibold text-base text-secondary-100 p-2 rounded-md mt-6"
            >
              Create your account
            </button>
          </form>
        </div>
        <div className="flex flex-row items-center justify-between w-full">
          <p className="text-primary-400 text-sm font-jakarta font-medium">
            {" "}
            ©2024 Olympus
          </p>
          <p className="text-primary-400 text-sm font-jakarta font-medium">
            Privacy Policy
          </p>
        </div>
      </div>
      <div className="w-1/4">
        <Image src={images.register} alt="Register" className="h-screen" />
      </div>
    </div>
  );
}

export default Register;

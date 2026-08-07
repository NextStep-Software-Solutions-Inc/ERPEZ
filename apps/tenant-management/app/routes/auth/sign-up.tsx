import { SignUp } from "@clerk/react-router";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/sign-up";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Sign Up" },
    { name: "description", content: "Welcome to the Sign Up page!" },
  ];
}

export default function SignUpPage() {
  return (
    <div className="flex h-screen w-full">

      {/* Left side illustration (hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center items-center bg-gradient-to-b from-blue-500 to-green-400 text-white p-10">
        <h1 className="text-4xl font-bold mb-4 leading-tight">
          Enterprise <br /> Resource Planning <br />
          <span className="text-blue-200">Made Simple</span>
        </h1>
        <img
          src="/image/SignUp.png"
          alt="ERP Illustration"
          className="max-w-md"
        />
      </div>

      {/* Right side form */}
      <div className="relative flex w-full lg:w-1/2 items-center justify-center p-6">
        <Link
          to="/"
          className="absolute top-4 left-4 lg:left-auto lg:right-4 flex items-center text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back
        </Link>
        <div className="w-full max-w-md">
          <SignUp routing="hash" />
        </div>
      </div>
    </div>
  );
}

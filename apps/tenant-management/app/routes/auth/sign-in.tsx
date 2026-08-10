import { SignIn } from "@clerk/react-router";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/sign-in";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Sign In" },
    { name: "description", content: "Welcome to the Sign In page!" },
  ];
}

export default function SignInPage() {
  return (
    <div className="flex h-screen w-full">
      {/* Sign In Form Section */}
      <div className="relative flex w-full lg:w-1/2 items-center justify-center p-6">

        {/* Back button (Mobile only) */}
        <Link
          to="/"
          className="absolute top-4 left-4 flex items-center text-gray-600 hover:text-gray-800 lg:hidden"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back
        </Link>

        <div className="w-full max-w-md">
          <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
        </div>
      </div>

      {/* Illustration Section */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center items-center bg-gradient-to-b from-blue-500 to-green-400 text-white p-10 relative">
        {/* Back button (Desktop only) */}
        <Link
          to="/"
          className="absolute top-4 right-4 flex items-center text-white hover:text-white/80"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back
        </Link>

        <h1 className="text-4xl font-bold mb-4 leading-tight">
          Enterprise <br /> Resource Planning <br />
          <span className="text-blue-200">Made Simple</span>
        </h1>
        <img
          src="/image/SignIn.png"
          alt="ERP Illustration"
          className="max-w-md"
        />
      </div>
    </div>
  );
}

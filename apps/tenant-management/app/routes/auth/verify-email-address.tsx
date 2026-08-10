import { useSignUp, useSignIn, useClerk, useAuth } from "@clerk/react-router";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

export function meta() {
    return [
        { title: "Verify Email Address" },
        { name: "description", content: "Enter the verification code sent to your email." },
    ];
}

export default function VerifyEmailAddressPage() {
    const { signUp } = useSignUp();
    const { signIn } = useSignIn();
    const { setActive } = useClerk();
    const { isSignedIn } = useAuth();
    const navigate = useNavigate();
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        // Check if user is already verified or signed in
        if (isSignedIn || signUp?.status === 'complete' || signIn?.status === 'complete') {
            navigate('/overview');
        }
    }, [isSignedIn, signUp?.status, signIn?.status, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const trimmedCode = code.trim();
        if (trimmedCode.length !== 6 || !/^\d{6}$/.test(trimmedCode)) {
            setError("Please enter a valid 6-digit verification code.");
            setIsLoading(false);
            return;
        }

        try {
            // Try to verify with sign-up first
            if (signUp) {
                const result = await signUp.attemptEmailAddressVerification({
                    code: trimmedCode,
                });

                if (result.status === 'complete') {
                    if (result.createdSessionId) {
                        await setActive({ session: result.createdSessionId });
                    }
                    navigate('/overview');
                } else {
                    setError("Invalid verification code. Please check the code and try again.");
                }
            } else {
                setError("No active sign-up session found. Please start the sign-up process again.");
            }
        } catch (err: any) {
            console.error('Verification error:', err);
            const errorMessage = err.errors?.[0]?.message || err.message || "Verification failed. Please try again.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        try {
            setIsLoading(true);
            if (signUp) {
                await signUp.prepareEmailAddressVerification();
                alert("Verification code sent! Please check your email.");
            } else {
                alert("Please restart the sign-up process to receive a new code.");
            }
        } catch (err: any) {
            console.error('Resend error:', err);
            setError("Failed to resend code. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

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

            {/* Right side verification form */}
            <div className="relative flex w-full lg:w-1/2 items-center justify-center p-6">
                <Link
                    to="/sign-up"
                    className="absolute top-4 left-4 lg:left-auto lg:right-4 flex items-center text-gray-500 hover:text-gray-700"
                >
                    ← Back to Sign Up
                </Link>
                <div className="w-full max-w-md">
                    <div className="mb-8 text-center">
                        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Verify your email
                        </h1>
                        <p className="text-gray-600 mb-6">
                            We've sent a verification code to your email address. Enter it below to complete your account setup.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="code" className="text-sm font-medium">
                                Verification Code
                            </Label>
                            <Input
                                id="code"
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Enter 6-digit code"
                                className="mt-1"
                                required
                                maxLength={6}
                            />
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            disabled={isLoading || code.length < 6}
                        >
                            {isLoading ? "Verifying..." : "Verify Email"}
                        </Button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleResendCode}
                                disabled={isLoading}
                                className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                            >
                                Didn't receive the code? Resend
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
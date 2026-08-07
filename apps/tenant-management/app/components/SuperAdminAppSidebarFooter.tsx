import React from "react";
import { Link } from "react-router";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/react-router";

/**
 * SidebarFooter
 * - Shows avatar, primary email and a short ID
 * - Click the row to go to /account (adjust as needed)
 */
export default function SuperAdminAppSidebarFooter({ className = "" }: { className?: string }) {
    const { user } = useUser();


    return (
        <div className={`w-full ${className}`}>
            <SignedIn>
                <div className="group flex items-center gap-3 px-3 py-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                    <UserButton
                        appearance={{
                            elements: {
                                rootBox: "flex items-center gap-3 w-full",
                                userButtonBox: "flex items-center gap-3",
                                avatarBox:
                                    "h-10 w-10 rounded-full border border-gray-300 shadow-sm transition-transform group-hover:scale-105",
                                userButtonOuterIdentifier: "text-sm font-medium text-gray-900 dark:text-white",
                                userButtonOuterIdentifierSecondary: "text-xs text-gray-500 truncate",
                            },
                        }}
                        showName={true}
                    />

                </div>
            </SignedIn>
        </div>
    );
}
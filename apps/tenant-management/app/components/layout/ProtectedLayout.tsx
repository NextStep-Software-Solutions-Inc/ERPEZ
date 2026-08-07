import { SignedIn, SignedOut } from "@clerk/react-router";
import { Navigate, Outlet } from "react-router";

export default function ProtectedLayout() {
    return (
        <>
            <SignedIn>
                <Outlet />
            </SignedIn>
            <SignedOut>
                <Navigate to="/sign-in" replace />
            </SignedOut>
        </>
    );
}

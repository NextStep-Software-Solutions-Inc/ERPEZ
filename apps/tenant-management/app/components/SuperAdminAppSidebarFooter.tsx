import React from "react";
import { UserMenu } from "~/components/navbar/UserMenu";

export default function SuperAdminAppSidebarFooter({ className = "" }: { className?: string }) {
    return (
        <div className={`w-full p-2 ${className}`}>
            <UserMenu showDetails={true} className="w-full" />
        </div>
    );
}
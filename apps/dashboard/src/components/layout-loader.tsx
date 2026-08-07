import { Loader2 } from "lucide-react";
import { SiteLogo } from "~/components/svg";

const LayoutLoader = () => {
    return (
        <div className="h-screen flex items-center justify-center flex-col space-y-2">
            <SiteLogo className="h-10 w-10 text-primary" />
            <span className="inline-flex gap-1 items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
            </span>
        </div>
    );
};

export default LayoutLoader;

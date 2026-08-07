import { useLocation } from "react-router";
import { BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb";

export default function BreadcrumbItems({ items }: { items: string[] }) {

    const location = useLocation();
    const breadcrumbs = generateBreadcrumbs(location.pathname);
    return (
        <>
            {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center">
                    {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                    <BreadcrumbItem className="hidden md:block">
                        {index === breadcrumbs.length - 1 ? (
                            <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                        ) : (
                            <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                        )}
                    </BreadcrumbItem>
                </div>
            ))}
        </>
    )
}

function generateBreadcrumbs(pathname: string) {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const label = segment.charAt(0).toUpperCase() + segment.slice(1);
        return { label, href };
    });
    return breadcrumbs;
}

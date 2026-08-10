
import { Card, CardContent } from "~/components/ui/card"
import { User, ClipboardList, ShoppingCart, Boxes } from "lucide-react"
import { createQueryHookFromTemplate } from "erpez-shared-lib"
import { getTenantsRequest } from "~/features/tenant/handlers/getTenantsRequest"

const modules = [
    {
        title: "Account Management System",
        description:
            "Manage tenants, users, roles/permissions, offices, departments, suppliers, and regions. Enable single sign-on (SSO), role-based access control, automated notifications, and audit logging across the entire suite.",
        icon: <User className="h-6 w-6 text-blue-500" />,
    },
    {
        title: "Planning and Commitment",
        description:
            "Handle core functions of performance and strategic planning. Identify and align performance goals, develop success indicators and rating scales, and accomplish commitment forms for unified organizational objectives.",
        icon: <ClipboardList className="h-6 w-6 text-indigo-500" />,
    },
    {
        title: "Procurement Management System",
        description:
            "Manage the entire purchasing process from requesting quotes and placing orders to tracking deliveries and processing invoices. Streamline procurement, ensure cost-effectiveness, and maintain strong supplier relationships.",
        icon: <ShoppingCart className="h-6 w-6 text-emerald-500" />,
    },
    {
        title: "Supply and Assets Management System",
        description:
            "Comprehensive system to track, monitor, and manage both physical and digital assets throughout their entire lifecycle. Handle physical flow of supplies, manage inventory levels, and oversee maintenance, usage, and disposal.",
        icon: <Boxes className="h-6 w-6 text-sky-500" />,
    },
]

const useTenants = createQueryHookFromTemplate(getTenantsRequest);
export const ModulesSection = () => {

    return (
        <section className="w-full py-20 max-w-6xl mx-auto" id="feature">
            <div className="container mx-auto px-6 text-center">
                <h2 className="max-w-[1190px] mx-auto text-[42px] leading-[70px] font-bold text-black text-center">
                    Four Core Modules, One Integrated Platform
                </h2>
                <p className="max-w-3xl mx-auto text-slate-600 mb-12 text-lg leading-6 font-normal text-center tracking-[0.2px]">
                    ERP EZ integrates your critical business functions into a single, unified platform
                    with shared database for streamlined operations and optimal performance.
                </p>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
                    {modules.map((mod, index) => (
                        <Card key={index} className="rounded-xl shadow-md hover:shadow-lg transition bg-white/90 backdrop-blur-md border border-white/10">
                            <CardContent className="justify-center items-center flex flex-col gap-8 p-8 w-full h-full">
                                <div className="flex flex-col items-start justify-center w-full">
                                    <div className="mr-4 flex flex-row justify-center items-center gap-4 sm:gap-6  ">
                                        <div className="flex-shrink-0 w-[50px] h-[50px] rounded-lg bg-gradient-to-br from-[#2563EB]/30 to-[#10B981]/30 flex items-center justify-center">
                                            {mod.icon}
                                        </div>
                                        <h3 className="font-semibold text-lg flex justify-center items-center" >{mod.title}</h3>
                                    </div>
                                </div>
                                <div className="text-left max-w-xl w-full px-6 sm:px-4">
                                    <p className="text-md text-slate-600">{mod.description}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default ModulesSection

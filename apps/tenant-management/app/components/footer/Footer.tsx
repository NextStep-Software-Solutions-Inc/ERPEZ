

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 ">
            <div className="max-w-7xl mx-auto px-6 lg:px-20 py-12 flex flex-col lg:flex-row gap-12">
                <div className="lg:basis-[35%] flex flex-col items-center lg:items-start text-center lg:text-left">
                    <div className="flex justify-center lg:justify-start items-center gap-2 mb-4">
                        <span className="flex items-center gap-2">
                            <img src="/image/navbar_footer.png" alt="ERP EZ" width={124} height={52} /> 
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 max-w-xs mx-auto lg:mx-0">
                        Comprehensive ERP solution built for modern organizations that demand
                        efficiency, security, and reliability.
                    </p>
                </div>
                <div className="lg:basis-[65%] grid grid-cols-3 gap-8 text-center lg:text-left justify-items-center lg:justify-items-start">
                    <div>
                        <h4 className="font-semibold mb-4">Platform</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><a href="#feature" className="hover:text-gray-900 transition-colors">Modules & Features</a></li>
                            <li><a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing & Plans</a></li>
                            <li><a href="#mission" className="hover:text-gray-900 transition-colors">Mission & Vision</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Support</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><a href="#faq" className="hover:text-gray-900 transition-colors">FAQs</a></li>
                            <li><a href="#contact" className="hover:text-gray-900 transition-colors">Contact & Inquiries</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Workspace</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><a href="/sign-in" className="hover:text-gray-900 transition-colors">Sign In</a></li>
                            <li><a href="/sign-up" className="hover:text-gray-900 transition-colors">Create Account</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="border-t border-gray-200 max-w-6xl mx-auto ">
                <div className="px-16 lg:px-10 py-6 flex flex-col md:flex-row items-center justify-center text-sm text-gray-600 gap-4 md:justify-between">
                    <p className="text-center">© {new Date().getFullYear()} ERP EZ. All rights reserved.</p>
                    <p className="text-xs text-gray-500 text-center">Enterprise Resource Planning & Workspace Management</p>
                </div>
            </div>
        </footer>
    )
}

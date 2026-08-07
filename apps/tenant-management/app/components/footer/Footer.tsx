

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 ">
            <div className="max-w-7xl mx-auto px-6 lg:px-20 py-12 flex flex-col lg:flex-row gap-12">
                <div className="lg:basis-[30%] flex flex-col items-center lg:items-start text-center lg:text-left">
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
                <div className="lg:basis-[70%] grid grid-cols-3 gap-8 text-center lg:text-left justify-items-center lg:justify-items-start">
                    <div>
                        <h4 className="font-semibold mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><a href="#">Features</a></li>
                            <li><a href="#">Pricing</a></li>
                            <li><a href="#">Integrations</a></li>
                            <li><a href="#">Solutions</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><a href="#">About</a></li>
                            <li><a href="#">Careers</a></li>
                            <li><a href="#">Blog</a></li>
                            <li><a href="#">Contacts</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Resources</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><a href="#">Documentation</a></li>
                            <li><a href="#">Help Center</a></li>
                            <li><a href="#">Community</a></li>
                            <li><a href="#">Status</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="border-t border-gray-200 max-w-6xl mx-auto ">
                <div className="px-16 lg:px-10 py-6 flex flex-col md:flex-row items-center justify-center text-sm text-gray-600 gap-16 md:justify-between">
                    <p className="text-center">© 2025 ERP EZ. All rights reserved.</p>
                    <div className="flex flex-col sm:flex-row sm:justify-center sm:items-center text-center gap-6">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Services</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

import { Mail, MapPin, Send } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"

export default function ContactSection() {
    return (
        <section className="py-20 px-6 lg:px-20 bg-gradient-to-r from-[#F9FAFB] to-[#F3F4F6]" id="contact">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-full flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            Stay Updated
                        </span>
                    </div>
                    <h2 className="text-3xl font-bold mb-3">Contact Us</h2>
                    <p className="text-gray-600 mb-6">
                        Join thousands of organizations already using ERP EZ to streamline their
                        operations. Get the latest updates, insights, and exclusive offers delivered
                        to your inbox.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Input
                            type="email"
                            placeholder="Enter your Email"
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <Send className="w-4 h-4" /> Subscribe
                        </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                        By subscribing, you agree to our Privacy Policy and consent to receive
                        updates from our company.
                    </p>
                </div>
                <div className="bg-white z-1 shadow-lg rounded-xl p-8">
                    <h3 className="text-xl font-semibold mb-4">Get in Touch</h3>
                    <p className="text-gray-600 mb-6">
                        Ready to see ERP EZ in action? Our team is here to help you get started.
                    </p>
                    <ul className="space-y-5 mb-6">
                        <li className="flex items-start gap-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg shrink-0 mt-0.5">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900 mb-1.5">Email Us</p>
                                <div className="space-y-1.5 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-gray-400 w-16 shrink-0">Connect:</span>
                                        <a
                                            href="mailto:connect@nextstep-software.com"
                                            className="text-gray-700 hover:text-blue-600 font-medium transition-colors break-all sm:break-normal"
                                        >
                                            connect@nextstep-software.com
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-gray-400 w-16 shrink-0">Support:</span>
                                        <a
                                            href="mailto:erpez@nextstep-software.com"
                                            className="text-gray-700 hover:text-blue-600 font-medium transition-colors break-all sm:break-normal"
                                        >
                                            erpez@nextstep-software.com
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-gray-400 w-16 shrink-0">Sales:</span>
                                        <a
                                            href="mailto:sales@nextstep-software.com"
                                            className="text-gray-700 hover:text-blue-600 font-medium transition-colors break-all sm:break-normal"
                                        >
                                            sales@nextstep-software.com
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-medium">Visit Us</p>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Door #5, Cuerquis Apartment San Miguel Street Camaman-an, Cagayan de Oro, Philippines, 9000
                                </p>
                            </div>
                        </li>
                    </ul>

                    <Button className="w-full bg-blue-600 text-white py-3 hover:bg-blue-700">
                        Schedule a Demo →
                    </Button>
                </div>
            </div>
        </section>
    )
}

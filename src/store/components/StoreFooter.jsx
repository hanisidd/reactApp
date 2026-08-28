import { useEffect, useState } from "react";
import { ChatBubbleLeftRightIcon, CameraIcon, HandThumbUpIcon } from "@heroicons/react/24/outline";

function StoreFooter() {
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        fetch("http://localhost:8000/api/admin/store/public-settings")
            .then((res) => res.json())
            .then(setSettings)
            .catch(() => {});
    }, []);

    return (
        <footer className="bg-gray-900 text-gray-300 pt-12 pb-8 border-t border-gray-800 mt-16">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xl font-black text-white">
                        {settings?.logo_url ? (
                            <img src={settings.logo_url} alt="Logo" className="w-8 h-8 object-contain" />
                        ) : (
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">
                                DS
                            </div>
                        )}
                        <span>{settings?.brand_name || "DigitalStore"}</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        {settings?.footer_about || "Your trusted store for digital downloads and physical products."}
                    </p>
                </div>

                <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Quick Links</h4>
                    <ul className="space-y-2 text-xs">
                        <li><a href="/" className="hover:text-blue-400 transition">All Products</a></li>
                        <li><a href="#about" className="hover:text-blue-400 transition">About Us</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Contact Us</h4>
                    <ul className="space-y-2 text-xs text-gray-400">
                        <li>📍 {settings?.footer_address || "Pakistan"}</li>
                        <li>✉ {settings?.footer_email || "support@store.pk"}</li>
                        <li>📞 {settings?.footer_phone || "+92 300 0000000"}</li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Connect With Us</h4>
                    <div className="flex items-center gap-3">
                        {settings?.footer_whatsapp && (
                            <a href={`https://wa.me/${settings.footer_whatsapp}`} target="_blank" rel="noreferrer" className="w-9 h-9 bg-emerald-600/20 text-emerald-400 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition">
                                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                            </a>
                        )}
                        {settings?.footer_instagram && (
                            <a href={settings.footer_instagram} target="_blank" rel="noreferrer" className="w-9 h-9 bg-pink-600/20 text-pink-400 rounded-xl flex items-center justify-center hover:bg-pink-600 hover:text-white transition">
                                <CameraIcon className="w-5 h-5" />
                            </a>
                        )}
                        {settings?.footer_facebook && (
                            <a href={settings.footer_facebook} target="_blank" rel="noreferrer" className="w-9 h-9 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition">
                                <HandThumbUpIcon className="w-5 h-5" />
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-gray-800 text-center text-xs text-gray-500">
                &copy; {new Date().getFullYear()} {settings?.brand_name || "DigitalStore"}. All rights reserved.
            </div>
        </footer>
    );
}

export default StoreFooter;
import { useEffect, useState } from "react";
import StoreNavbar from "../components/StoreNavbar";
import StoreFooter from "../components/StoreFooter";

function AboutUs() {
    const [publicSettings, setPublicSettings] = useState(null);

    useEffect(() => {
        fetch("http://localhost:8000/api/public-settings")
            .then((res) => res.json())
            .then(setPublicSettings)
            .catch(() => {});
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <StoreNavbar publicSettings={publicSettings} />
            <main className="max-w-5xl mx-auto px-6 py-16 flex-1 w-full space-y-12">
                <div className="text-center space-y-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        Who We Are
                    </span>
                    <h1 className="text-4xl font-black text-gray-900">
                        {publicSettings?.about_heading || `About ${publicSettings?.brand_name || "Our Store"}`}
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto text-sm leading-relaxed">
                        {publicSettings?.about_description || publicSettings?.footer_about}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-2 text-center">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-xl mx-auto">
                            01
                        </div>
                        <h3 className="font-extrabold text-gray-900 text-lg">
                            {publicSettings?.about_f1_title || "Instant Downloads"}
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            {publicSettings?.about_f1_desc || "Access your digital purchases immediately after checkout."}
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-2 text-center">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center font-bold text-xl mx-auto">
                            02
                        </div>
                        <h3 className="font-extrabold text-gray-900 text-lg">
                            {publicSettings?.about_f2_title || "Trusted Shipping"}
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            {publicSettings?.about_f2_desc || "Fast and safe nationwide delivery for physical goods."}
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-2 text-center">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold text-xl mx-auto">
                            03
                        </div>
                        <h3 className="font-extrabold text-gray-900 text-lg">
                            {publicSettings?.about_f3_title || "24/7 Support"}
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            {publicSettings?.about_f3_desc || "Reach out anytime via email or WhatsApp."}
                        </p>
                    </div>
                </div>
            </main>
            <StoreFooter />
        </div>
    );
}

export default AboutUs;
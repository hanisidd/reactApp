import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { verifyPaymentApi } from "../services/storeApi";
import StoreNavbar from "../components/StoreNavbar";
import StoreFooter from "../components/StoreFooter";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import Loader from "../../admin/components/Loader";

function PaymentReturn() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState("checking"); // 'checking' | 'success' | 'failed'
    const [message, setMessage] = useState("");

    useEffect(() => {
        const verify = async () => {
            const tracker = searchParams.get("tracker");
            const orderId = searchParams.get("order_id");

            if (!tracker || !orderId) {
                setStatus("failed");
                setMessage("Missing payment reference.");
                return;
            }

            try {
                const data = await verifyPaymentApi("safepay", { tracker, order_id: orderId });
                setStatus(data.success ? "success" : "failed");
                setMessage(data.message);
            } catch (err) {
                setStatus("failed");
                setMessage(err?.message || "Could not verify payment.");
            }
        };
        verify();
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <StoreNavbar />
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="bg-white max-w-md w-full rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
                    {status === "checking" && (
                        <div className="py-6">
                            <Loader />
                            <p className="text-sm text-gray-500 mt-4">Confirming your payment...</p>
                        </div>
                    )}
                    {status === "success" && (
                        <>
                            <CheckCircleIcon className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                            <h1 className="text-xl font-black text-gray-900 mb-2">Payment Successful</h1>
                            <p className="text-sm text-gray-500 mb-6">{message}</p>
                            <Link to="/dashboard" className="inline-block px-6 py-3 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md">
                                View My Orders
                            </Link>
                        </>
                    )}
                    {status === "failed" && (
                        <>
                            <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <h1 className="text-xl font-black text-gray-900 mb-2">Payment Failed</h1>
                            <p className="text-sm text-gray-500 mb-6">{message}</p>
                            <Link to="/checkout" className="inline-block px-6 py-3 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md">
                                Try Again
                            </Link>
                        </>
                    )}
                </div>
            </main>
            <StoreFooter />
        </div>
    );
}

export default PaymentReturn;

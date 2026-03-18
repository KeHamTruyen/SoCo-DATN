import { CheckCircle2, Package, ShoppingBag } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "../shared/ui/atoms/button";
import { BrandLogo } from "../shared/ui/organisms/brand-logo/BrandLogo";

export default function CheckoutSuccess() {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get("orderId");

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background-light px-4 dark:bg-background-dark">
            <div className="w-full max-w-md">
                <div className="mb-8 flex justify-center">
                    <BrandLogo />
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col items-center gap-4 bg-green-50 p-8 dark:bg-green-900/20">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="text-center">
                            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                                Order Placed!
                            </h1>
                            <p className="mt-1 text-slate-500 dark:text-slate-400">
                                Your order has been successfully placed.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 p-6">
                        {orderId && (
                            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                                <span className="text-sm text-slate-500">Order ID</span>
                                <span className="font-mono text-sm font-bold">#{orderId.slice(0, 8).toUpperCase()}</span>
                            </div>
                        )}
                        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                            We'll send you a confirmation email and notify you when your order
                            ships.
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            {orderId && (
                                <Link to={`/orders/${orderId}`} className="block">
                                    <Button variant="outline" className="w-full gap-2">
                                        <Package className="h-4 w-4" />
                                        Track Order
                                    </Button>
                                </Link>
                            )}
                            <Link to="/marketplace" className="block">
                                <Button className="w-full gap-2">
                                    <ShoppingBag className="h-4 w-4" />
                                    Keep Shopping
                                </Button>
                            </Link>
                        </div>
                        <Link
                            to="/orders"
                            className="block text-center text-sm text-slate-500 underline hover:text-primary"
                        >
                            View all orders
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

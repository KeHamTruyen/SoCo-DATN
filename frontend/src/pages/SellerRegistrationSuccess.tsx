import { CheckCircle2, Home, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { BrandLogo } from "../shared/ui/organisms/brand-logo/BrandLogo";
import { Button } from "../shared/ui/atoms/button";

export default function SellerRegistrationSuccess() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background-light px-4 dark:bg-background-dark">
            <div className="w-full max-w-md">
                <div className="mb-8 flex justify-center">
                    <BrandLogo />
                </div>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col items-center gap-4 bg-gradient-to-br from-primary/10 to-orange-50 p-8 dark:from-primary/20 dark:to-orange-950/20">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
                            <CheckCircle2 className="h-10 w-10 text-primary" />
                        </div>
                        <div className="text-center">
                            <h1 className="text-2xl font-black">Application Submitted!</h1>
                            <p className="mt-1 text-slate-500 dark:text-slate-400">
                                Your seller application is under review.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 p-6">
                        <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            <p className="font-semibold text-slate-900 dark:text-slate-100">What's next?</p>
                            <ul className="mt-2 space-y-1">
                                <li>• We'll review your application within 1-3 business days</li>
                                <li>• You'll receive an email notification about the decision</li>
                                <li>• Once approved, you can start listing products</li>
                            </ul>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Link to="/feed">
                                <Button variant="outline" className="w-full gap-2">
                                    <Home className="h-4 w-4" />
                                    Go to Feed
                                </Button>
                            </Link>
                            <Link to="/marketplace">
                                <Button className="w-full gap-2">
                                    <ShoppingBag className="h-4 w-4" />
                                    Explore
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

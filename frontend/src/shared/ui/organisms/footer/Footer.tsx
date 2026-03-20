import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

const footerLinks = [
    { label: "About", to: "/about" },
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms of Service", to: "/terms" },
    { label: "Help Center", to: "/help" },
    { label: "Contact", to: "/contact" },
];

export function Footer() {
    return (
        <footer className="border-t border-border bg-muted text-foreground">
            <div className="mx-auto max-w-[1440px] px-6 py-10">
                <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <ShoppingBag className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-foreground">
                            SocialCommerce
                        </span>
                    </div>

                    <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                        {footerLinks.map((link) => (
                            <Link
                                key={link.label}
                                to={link.to}
                                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} SocialCommerce. All rights reserved.
                </div>
            </div>
        </footer>
    );
}

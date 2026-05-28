import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MessageDock } from "../../features/messaging/components/MessageDock";
import { AuthRoutes } from "./auth.routes";
import { CommerceRoutes } from "./commerce.routes";
import { FeedRoutes } from "./feed.routes";
import { MarketplaceRoutes } from "./marketplace.routes";
import { SocialRoutes } from "./social.routes";
import RootRedirect from "./RootRedirect";
import ScrollToTop from "./ScrollToTop";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<RootRedirect />} />
                {AuthRoutes()}
                {FeedRoutes()}
                {MarketplaceRoutes()}
                {CommerceRoutes()}
                {SocialRoutes()}
            </Routes>
            <MessageDock />
        </BrowserRouter>
    );
}

import { Route } from "react-router-dom";
import {
    AppShellHeaderOnlyLayout,
    AppShellWithFooterLayout,
} from "../layouts/AppShellLayout";
import AiCreativeLab from "../../pages/AiCreativeLab";
import Feed from "../../pages/Feed";
import PostDetail from "../../pages/PostDetail";
import Profile from "../../pages/Profile";
import SavedItems from "../../pages/SavedItems";
import ScheduledPosts from "../../pages/ScheduledPosts";
import SellerDashboard from "../../pages/SellerDashboard";
import ProtectedRoute from "./ProtectedRoute";

export function FeedRoutes() {
    return (
        <Route element={<ProtectedRoute />}>
            <Route element={<AppShellHeaderOnlyLayout />}>
                <Route path="/feed" element={<Feed />} />
                <Route path="/posts/:id" element={<PostDetail />} />
                <Route path="/scheduled-posts" element={<ScheduledPosts />} />
                <Route path="/seller/dashboard" element={<SellerDashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:id" element={<Profile />} />
            </Route>
            <Route element={<AppShellWithFooterLayout />}>
                <Route path="/saved-items" element={<SavedItems />} />
                <Route path="/ai-creative-lab" element={<AiCreativeLab />} />
            </Route>
        </Route>
    );
}

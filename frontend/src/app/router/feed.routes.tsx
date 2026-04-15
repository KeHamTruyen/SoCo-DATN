import { Navigate, Route, useParams } from "react-router-dom";
import {
    AppShellHeaderOnlyLayout,
    AppShellWithFooterLayout,
} from "../layouts/AppShellLayout";
import AiCreativeLab from "../../pages/AiCreativeLab";
import Feed from "../../pages/Feed";
import PostDetail from "../../pages/PostDetail";
import AccountSettings from "../../pages/AccountSettings";
import Profile from "../../pages/Profile";
import SearchPage from "../../pages/Search";
import SavedItems from "../../pages/SavedItems";
import ScheduledPosts from "../../pages/ScheduledPosts";
import ScheduledPostsAnalytics from "../../pages/ScheduledPostsAnalytics";
import SellerDashboard from "../../pages/SellerDashboard";
import ProtectedRoute from "./ProtectedRoute";

function LegacyPostDetailRedirect() {
    const { id } = useParams<{ id: string }>();
    return <Navigate to={id ? `/post/${id}` : "/feed"} replace />;
}

export function FeedRoutes() {
    return (
        <Route element={<ProtectedRoute />}>
            <Route element={<AppShellHeaderOnlyLayout />}>
                <Route path="/feed" element={<Feed />} />
                <Route path="/post/:postId" element={<PostDetail />} />
                <Route path="/posts/:id" element={<LegacyPostDetailRedirect />} />
                <Route path="/scheduled-posts" element={<ScheduledPosts />} />
                <Route path="/scheduled-posts/analytics" element={<ScheduledPostsAnalytics />} />
                <Route path="/seller/dashboard" element={<SellerDashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:id" element={<Profile />} />
                <Route path="/settings" element={<AccountSettings />} />
                <Route path="/search" element={<SearchPage />} />
            </Route>
            <Route element={<AppShellWithFooterLayout />}>
                <Route path="/saved-items" element={<SavedItems />} />
                <Route path="/ai-creative-lab" element={<AiCreativeLab />} />
            </Route>
        </Route>
    );
}

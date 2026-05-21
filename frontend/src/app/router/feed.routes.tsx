import { Navigate, Route, useParams } from "react-router-dom";
import {
    AppShellHeaderFooterLayout,
    AppShellHeaderLayout,
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
import {
    FEED_ACTIVE_HEADER,
    MARKETPLACE_ACTIVE_HEADER,
} from "./routeHandle";

function LegacyPostDetailRedirect() {
    const { id } = useParams<{ id: string }>();
    return <Navigate to={id ? `/post/${id}` : "/feed"} replace />;
}

export function FeedRoutes() {
    return (
        <>
            <Route element={<AppShellHeaderLayout />}>
                <Route path="/feed" element={<Feed />} handle={FEED_ACTIVE_HEADER} />
                <Route
                    path="/post/:postId"
                    element={<PostDetail />}
                    handle={FEED_ACTIVE_HEADER}
                />
                <Route path="/posts/:id" element={<LegacyPostDetailRedirect />} />
                <Route
                    path="/profile/:id"
                    element={<Profile />}
                    handle={FEED_ACTIVE_HEADER}
                />
                <Route
                    path="/search"
                    element={<SearchPage />}
                    handle={MARKETPLACE_ACTIVE_HEADER}
                />
            </Route>
            <Route element={<ProtectedRoute />}>
                <Route element={<AppShellHeaderLayout />}>
                    <Route
                        path="/scheduled-posts"
                        element={<ScheduledPosts />}
                        handle={FEED_ACTIVE_HEADER}
                    />
                    <Route
                        path="/scheduled-posts/analytics"
                        element={<ScheduledPostsAnalytics />}
                        handle={FEED_ACTIVE_HEADER}
                    />
                    <Route
                        path="/seller/dashboard"
                        element={<SellerDashboard />}
                        handle={FEED_ACTIVE_HEADER}
                    />
                    <Route
                        path="/profile"
                        element={<Profile />}
                        handle={FEED_ACTIVE_HEADER}
                    />
                    <Route
                        path="/settings"
                        element={<AccountSettings />}
                        handle={FEED_ACTIVE_HEADER}
                    />
                </Route>
                <Route element={<AppShellHeaderFooterLayout />}>
                    <Route
                        path="/saved-items"
                        element={<SavedItems />}
                        handle={FEED_ACTIVE_HEADER}
                    />
                    <Route
                        path="/ai-creative-lab"
                        element={<AiCreativeLab />}
                        handle={FEED_ACTIVE_HEADER}
                    />
                </Route>
            </Route>
        </>
    );
}

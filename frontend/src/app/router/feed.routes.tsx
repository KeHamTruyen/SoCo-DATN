import { Route } from "react-router-dom";
import AiCreativeLab from "../../pages/AiCreativeLab";
import Feed from "../../pages/Feed";
import PostDetail from "../../pages/PostDetail";
import Profile from "../../pages/Profile";
import SavedItems from "../../pages/SavedItems";
import ScheduledPosts from "../../pages/ScheduledPosts";
import ProtectedRoute from "./ProtectedRoute";

export function FeedRoutes() {
    return (
        <Route element={<ProtectedRoute />}>
            <Route path="/feed" element={<Feed />} />
            <Route path="/saved-items" element={<SavedItems />} />
            <Route path="/ai-creative-lab" element={<AiCreativeLab />} />
            <Route path="/posts/:id" element={<PostDetail />} />
            <Route path="/scheduled-posts" element={<ScheduledPosts />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:id" element={<Profile />} />
        </Route>
    );
}


import { Route } from "react-router-dom";
import { AppShellHeaderLayout } from "../layouts/AppShellLayout";
import GroupDetail from "../../pages/GroupDetail";
import GroupPostDetail from "../../pages/GroupPostDetail";
import Groups from "../../pages/Groups";
import Messages from "../../pages/Messages";
import Notifications from "../../pages/Notifications";
import UserAreaProtectedRoute from "./UserAreaProtectedRoute";
import { FEED_ACTIVE_HEADER } from "./routeHandle";

export function SocialRoutes() {
    return (
        <>
            <Route element={<AppShellHeaderLayout />}>
                <Route path="/groups" element={<Groups />} handle={FEED_ACTIVE_HEADER} />
                <Route
                    path="/groups/:id"
                    element={<GroupDetail />}
                    handle={FEED_ACTIVE_HEADER}
                />
                <Route
                    path="/groups/:groupId/posts/:postId"
                    element={<GroupPostDetail />}
                    handle={FEED_ACTIVE_HEADER}
                />
            </Route>
            <Route element={<UserAreaProtectedRoute />}>
                <Route element={<AppShellHeaderLayout />}>
                    <Route
                        path="/messages"
                        element={<Messages />}
                        handle={FEED_ACTIVE_HEADER}
                    />
                    <Route
                        path="/notifications"
                        element={<Notifications />}
                        handle={FEED_ACTIVE_HEADER}
                    />
                </Route>
            </Route>
        </>
    );
}

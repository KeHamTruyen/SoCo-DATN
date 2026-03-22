import { Route } from "react-router-dom";
import GroupDetail from "../../pages/GroupDetail";
import Groups from "../../pages/Groups";
import Messages from "../../pages/Messages";
import Notifications from "../../pages/Notifications";
import UserAreaProtectedRoute from "./UserAreaProtectedRoute";

export function SocialRoutes() {
    return (
        <Route element={<UserAreaProtectedRoute />}>
            <Route path="/groups" element={<Groups />} />
            <Route path="/groups/:id" element={<GroupDetail />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/notifications" element={<Notifications />} />
        </Route>
    );
}

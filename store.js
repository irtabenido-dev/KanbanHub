import { boardSlice } from "@/Features/board/boardSlice";
import { notificationsSlice } from "@/Features/notifications/notificationsSlice";
import { userSlice } from "@/Features/user/userSlice";
import { workspacesSlice } from "@/Features/workspaces/workspacesSlice";
import { configureStore } from "@reduxjs/toolkit";

export default configureStore({
    reducer: {
        user: userSlice.reducer,
        workspaces: workspacesSlice.reducer,
        notifications: notificationsSlice.reducer,
        board: boardSlice.reducer
    }
});

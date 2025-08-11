import { removeNotification } from "@/Features/notifications/notificationsSlice";
import { Link } from "@inertiajs/react";
import { Typography } from "@material-tailwind/react";
import { useDispatch } from "react-redux";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";

dayjs.extend(relativeTime);
dayjs.extend(utc)

export default function Notification({ notification }) {
    const dispatch = useDispatch();

    const markAsRead = async (e) => {
        e.preventDefault();
        try {
            await axios.post(route("user.markNotification", { id: notification.id }));
            dispatch(removeNotification(notification.id));
        } catch (error) {
            console.error(error);
        }
    };

    const timeAgo = dayjs.utc(notification.created_at).local().fromNow();

    const renderContent = () => {
        switch (notification?.type) {
            case "workspace_invitation":
                return (
                    <Typography variant="paragraph" className="text-gray-600">
                        Greetings{" "}
                        <span className="font-semibold">{notification.invited_name}</span>! You have been{" "}
                        <Link href={notification.invitation_link || ""} className="text-blue-500 hover:underline">
                            invited
                        </Link>{" "}
                        to join the{" "}
                        <span className="font-semibold">{notification.workspace_name}</span> workspace by{" "}
                        <span className="font-semibold">{notification.inviter_name}</span>.
                    </Typography>
                );
            case "workspace_removed":
                return (
                    <Typography variant="paragraph" className="text-gray-600">
                        The workspace <span className="font-semibold">{notification.workspaceName}</span> has been removed.
                    </Typography>
                );
            case "workspace_restored":
                return (
                    <Typography variant="paragraph" className="text-gray-600">
                        The workspace <span className="font-semibold">{notification.workspaceName}</span> has been restored.
                    </Typography>
                );
            case "workspace_updated":
                return (
                    <Typography variant="paragraph" className="text-gray-600">
                        The workspace <span className="font-semibold">{notification.workspaceName}</span> was updated to{" "}
                        <span className="font-semibold">{notification.updatedWorkspaceName}</span>.
                    </Typography>
                );
            case "board_removed":
                return (
                    <Typography variant="paragraph" className="text-gray-600">
                        The board <span className="font-semibold">{notification.boardName}</span> was removed from the workspace.
                    </Typography>
                );
            case "board_restored":
                return (
                    <Typography variant="paragraph" className="text-gray-600">
                        The board <span className="font-semibold">{notification.boardName}</span> has been restored.
                    </Typography>
                );
            case "task_move":
                return (
                    <Typography variant="paragraph" className="text-gray-600">
                        The task <span className="font-semibold">{notification.taskName}</span> has been moved to the list {<span className="font-semibold">{notification.listName}</span>}.
                    </Typography>
                );
            case "task_title_update":
                return (
                    <Typography variant="paragraph" className="text-gray-600">
                        The task <span className="font-semibold">{notification.previousTitle}</span>'s title has been changed to {<span className="font-semibold">{notification.updatedTitle}</span>}.
                    </Typography>
                );
            case "task_user_add":
                return (
                    <Typography variant="paragraph" className="text-gray-600">
                        You have been added to the task <span className="font-semibold">{notification.taskName}</span>
                    </Typography>
                );
            case "task_user_remove":
                return (
                    <Typography variant="paragraph" className="text-gray-600">
                        You have been removed from the task <span className="font-semibold">{notification.taskName}</span>
                    </Typography>
                );
            case "board_user_add":
                return (
                    <Typography variant="paragraph" className="text-gray-600">
                        You have been given access to the board <span className="font-semibold">{notification.boardName}</span>
                    </Typography>
                );
            case "board_user_remove":
                return (
                    <Typography variant="paragraph" className="text-gray-600">
                        You have lost access to the board <span className="font-semibold">{notification.boardName}</span>
                    </Typography>
                );
            case "board_user_update":
                const role = notification.newRole.replace('_', ' ')
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ');
                return (
                    <Typography variant="paragraph" className="text-gray-600">
                        Your role in the board <span className="font-semibold">{notification.boardName}</span> has been changed to <span className="font-semibold">{role}</span>
                    </Typography>
                );
            case 'task_removed':
                return (
                    <Typography variant="paragraph" className="text-gray-600">
                        The task {notification.taskName} has been removed
                    </Typography>
                );
            case 'task_restored':
                return (
                    <Typography variant="paragraph" className="text-gray-600">
                        The task {notification.taskName} has been restored
                    </Typography>
                );
            case 'workspace_user_role_update':
                return (
                    <Typography variant="paragraph" className="text-gray-600">
                        Your role in the workspace <span className="font-semibold">{notification.workspaceName}</span> has been updated to <span className="font-semibold">{notification.updatedRole}</span> by <span className="font-semibold">{notification.senderName}</span>
                    </Typography>
                );
            case 'workspace_remove_user':
                return (
                    <Typography variant="paragraph" className="text-gray-600">
                        You have been removed from the workspace <span className="font-semibold">{notification.workspaceName}</span>
                    </Typography>
                );
            case 'list_updated':
                return (
                    <Typography variant="paragraph" className="text-gray-600">
                        The name of the list <span className="font-semibold">{notification.previousListName}</span> from the board <span className="font-semibold">{notification.boardName}</span> has been changed into <span className="font-semibold">{notification.updatedListName}</span>
                    </Typography>
                );
            case 'list_removed':
                return (
                    <Typography variant="paragraph" className="text-gray-600">
                        The list <span className="font-semibold">{notification.listName}</span> has been removed from the board <span className="font-semibold">{notification.boardName}</span>
                    </Typography>
                );
            case 'list_restored':
                return (
                    <Typography variant="paragraph" className="text-gray-600">
                        The list <span className="font-semibold">{notification.listName}</span> from the board <span className="font-semibold">{notification.boardName}</span> has been restored
                    </Typography>
                );
            default:
                return null;
        }
    };

    const getTitle = () => {
        const titles = {
            workspace_invitation: "Workspace Invitation",
            workspace_removed: "Workspace Removed",
            workspace_restored: "Workspace Restored",
            workspace_updated: "Workspace Updated",
            board_removed: "Board Removed",
            board_restored: "Board Restored",
            task_move: "Task Moved",
            task_title_update: "Task Title Updated",
            task_user_add: "You have been added to a task",
            task_user_remove: "You have been removed from a task",
            board_user_add: "You have gained access to a board",
            board_user_remove: "You have lost access to a board",
            board_user_update: "Your role in the board has been changed",
            task_removed: "Task Removed",
            task_restored: "Task Restored",
            workspace_user_role_update: "Your workspace role has been updated",
            workspace_remove_user: "Removed from workspace",
            list_updated: "List Updated",
            list_removed: "List Removed",
            list_restored: "List Restored"
        };

        return titles[notification?.type] || "Notification";
    };

    return (
        <div>
            {notification && (
                <div className="hover:bg-gray-50">
                    {notification && (
                        <>
                            <div className="flex flex-col gap-1 mb-2">
                                <Typography variant="small" color="blue-gray" className="font-semibold text-sm"> {/* Smaller text */}
                                    {getTitle()}
                                </Typography>
                                <div className="text-xs text-gray-600">
                                    {renderContent()}
                                </div>
                            </div>
                            <div className="flex flex-row gap-2 items-center">
                                <Link onClick={markAsRead} className="text-xs text-blue-500 hover:underline">
                                    Mark as read
                                </Link>
                                <Typography variant="small" className="text-gray-500 text-xs">
                                    {`Sent ${timeAgo}`}
                                </Typography>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

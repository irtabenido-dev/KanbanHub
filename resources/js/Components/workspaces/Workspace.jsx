import { Typography, IconButton, Tooltip } from "@material-tailwind/react";
import WorkspaceBoardAdd from "@/Components/workspaces/WorkspaceBoardAdd.jsx";
import { useDispatch, useSelector } from "react-redux";
import { memo, useEffect } from "react";
import WorkspaceBoard from "./WorkspaceBoard";
import ScrollContainer from "react-indiana-drag-scroll";
import { addBoard, removeBoard } from "@/Features/workspaces/workspacesSlice";
import { getUser } from "@/Features/user/userSlice";
import usePermissions from "@/Hooks/usePermissions";

export default memo(function Workspace({ workspace, toggleSettings, toggleUsers, toggleBoardArchive, currentUserRole }) {
    const dispatch = useDispatch();
    const user = useSelector(getUser);
    const { hasPermission } = usePermissions();

    useEffect(() => {
        const workspaceChannel = window.Echo.private(`workspace.${workspace.id}`);

        workspaceChannel.listen('.board.removed', (data) => {
            if (user.id !== data.senderId && workspace.id === data.workspaceId) {
                dispatch(removeBoard({
                    workspace_id: data.workspaceId,
                    id: data.boardId
                }));
            }
        });

        workspaceChannel.listen('.board.restored', (data) => {
            if (user.id !== data.senderId && workspace.id === data.restoredBoard.workspaceId) {
                dispatch(addBoard(data.restoredBoard));
            }
        });

        return () => {
            workspaceChannel.stopListening('.board.removed');
            workspaceChannel.stopListening('.board.restored');
        };
    }, [workspace.id, workspace.currentUser.id, dispatch]);

    return (
        <div className="p-2 dark:bg-gray-800">
            <div className="flex flex-row gap-4 items-center">
                <Typography
                    className="min-w-[5rem] max-w-[15rem] truncate "
                    variant="lead"
                    color="white"
                >
                    {workspace.name} ({workspace.owner_name})
                </Typography>
                <div className="flex items-center gap-4">
                    {hasPermission({ workspaceRole: currentUserRole }, 'restore_boards') &&
                        <Tooltip content="Board Archive">
                            <IconButton
                                onClick={() => {
                                    toggleBoardArchive(workspace.id, currentUserRole);
                                }}
                                variant="text"
                                size="sm"
                                className="hover:scale-125"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none" viewBox="0 0 24 24"
                                    strokeWidth={1.5} stroke="white"
                                    className="size-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                                    />
                                </svg>

                            </IconButton>
                        </Tooltip>
                    }
                    {hasPermission({ workspaceRole: currentUserRole }, 'workspace_edit') &&
                        <Tooltip content="Settings">
                            <IconButton
                                onClick={() => {
                                    toggleSettings(workspace);
                                }}
                                variant="text"
                                size="sm"
                                className="hover:scale-125"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="white"
                                    className="size-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                    />
                                </svg>
                            </IconButton>
                        </Tooltip>
                    }
                    {hasPermission({ workspaceRole: currentUserRole }, 'manage_workspace_users') &&
                        <Tooltip content="User Options">
                            <IconButton
                                onClick={() => {
                                    toggleUsers(workspace);
                                }}
                                variant="text"
                                size="sm"
                                className="hover:scale-125"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="white"
                                    className="size-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                                    />
                                </svg>
                            </IconButton>
                        </Tooltip>
                    }
                    {hasPermission({ workspaceRole: currentUserRole }, 'create_boards') &&
                        <WorkspaceBoardAdd workspaceId={workspace.id} type={'workspace'} />
                    }
                </div>
            </div>
            <ScrollContainer
                className="flex gap-2 p-4 overflow-auto">
                {workspace.boards &&
                    workspace.boards.map((board) => (
                        <WorkspaceBoard key={board.id} board={board} />
                    ))}
            </ScrollContainer>
        </div>
    )
}, (prevProps, nextProps) => {
    return prevProps.workspace.id === nextProps.workspace.id &&
        prevProps.workspace.boards.length === nextProps.workspace.boards.length;
});


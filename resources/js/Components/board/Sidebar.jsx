import React, { lazy, useCallback, useState } from "react";
import {
    IconButton,
    Typography,
    List,
    Drawer,
    Card,
} from "@material-tailwind/react";
import { FixedSizeList as BoardList } from "react-window";
import { Link } from "@inertiajs/react";
import { useSelector } from "react-redux";
import { getBoard, getUserRoles } from "@/Features/board/boardSlice";
import BoardTaskListArchiveManagement from "./BoardTaskListArchiveManagement";
import { getUser } from "@/Features/user/userSlice";
import usePermissions from "@/Hooks/usePermissions";
const WorkspaceBoardAdd = lazy(() => import("@/Components/workspaces/WorkspaceBoardAdd"));
const BoardSettings = lazy(() => import("@/Components/board/BoardSettings"));
const BoardUsers = lazy(() => import("@/Components/board/BoardUsers"));

export function Sidebar() {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const openDrawer = () => setIsDrawerOpen(true);
    const closeDrawer = () => setIsDrawerOpen(false);
    const board = useSelector(getBoard);
    const user = useSelector(getUser);
    const { workspaceRole, boardRole } = useSelector(state => getUserRoles(state, user.id));
    const { hasPermission } = usePermissions();

    const boardRow = useCallback(({ index, style }) => {
        const currentBoard = board.relatedBoards[index];
        if (!currentBoard) return null;
        console.log(board);
        return (
            <div
                className="flex items-center"
                style={style}>
                <Link
                    className="bg-transparent text-[#E6E6E6] hover:bg-[#2C2C2C] hover:text-white p-2 rounded"
                    href={`/workspace/${board.workspaceId}/board/${currentBoard.id}`}>
                    <div className="flex items-center">
                        <span className="font-medium truncate">{currentBoard.name}</span>
                    </div>
                </Link>
            </div>
        );
    });

    return (
        <div className="absolute">
            <IconButton
                className="rounded-l-none bg-transparent hover:bg-gray-700"
                variant="text"
                color="white"
                size="lg"
                onClick={openDrawer}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                </svg>
            </IconButton>
            <Drawer open={isDrawerOpen} onClose={closeDrawer}>
                <Card
                    shadow={false}
                    className="h-[calc(100vh)] rounded-none w-full p-4 bg-[#232323]"
                >
                    <div className="mb-2 flex items-center gap-4 p-4">
                        <Typography variant="h5" className="text-[#E6E6E6]">
                            {board.name || ''}
                        </Typography>
                    </div>
                    <List>
                        <BoardUsers />
                        {hasPermission({
                            workspaceRole: workspaceRole,
                            boardRole: boardRole
                        }, 'restore_boards') &&
                            <BoardTaskListArchiveManagement />
                        }
                        {hasPermission({
                            workspaceRole: workspaceRole,
                            boardRole: boardRole
                        }, 'edit_boards') &&
                            <BoardSettings />
                        }
                        <hr className="my-2 border-blue-gray-50" />
                        <div className="mb-2 flex flex-row items-center gap-4 p-4">
                            <Typography variant="h5" className="text-[#E6E6E6]">
                                Related boards
                            </Typography>
                            {hasPermission({
                                workspaceRole: workspaceRole,
                                boardRole: boardRole
                            }, 'create_boards') &&
                                <WorkspaceBoardAdd workspaceId={board.workspaceId} type="board" />
                            }
                        </div>
                        <div>
                            {board?.relatedBoards?.length > 0
                                && (
                                    <BoardList
                                        height={500}
                                        itemSize={50}
                                        itemCount={board.relatedBoards.length}
                                        overscanCount={2}
                                    >
                                        {boardRow}
                                    </BoardList>
                                )}
                        </div>
                    </List>
                </Card>
            </Drawer>
        </div>
    );
}

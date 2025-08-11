import { Button, Dialog, DialogBody, DialogHeader, ListItem, ListItemPrefix } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getBoard, getUserRoles, setUsers } from "@/Features/board/boardSlice";
import axios from "axios";
import BoardEditUser from "./BoardEditUser";
import BoardUserList from "./BoardUserList";
import BoardUserAdd from "./BoardUserAdd";
import BoardRemoveUser from "./BoardRemoveUser";
import BoardJoinRequestList from "./BoardJoinRequestList";
import { getUser } from "@/Features/user/userSlice";
import usePermissions from "@/Hooks/usePermissions";
import BoardBlacklistControl from "./BoardBlacklistControl";

export default function BoardUsers({ }) {
    const dispatch = useDispatch();
    const [show, setShow] = useState(false);
    const board = useSelector(getBoard);
    const [mode, setMode] = useState('userList');
    const user = useSelector(getUser);
    const { workspaceRole, boardRole } = useSelector(state => getUserRoles(state, user.id));
    const { hasPermission } = usePermissions();
    const [removeUserData, setRemoveUserData] = useState({
        show: false,
        name: '',
        targetId: null,
        boardId: board.id,
    });

    const [updateUserData, setUpdateUserData] = useState({});

    const toggle = () => {
        setShow((prev) => !prev);
    };

    const toggleMode = (newMode) => {
        setMode(newMode);
    };

    const toggleRemoveUser = (name, targetId) => {
        setRemoveUserData((prev) => ({
            ...prev,
            show: !prev.show,
            name: prev.name === '' ? name : '',
            targetId: prev.targetId === null ? targetId : null,
        }));
    };

    const toggleUpdateUser = (name, targetId, targetWorkspaceRole) => {
        setUpdateUserData((prev) => ({
            ...prev,
            show: !prev.show,
            name: prev.name === '' ? name : '',
            targetId: prev.targetId === null ? targetId : null,
            targetWorkspaceRole: prev.targetWorkspaceRole === null ? targetWorkspaceRole : null
        }));
    };

    const setData = async () => {
        if (board && board.id) {
            try {
                const boardUsers = await axios.get(route('board.users', board.id));
                dispatch(setUsers(boardUsers.data.users));
            } catch (errors) {
                console.log(errors);
            }
        }
    };

    useEffect(() => {
        setUpdateUserData({
            show: false,
            name: '',
            targetId: null,
            targetWorkspaceRole: null,
            boardId: board.id
        })
    }, []);

    return (
        <div>
            <ListItem onClick={toggle} className="text-[rgb(230,230,230)]">
                <ListItemPrefix>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                    </svg>
                </ListItemPrefix>
                Users
            </ListItem>
            <Dialog
                open={show}
                handler={toggle}
                size='lg'
                animate={{
                    mount: { scale: 1, y: 0 },
                    unmount: { scale: 1, y: 100 }
                }}
            >
                <DialogHeader>{board.name} Users</DialogHeader>
                <DialogBody>
                    {hasPermission({
                        workspaceRole: workspaceRole,
                        boardRole: boardRole
                    }, 'manage_board_users') &&
                        <div className="flex w-full mb-4 gap-4">
                            <Button
                                variant={mode === "userList" ? "filled" : "outlined"}
                                onClick={() => { toggleMode('userList') }}
                            >
                                User List
                            </Button>
                            <Button
                                variant={mode === "userAdd" ? "filled" : "outlined"}
                                onClick={() => { toggleMode('userAdd') }}
                            >
                                Add User
                            </Button>
                            <Button
                                variant={mode === "blacklist" ? "filled" : "outlined"}
                                onClick={() => { toggleMode('blacklist') }}
                            >
                                Blacklist
                            </Button>
                            {board.private === 1 &&
                                <Button
                                    variant={mode === "joinRequests" ? "filled" : "outlined"}
                                    onClick={() => { toggleMode('joinRequests') }}
                                >
                                    Join Requests</Button>
                            }
                        </div>
                    }
                    {mode === 'userList' &&
                        <BoardUserList
                            toggleUpdateUser={toggleUpdateUser}
                            toggleRemoveUser={toggleRemoveUser}
                        />
                    }
                    {mode === 'userAdd' &&
                        <BoardUserAdd />
                    }
                    {(mode === 'joinRequests') &&
                        <BoardJoinRequestList />
                    }
                    {(mode === 'blacklist') &&
                        <BoardBlacklistControl boardId={board.id}/>
                    }
                    {hasPermission({
                        workspaceRole: workspaceRole,
                        boardRole: boardRole
                    }, 'manage_board_users') &&
                        <>
                            <BoardEditUser
                                show={updateUserData.show}
                                name={updateUserData.name}
                                targetId={updateUserData.targetId}
                                targetWorkspaceRole={updateUserData.targetWorkspaceRole}
                                boardId={updateUserData.boardId}
                                currentUserBoardRole={boardRole}
                                currentUserWorkspaceRole={workspaceRole}
                                toggle={toggleUpdateUser}
                                refreshUsers={setData}
                            />
                            <BoardRemoveUser
                                show={removeUserData.show}
                                name={removeUserData.name}
                                targetId={removeUserData.targetId}
                                toggle={toggleRemoveUser}
                                refreshUsers={setData}
                            />
                        </>
                    }
                </DialogBody>
            </Dialog>
        </div>
    );
}

import { useSelector } from "react-redux";
import { IconButton, Card, Typography, Spinner, Tooltip } from "@material-tailwind/react";
import { getBoardUser, getUserRoles, getUsers } from "@/Features/board/boardSlice";
import { getUser } from "@/Features/user/userSlice";
import usePermissions from "@/Hooks/usePermissions";

export default function BoardUserList({ toggleUpdateUser, toggleRemoveUser }) {
    const currentUser = useSelector(getUser);
    const boardUser = useSelector(state => getBoardUser(state, currentUser.id));
    const { hasPermission, canTargetUser } = usePermissions();
    const { workspaceRole, boardRole } = useSelector(state => getUserRoles(state, currentUser.id));
    const usersHeaders = boardUser?.workspaceRole !== 'member' || boardUser?.boardRole !== 'member' ?
        ["Name", "Email", "Role", "Actions"] : ["Name", "Email", "Role"];

    const users = useSelector(getUsers) || [];

    if (currentUser.length <= 0) {
        return <Spinner className="m-auto" />
    }

    return (
        <div>
            <Card className="h-full overflow-scroll">
                <table className="table-auto text-left">
                    <thead>
                        <tr>
                            {usersHeaders.map((head) => (
                                <th key={head} className="bg-blue-gray-50 p-4">
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-normal leading-none opacity-70"
                                    >
                                        {head}
                                    </Typography>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? (
                            users.map((user) => {
                                console.log(user);
                                return (
                                    <tr key={user.id}>
                                        <td className="p-4">
                                            <Typography
                                                variant="small"
                                                color="blue-gray"
                                                className="font-normal"
                                            >
                                                {user.name}
                                            </Typography>
                                        </td>
                                        <td className="p-4">
                                            <Typography
                                                variant="small"
                                                color="blue-gray"
                                                className="font-normal"
                                            >
                                                {user.email}
                                            </Typography>
                                        </td>
                                        <td className="p-4">
                                            <Typography
                                                variant="small"
                                                color="blue-gray"
                                                className="font-normal"
                                            >
                                                {user.workspaceRole !== 'member' ? (
                                                    <span className="flex flex-row items-center">
                                                        <Tooltip
                                                            content={`Workspace ${user.workspaceRole.charAt(0).toUpperCase() + user.workspaceRole.slice(1)}`}
                                                            className='z-[9999]'
                                                        >
                                                            {user.workspaceRole === 'owner' ? (
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                                                                </svg>
                                                            ) : (
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                                                                </svg>
                                                            )}
                                                        </Tooltip>
                                                        <span className="ml-1">
                                                            Board {user?.boardRole
                                                                .split('_')
                                                                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                                                .join(' ')}
                                                        </span>
                                                    </span>
                                                ) : (
                                                    <span>
                                                        Board {user?.boardRole
                                                            .split('_')
                                                            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                                            .join(' ')}
                                                    </span>
                                                )}
                                            </Typography>
                                        </td>
                                        {hasPermission({
                                            workspaceRole: workspaceRole,
                                            boardRole: boardRole
                                        }, 'manage_board_users') &&
                                            <td className="p-4 flex gap-4">
                                                <IconButton
                                                    disabled={user.workspaceRole !== 'member' ?
                                                        true
                                                        :
                                                        !canTargetUser({
                                                            id: currentUser.id,
                                                            workspaceRole: workspaceRole,
                                                            boardRole: boardRole
                                                        }, user)
                                                    }
                                                    className="hover:scale-110"
                                                    variant="text"
                                                    onClick={() => {
                                                        toggleUpdateUser(user.name, user.id, user.workspaceRole)
                                                    }}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="size-6"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                                                        />
                                                    </svg>
                                                </IconButton>
                                                <IconButton
                                                    disabled={user.workspaceRole !== 'member' ?
                                                        true
                                                        :
                                                        !canTargetUser({
                                                            id: currentUser.id,
                                                            workspaceRole: workspaceRole,
                                                            boardRole: boardRole
                                                        }, user)
                                                    }
                                                    className="hover:scale-110"
                                                    variant="text"
                                                    onClick={() => {
                                                        toggleRemoveUser(user.name, user.id);
                                                    }}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none" viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="size-6">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                                                    </svg>
                                                </IconButton>
                                            </td>
                                        }
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td
                                    colSpan={usersHeaders.length}
                                    className="p-4 text-center"
                                >
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-normal"
                                    >
                                        No results found.
                                    </Typography>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}


import {
    Card,
    IconButton,
    Tooltip,
    Typography,
} from "@material-tailwind/react";
import debounce from "just-debounce-it";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectWorkspaceUsers } from "@/Features/workspaces/workspacesSlice.js";
import usePermissions from "@/Hooks/usePermissions";

export default function WorkspaceUserSearch({ workspace, toggleRemoveUser, toggleUserEdit }) {
    const searchTabHeaders = ["Name", "Email", "Role", "Action"];
    const users = useSelector((state) => selectWorkspaceUsers(workspace.id)(state));
    const [searchTabResult, setSearchTabResult] = useState(users || []);
    const { hasPermission, canTargetUser } = usePermissions();
    const submitSearchTab = useCallback(
        debounce((input) => {
            {
                if (input === "") {
                    setSearchTabResult(users);
                } else {
                    const result = users.filter(
                        (user) =>
                            user.name
                                .toLowerCase()
                                .includes(input.toLowerCase()) ||
                            user.email
                                .toLowerCase()
                                .includes(input.toLowerCase()),
                    );
                    setSearchTabResult(result);
                }
            }
        }, 300),
        [users],
    );

    useEffect(() => {
        setSearchTabResult(users);
    }, [users]);

    return (
        <>
            <input
                className="w-full mb-4 rounded-xl"
                placeholder="Search User"
                type="text"
                onChange={(e) => {
                    submitSearchTab(e.target.value);
                }}
            />

            <Card className="h-full overflow-scroll">
                <table className="table-auto text-left">
                    <thead>
                        <tr>
                            {searchTabHeaders.map((head) => (
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
                        {searchTabResult.length > 0 ? (
                            searchTabResult.map(
                                (user, index) => {
                                    return (
                                        <tr key={index}>
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
                                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                </Typography>
                                            </td>
                                            <td className="p-4 flex flex-row items-center">
                                                {(hasPermission({ workspaceRole: workspace.currentUser.role }, 'manage_workspace_users')
                                                    && workspace.currentUser.id !== user.id) &&
                                                    <Tooltip
                                                        content="Edit Role"
                                                        className="z-[9999]"
                                                    >
                                                        <IconButton
                                                            disabled={!canTargetUser({
                                                                id: workspace.currentUser.id,
                                                                workspaceRole: workspace.currentUser.role
                                                            }, {
                                                                id: user.id,
                                                                workspaceRole: user.role
                                                            })}
                                                            className="
                                                            hover:scale-110"
                                                            variant="text"
                                                            onClick={() => {
                                                                toggleUserEdit(
                                                                    user.id,
                                                                    workspace.id,
                                                                    user.name,
                                                                    user.role,
                                                                    workspace.currentUser.role,
                                                                    workspace.owner_id
                                                                );
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
                                                    </Tooltip>
                                                }
                                                {(hasPermission({ workspaceRole: workspace.currentUser.role }, 'manage_workspace_users')
                                                    || workspace.currentUser.id === user.id) &&
                                                    <Tooltip
                                                        content="Remove User"
                                                        className="z-[9999]"
                                                    >
                                                        <IconButton
                                                            disabled={!canTargetUser({
                                                                id: workspace.currentUser.id,
                                                                workspaceRole: workspace.currentUser.role
                                                            }, {
                                                                id: user.id,
                                                                workspaceRole: user.role
                                                            })}
                                                            className="
                                                            hover:scale-110"
                                                            variant="text"
                                                            onClick={() => {
                                                                toggleRemoveUser(
                                                                    user.id,
                                                                    workspace.id,
                                                                    user.name,
                                                                    workspace.currentUser.role,
                                                                );
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
                                                                    d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25"
                                                                />
                                                            </svg>
                                                        </IconButton>
                                                    </Tooltip>
                                                }
                                            </td>
                                        </tr>
                                    );
                                },
                            )
                        ) : (
                            <tr>
                                <td
                                    colSpan={searchTabHeaders.length}
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
        </>
    );
}

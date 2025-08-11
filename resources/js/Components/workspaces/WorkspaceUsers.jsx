import {
    Button,
    Dialog,
    DialogBody,
    DialogFooter,
    DialogHeader,
    IconButton,
    Tooltip,
} from "@material-tailwind/react";
import { useState } from "react";
import WorkspaceUserSearch from "./WorkspaceUserSearch";
import WorkspaceUserAdd from "./WorkspaceUserAdd";
import usePermissions from "@/Hooks/usePermissions";
import WorkspaceBlacklistControl from "./WorkspaceBlacklistControl";

export default function WorkspaceUsers({
    workspace,
    show,
    toggle,
    toggleRemoveUser,
    toggleUserEdit
}) {
    if (!workspace) return;

    const [activeTab, setActiveTab] = useState("search");
    const { hasPermission } = usePermissions();

    const toggleTab = (mode) => {
        setActiveTab(mode);
    };

    return (
        <>
            <Dialog className="z-10" open={show} handler={toggle} size="md">
                <DialogHeader>Users</DialogHeader>
                <DialogBody className="flex flex-col md:flex-row">
                    <div className="flex flex-row gap-2 mb-4 md:flex-col md:mr-4">
                        <Tooltip
                            content="Search for member"
                            className="z-[9999]"
                        >
                            <IconButton
                                onClick={() => {
                                    if (activeTab !== "search") {
                                        toggleTab('search');
                                    }
                                }}
                                size="sm"
                                variant={
                                    activeTab === "search" ? "filled" : "text"
                                }
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
                                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                                    />
                                </svg>
                            </IconButton>
                        </Tooltip>
                        <Tooltip
                            content="Search for users to invite"
                            className="z-[9999]"
                        >
                            <IconButton
                                onClick={() => {
                                    if (activeTab !== "add") {
                                        toggleTab('add');
                                    }
                                }}
                                size="sm"
                                variant={
                                    activeTab === "add" ? "filled" : "text"
                                }
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
                                        d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
                                    />
                                </svg>
                            </IconButton>
                        </Tooltip>
                        <Tooltip
                            content="Manage blacklisted users"
                            className="z-[9999]"
                        >
                            <IconButton
                                onClick={() => {
                                    if (activeTab !== "blacklist") {
                                        toggleTab('blacklist');
                                    }
                                }}
                                size="sm"
                                variant={
                                    activeTab === "blacklist" ? "filled" : "text"
                                }
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none" viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="size-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
                                    />
                                </svg>
                            </IconButton>
                        </Tooltip>
                    </div>
                    <div className="h-full w-full">
                        {activeTab === "search" && <WorkspaceUserSearch
                            toggleRemoveUser={toggleRemoveUser}
                            workspace={workspace}
                            toggleUserEdit={toggleUserEdit}
                        />
                        }
                        {(activeTab === "add" && hasPermission({
                            workspaceRole: workspace.currentUser.role
                        }, 'manage_workspace_users')) &&
                            <WorkspaceUserAdd workspace={workspace} />
                        }
                        {(activeTab === "blacklist" && hasPermission({
                            workspaceRole: workspace.currentUser.role
                        }, 'manage_workspace_users')) &&
                            <WorkspaceBlacklistControl workspaceId={workspace.id} />
                        }
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button variant="outlined" onClick={toggle}>
                        <span>Close</span>
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}

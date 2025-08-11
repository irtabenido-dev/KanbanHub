import BoardArchiveManagement from "@/Components/board/BoardArchiveManagement";
import Workspace from "@/Components/workspaces/Workspace";
import WorkspaceAdd from "@/Components/workspaces/WorkspaceAdd";
import WorkspaceArchiveManagement from "@/Components/workspaces/WorkspaceArchiveManagement";
import { addWorkspace, removeUser, setWorkspace, updateUserRole } from "@/Features/workspaces/workspacesSlice";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import { Spinner, Typography } from "@material-tailwind/react";
import { useCallback, useEffect, useState, lazy, Suspense, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FixedSizeList as List } from 'react-window';
const WorkspaceRemoveUser = lazy(() => import("@/Components/workspaces/WorkspaceRemoveUser.jsx"));
const WorkspaceUserEdit = lazy(() => import("@/Components/workspaces/WorkspaceUserEdit"));
const WorkspaceUsers = lazy(() => import("@/Components/workspaces/WorkspaceUsers"));
const WorkspaceSetting = lazy(() => import("@/Components/workspaces/WorkspaceSetting"));

export default function Workspaces() {
    const dispatch = useDispatch();
    const { props } = usePage();
    const containerRef = useRef(null);

    const workspaces = useSelector((state) => state.workspaces);
    const [listHeight, setListHeight] = useState(0);

    const WORKSPACE_HEIGHT = 200;

    const [settingModalData, setSettingModalData] = useState({
        show: false,
        workspace: null,
    });

    const [usersModalData, setUsersModalData] = useState({
        show: false,
        workspace: null,
    });

    const [removeUserModalData, setRemoveUserModalData] = useState({
        show: false,
        userId: null,
        workspaceId: null,
        name: "",
        currentRole: "",
    });

    const [userEditModalData, setUserEditModalData] = useState({
        show: false,
        userId: null,
        workspaceId: null,
        name: "",
        role: "",
        currentUserRole: "",
        ownerId: null
    });

    const [boardArchiveManagementModalData, setBoardArchiveManagementModalData] = useState({
        show: false,
        workspaceId: null,
    });

    const toggleSettingModal = useCallback((workspace) => {
        setSettingModalData((prev) => ({
            show: !prev.show,
            workspace: prev.workspace === null ? workspace : null,
        }));
    }, []);

    const toggleUsersModal = useCallback((workspace) => {
        setUsersModalData((prev) => ({
            show: !prev.show,
            workspace: prev.workspace === null ? workspace : null
        }));
    }, []);

    const toggleRemoveUserModal = useCallback((userId, workspaceId, name, currentUserRole) => {
        setUsersModalData((prev) => ({ ...prev, show: !prev.show }));
        setRemoveUserModalData((prev) => ({
            show: !prev.show,
            userId: prev.userId === null ? userId : null,
            workspaceId: prev.workspaceId === null ? workspaceId : null,
            name: prev.name === "" ? name : "",
            currentRole: prev.currentRole === "" ? currentUserRole : "",
        }));

    }, []);


    const toggleUserEditModal = useCallback((userId, workspaceId, name, role, currentUserRole, ownerId) => {
        setUsersModalData((prev) => ({ ...prev, show: !prev.show }));
        setUserEditModalData((prev) => ({
            show: !prev.show,
            userId: prev.userId === null ? userId : null,
            workspaceId: prev.workspaceId === null ? workspaceId : null,
            name: prev.name === "" ? name : "",
            role: prev.role === "" ? role : "",
            currentUserRole: prev.currentUserRole === "" ? currentUserRole : "",
            currentUserId: props.auth.user.id,
            ownerId: ownerId
        }));
    }, [props.auth.user.id]);

    const toggleBoardArchiveManagementModal = useCallback((workspaceId) => {
        setBoardArchiveManagementModalData((prev) => ({
            show: !prev.show,
            workspaceId: prev.workspaceId === null ? workspaceId : null,
        }));
    }, []);

    useEffect(() => {
        const userChannel = window.Echo.private(`App.Models.User.${props.auth.user.id}`);

        userChannel.listen("addWorkspace", (data) => {
            dispatch(addWorkspace(data.workspace));
        });

        userChannel.listen('.workspace.user.role.update', (data) => {
            dispatch(updateUserRole({
                'targetId': data.updatedUserId,
                'workspaceId': data.workspaceId,
                'previousOwnerId': data.previousOwnerId,
                'currentUserId': data.currentUserId,
                'role': data.updatedRole,
                'targetName': data.targetName
            }));
        });

        userChannel.listen('.workspace.user.remove', (data) => {
            dispatch(removeUser({
                'workspaceId': data.workspaceId,
                'userId': parseInt(data.targetUserId),
                'currentUserId': props.auth.user.id
            }));
        });

        userChannel.listen('.board.user.add', (data) => {
            dispatch(updateBoardAccess({
                workspaceId: data.workspaceId,
                boardId: data.boardId,
                hasAccess: data.hasAccess
            }));
        });

        userChannel.listen('.board.user.remove', (data) => {
            dispatch(updateBoardAccess({
                workspaceId: data.workspaceId,
                boardId: data.boardId,
                hasAccess: data.hasAccess
            }));
        });

        return () => {
            userChannel.stopListening("addWorkspace");
            userChannel.stopListening(".workspace.user.role.update");
            userChannel.stopListening(".workspace.user.remove");
            userChannel.stopListening('.board.user.add');
            userChannel.stopListening('.board.user.remove');
        }
    }, [props.auth.user.id, dispatch]);

    useEffect(() => {
        dispatch(setWorkspace(props.workspaces));
    }, [props.workspaces, dispatch]);

    useEffect(() => {
        if (!containerRef.current) return;

        const calculateHeight = () => {
            const container = containerRef.current;
            if (!container) return;

            const containerRect = container.getBoundingClientRect();

            const availableHeight = window.innerHeight - containerRect.top - 5;
            setListHeight(Math.max(400, availableHeight));
        };

        calculateHeight();

        const resizeObserver = new ResizeObserver(calculateHeight);
        resizeObserver.observe(containerRef.current);

        return () => {
            if (containerRef.current) {
                resizeObserver.unobserve(containerRef.current);
            }
        };
    }, []);

    const WorkspaceRow = useCallback(({ index, style }) => {

        const workspace = workspaces[index];
        if (!workspace) return null;

        return (
            <div style={style} className="px-6">
                <Workspace
                    workspace={workspace}
                    key={workspace.id}
                    toggleSettings={toggleSettingModal}
                    toggleUsers={toggleUsersModal}
                    toggleBoardArchive={toggleBoardArchiveManagementModal}
                    currentUserRole={workspace.currentUser.role}
                />
            </div>
        );
    }, [toggleSettingModal, toggleUsersModal, workspaces]);

    return (
        <AuthenticatedLayout>
            <Head title="Workspaces" />
            <div className="px-4">
                <div className="flex flex-row gap-4 mb-4">
                    <Typography variant="h4" color="white">
                        Workspaces
                    </Typography>
                    <WorkspaceAdd />
                    <WorkspaceArchiveManagement />
                </div>
                <div
                    ref={containerRef}
                    className="flex flex-col gap-4">
                    {workspaces.length > 0 ? (
                        <List
                            height={listHeight}
                            itemCount={workspaces.length}
                            itemSize={WORKSPACE_HEIGHT}
                            width="100%"
                            overscanCount={2}
                        >
                            {WorkspaceRow}
                        </List>
                    ) : (
                        <p>No workspaces found.</p>
                    )}
                </div>
            </div>
            <Suspense fallback={<Spinner />}>
                <WorkspaceSetting
                    workspace={settingModalData.workspace}
                    show={settingModalData.show}
                    toggle={toggleSettingModal}
                />
                <WorkspaceUsers
                    workspace={usersModalData.workspace}
                    show={usersModalData.show}
                    toggle={toggleUsersModal}
                    toggleRemoveUser={toggleRemoveUserModal}
                    toggleUserEdit={toggleUserEditModal}
                />
                <WorkspaceRemoveUser
                    currentUserId={props.auth.user.id}
                    workspaceId={removeUserModalData.workspaceId}
                    userId={removeUserModalData.userId}
                    show={removeUserModalData.show}
                    toggle={toggleRemoveUserModal}
                    name={removeUserModalData.name}
                    currentUserRole={removeUserModalData.currentRole}
                />
                <WorkspaceUserEdit
                    show={userEditModalData.show}
                    workspaceId={userEditModalData.workspaceId}
                    name={userEditModalData.name}
                    toggle={toggleUserEditModal}
                    role={userEditModalData.role}
                    currentUserRole={userEditModalData.currentUserRole}
                    currentUserId={userEditModalData.currentUserId}
                    userId={userEditModalData.userId}
                    ownerId={userEditModalData.ownerId}
                />
                <BoardArchiveManagement
                    show={boardArchiveManagementModalData.show}
                    workspaceId={boardArchiveManagementModalData.workspaceId}
                    toggle={toggleBoardArchiveManagementModal}
                />
            </Suspense>
        </AuthenticatedLayout>
    );
}

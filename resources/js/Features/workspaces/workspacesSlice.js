import { createSelector, createSlice } from "@reduxjs/toolkit";

export const workspacesSlice = createSlice({
    name: "workspaces",
    initialState: [],
    reducers: {
        setWorkspace(state, action) {
            return action.payload;
        },
        addWorkspace(state, action) {
            if (!state.some(workspace => workspace.id === action.payload.id)) {
                return [action.payload, ...state];
            }
        },
        removeWorkspace(state, action) {
            return state.filter((workspace) => workspace.id !== action.payload);
        },
        updateWorkspace(state, action) {
            const index = state.findIndex(
                (workspace) => workspace.id === action.payload.id,
            );

            state[index].name = action.payload.name;
        },
        addBoard(state, action) {
            const index = state.findIndex(
                (workspace) => workspace.id === action.payload.workspaceId,
            );

            if (index !== -1) {
                const boardExist = state[index].boards.find((board) => board.id === action.payload.id);

                if (!boardExist) {
                    state[index] = {
                        ...state[index],
                        boards: [action.payload, ...state[index].boards].sort((a, b) =>
                            new Date(b.created_at) - new Date(a.created_at)
                        )
                    }
                }
            }
        },
        removeBoard(state, action) {
            const index = state.findIndex(
                (workspace) => workspace.id === action.payload.workspace_id,
            );
            if (index !== -1) {
                state[index].boards = state[index].boards.filter(
                    (board) => board.id !== action.payload.id,
                );
            }
        },
        removeUser(state, action) {
            const index = state.findIndex((workspace) => workspace.id === action.payload.workspaceId);

            if (index !== -1) {
                if (action.payload.currentUserId === action.payload.userId) {
                    return state.filter((workspace) => workspace.id !== action.payload.workspaceId);
                }

                state[index].users = state[index].users.filter(
                    (user) => user.id !== action.payload.userId
                );
            }
        },
        addUser(state, action) {
            const index = state.findIndex((workspace) => workspace.id === action.payload.workspaceId);

            if (index !== -1) {
                const userExists = state[index].users.find((user) =>
                    user.id === action.payload.user.id
                );

                if (!userExists) {
                    state[index].users.push(action.payload.user);
                }
            }
        },
        updateUserRole(state, action) {
            const index = state.findIndex((workspace) => workspace.id === action.payload.workspaceId);

            if (index !== -1) {
                const targetUser = state[index].users.find((user) =>
                    user.id === action.payload.targetId
                );

                const updatedUsers = state[index].users.map(user => {
                    if (action.payload.role === "owner") {
                        if (user.id === action.payload.previousOwnerId) {
                            return { ...user, role: 'admin' };
                        }

                        if (user.id === action.payload.targetId) {
                            return { ...user, role: 'owner' };
                        }

                        return user;

                    } else {
                        if (user.id === action.payload.targetId) {
                            return { ...user, role: action.payload.role };
                        }

                        return user;
                    }
                });

                if (action.payload.role === 'owner') {
                    const previousOwner = state[index].users.find((user) =>
                        user.id === action.payload.previousOwnerId
                    );

                    state[index] = {
                        ...state[index],
                        owner_name: action.payload.targetName,
                        owner_id: action.payload.targetId,
                        currentUser: {
                            id: state[index].currentUser.id, role: (
                                state[index].currentUser.id === action.payload.previousOwnerId ?
                                    'admin' : action.payload.role
                            )
                        },
                        users: updatedUsers

                    };

                    previousOwner.role = "admin";
                    targetUser.role = action.payload.role;

                } else {
                    if (state[index].currentUser.id !== targetUser.id) {
                        state[index] = {
                            ...state[index],
                            users: updatedUsers
                        };
                    } else {
                        state[index] = {
                            ...state[index],
                            currentUser: {
                                id: state[index].currentUser.id,
                                role: action.payload.role
                            },
                            users: updatedUsers
                        };
                    }

                    targetUser.role = action.payload.role;
                }
            }
        },
        updateBoardAccess(state, action) {
            const workspaceIndex = state.findIndex(ws => ws.id === action.payload.workspaceId);
            if (workspaceIndex === -1) return;

            const workspace = state[workspaceIndex];
            const boardIndex = workspace.boards.findIndex(b => b.id === action.payload.boardId);
            if (boardIndex === -1) return;

            const updatedBoard = {
                ...workspace.boards[boardIndex],
                hasAccess: action.payload.hasAccess
            };

            const updatedBoards = [
                ...workspace.boards.slice(0, boardIndex),
                updatedBoard,
                ...workspace.boards.slice(boardIndex + 1)
            ];

            state[workspaceIndex] = {
                ...workspace,
                boards: updatedBoards
            };
        }
    }
});

export const getWorkspaces = (state) => state.workspaces;

export const selectWorkspaceUsers = (id) =>
    createSelector([getWorkspaces], (workspaces) => {
        const workspace = workspaces.find((workspace) => workspace.id === id);
        const users = workspace?.users || [];
        return users;
    });

export const selectWorkspace = (id) =>
    createSelector([getWorkspaces], (workspaces =>
        workspaces.find((workspace) => workspace.id === id)
    ));

export const {
    addWorkspace,
    removeWorkspace,
    updateWorkspace,
    setWorkspace,
    addBoard,
    removeBoard,
    removeUser,
    addUser,
    updateUserRole,
    updateBoardAccess
} = workspacesSlice.actions;

export default workspacesSlice.reducer;

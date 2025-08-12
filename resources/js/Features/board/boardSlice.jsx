import { createSelector, createSlice } from "@reduxjs/toolkit";

export const boardSlice = createSlice({
    name: "board",
    initialState: {
        board: {},
        users: [],
        lists: [],
    },
    reducers: {
        setBoard(state, action) {
            return {
                ...state,
                board: action.payload
            };
        },
        updateBoardName(state, action) {
            state.board.name = action.payload;
        },
        addBoard(state, action) {
            const existingBoard = state.board.relatedBoards.find(board => board.id === action.payload.id);

            if (!existingBoard) {
                state.board.relatedBoards.unshift(action.payload);
            }
        },
        setUsers(state, action) {
            return {
                ...state,
                users: action.payload
            }
        },
        setLists(state, action) {
            return {
                ...state,
                lists: action.payload
            };
        },
        addList(state, action) {
            state.lists.push(action.payload);
        },
        removeList(state, action) {
            state.lists = state.lists.filter(list => list.id !== action.payload);
        },
        updateListName(state, action) {
            const existingList = state.lists.find(list => list.id === action.payload.id);

            if (existingList) {
                existingList.name = action.payload.name;
            }
        },
        updateListPosition(state, action) {
            const existingList = state.lists.find(list => list.id === action.payload.id);

            if (existingList) {
                existingList.position_number = action.payload.position_number;
            }
        },
        setTasks(state, action) {
            const existingList = state.lists.find(list => list.id === action.payload.listId);
            if (existingList) {
                existingList.tasks = action.payload.tasks;
            }
        },
        addTask(state, action) {
            const existingList = state.lists.find(list => list.id === action.payload.listId);
            if (existingList) {
                existingList.tasks.push(action.payload);
            }
        },
        moveTaskFromList(state, action) {
            if (action.payload.currentListId === action.payload.previousListId) {
                const list = state.lists.find(list => list.id === action.payload.previousListId);
                const taskIndex = list.tasks.findIndex(task => task.id === action.payload.task.id);

                if (taskIndex !== -1) {
                    list.tasks[taskIndex].position_number = action.payload.task.position_number;
                    list.tasks.sort((a, b) => a.position_number - b.position_number);
                }

            } else {
                const previousList = state.lists.find(list => list.id === action.payload.previousListId);
                const currentList = state.lists.find(list => list.id === action.payload.currentListId);

                if (previousList) {
                    previousList.tasks = previousList.tasks.filter(task => task.id !== action.payload.task.id);
                }

                if (!currentList.tasks.find(task => task.id === action.payload.task.id)) {
                    currentList.tasks.push(action.payload.task);
                    currentList.tasks.sort((a, b) => a.position_number - b.position_number);
                }
            }
        },
        updateTaskPosition(state, action) {
            const existingList = state.lists.find(list => list.id === action.payload.listId);
            if (existingList) {
                const taskIndex = existingList.tasks.findIndex(task => task.id === action.payload.task.id);
                if (taskIndex !== -1) {
                    existingList.tasks[taskIndex] = action.payload.task;
                }
            }
        },
        removeTask(state, action) {
            const existingList = state.lists.find(list => list.id === action.payload.listId);

            if (existingList) {
                existingList.tasks = existingList.tasks.filter(task => task.id !== action.payload.id);
            }
        },
        updateTaskTitle(state, action) {
            const existingList = state.lists.find(list => list.id === action.payload.listId);

            if (existingList) {
                const taskIndex = existingList.tasks.findIndex(task => task.id === action.payload.taskId);

                if (taskIndex !== -1) {
                    existingList.tasks[taskIndex].title = action.payload.title;
                }
            }
        },
        updateTaskCompletionStatus(state, action) {
            const existingList = state.lists.find(list => list.id === action.payload.listId);

            if (existingList) {
                const taskIndex = existingList.tasks.findIndex(task => task.id === action.payload.taskId);

                if (taskIndex !== -1) {
                    existingList.tasks[taskIndex].completed = action.payload.completed;
                }
            }
        },
        removeTaskDeadline(state, action) {
            const existingList = state.lists.find(list => list.id === action.payload.listId);

            if (existingList) {
                const taskIndex = existingList.tasks.findIndex(task => task.id === action.payload.taskId);

                if (taskIndex !== -1) {
                    existingList.tasks[taskIndex].deadline = null;
                }
            }
        }
        ,
        updateTaskDeadline(state, action) {
            const existingList = state.lists.find(list => list.id === action.payload.listId);

            if (existingList) {
                const taskIndex = existingList.tasks.findIndex(task => task.id === action.payload.taskId);

                if (taskIndex !== -1) {
                    existingList.tasks[taskIndex].deadline = action.payload.date;
                }
            }
        },
        taskAddUser(state, action) {
            const existingList = state.lists.find(list => list.id === action.payload.listId);

            if (existingList) {
                const taskIndex = existingList.tasks.findIndex(task => task.id === action.payload.taskId);

                if (taskIndex !== -1) {
                    existingList.tasks[taskIndex].users.push(action.payload.user);
                }
            }
        },
        taskRemoveUser(state, action) {
            const existingList = state.lists.find(list => list.id === action.payload.listId);

            if (existingList) {
                const taskIndex = existingList.tasks.findIndex(task => task.id === action.payload.taskId);

                if (taskIndex !== -1) {
                    existingList.tasks[taskIndex].users = existingList.tasks[taskIndex].users.filter(user => user.id !== action.payload.userId);
                }
            }
        },
        taskUpdateDescription(state, action) {
            const existingList = state.lists.find(list => list.id === action.payload.listId);

            if (existingList) {
                const taskIndex = existingList.tasks.findIndex(task => task.id === action.payload.taskId);

                if (taskIndex !== -1) {
                    existingList.tasks[taskIndex].description = action.payload.description;
                }
            }
        },
        boardAddUser(state, action) {
            state.users.push(action.payload.newUser);
        },
        boardRemoveUser(state, action) {
            state.users = state.users.filter((user) => user.id !== action.payload.id);
        },
        boardUpdateUser(state, action) {
            const user = state.users.find((user) => user.id === action.payload.id);
            user.boardRole = action.payload.newRole;
        }
    }
});

const selectBoardState = (state) => state.board;
const selectBoardUsers = (state) => state.board.users;
const selectBoardLists = (state) => state.board.lists;

export const getBoard = createSelector(
    [selectBoardState],
    (board) => board.board
);

export const getUsers = createSelector(
    [selectBoardState],
    (board) => board.users
);


export const getBoardUser = createSelector(
    [selectBoardUsers, (_, id) => id],
    (users, id) => users.find(user => user.id === id)
);

export const getBoardOwner = createSelector(
    [selectBoardUsers],
    (users) => users.find(user => user.boardRole === 'owner')
);

export const getUserRoles = createSelector(
    [selectBoardUsers, (_, userId) => userId],
    (users, userId) => {
        const user = users.find(user => user.id === userId);
        return {
            workspaceRole: user?.workspaceRole,
            boardRole: user?.boardRole
        };
    }
);

export const getTask = createSelector(
    [
        selectBoardLists,
        (_, listId) => listId,
        (_, __, taskId) => taskId,
    ],
    (lists, listId, taskId) => {
        const list = lists.find(list => list.id === listId);
        return list?.tasks.find(task => task.id === taskId);
    }
);

export const {
    setBoard,
    setUsers,
    setLists,
    setTasks,
    addList,
    addBoard,
    addTask,
    removeList,
    removeTask,
    updateBoardName,
    updateListName,
    updateListPosition,
    updateTaskPosition,
    moveTaskFromList,
    updateTaskTitle,
    updateTaskCompletionStatus,
    updateTaskDeadline,
    removeTaskDeadline,
    taskAddUser,
    taskRemoveUser,
    taskUpdateDescription,
    boardAddUser,
    boardRemoveUser,
    boardUpdateUser
} = boardSlice.actions;

export default boardSlice.reducer;

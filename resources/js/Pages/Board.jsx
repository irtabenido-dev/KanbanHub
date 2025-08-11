import BoardTaskList from "@/Components/board/BoardTaskList";
import BoardTaskListAdd from "@/Components/board/BoardTaskListAdd";
import { Sidebar } from "@/Components/board/Sidebar";
import { addList, addTask, boardAddUser, boardRemoveUser, boardUpdateUser, getBoard, getBoardOwner, getBoardUser, moveTaskFromList, removeList, removeTask, removeTaskDeadline, setBoard, setLists, setTasks, setUsers, taskAddUser, taskRemoveUser, taskUpdateDescription, updateListName, updateListPosition, updateTaskCompletionStatus, updateTaskDeadline, updateTaskPosition, updateTaskTitle, } from "@/Features/board/boardSlice";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { usePage } from "@inertiajs/react";
import { calculateNewPosition, checkIfReposition } from "../Helper/positionHelper.js"
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import BoardTaskModal from "@/Components/board/BoardTaskModal.jsx";
import { setUser } from "@/Features/user/userSlice.js";
import { Inertia } from "@inertiajs/inertia";
import { removeBoard } from "@/Features/workspaces/workspacesSlice.js";

export default function Board() {
    const { props } = usePage();
    const dispatch = useDispatch();
    const taskLists = useSelector(state => state.board.lists);
    const user = props.auth.user;
    const [isDragging, setIsDragging] = useState(false);
    const boardOwner = useSelector(getBoardOwner);

    const boardOwnerRef = useRef(boardOwner);

    const setData = async () => {
        try {
            const boardUsers = await axios.get(route('board.users', props.board.id));
            dispatch(setUsers(boardUsers.data.users));
        } catch (errors) {
            console.log(errors);
        }
    };

    const updateLists = async (updatedList, originalLists, updatedLists) => {
        const data = { id: updatedList.id, position_number: updatedList.position_number };
        dispatch(setLists(updatedLists));
        try {
            await axios.patch(route('taskList.position.update'), data);

            if (checkIfReposition(updatedLists)) {
                reindexList();
            }
        } catch (errors) {
            dispatch(setLists(originalLists));
            console.log(errors.response.data.errors);
        }
    };

    const updateTask = async (sourceListId, destinationListId, updatedTask, updatedSourceTasks, updatedDestinationTasks, originalDestinationTasks, originalSourceTasks) => {

        dispatch(moveTaskFromList({
            previousListId: sourceListId,
            currentListId: destinationListId,
            task: updatedTask
        }));

        try {
            await axios.patch(route('task.position.update'), {
                listId: destinationListId,
                taskId: updatedTask.id,
                position_number: updatedTask.position_number
            });

            if (sourceListId !== destinationListId) {
                dispatch(setTasks({
                    listId: sourceListId,
                    tasks: updatedSourceTasks
                }));

                dispatch(setTasks({
                    listId: destinationListId,
                    tasks: updatedDestinationTasks
                }));
            }

            if (checkIfReposition(updatedDestinationTasks)) {
                reindexTasks(destinationListId);
            }
        } catch (errors) {
            dispatch(setTasks({
                listId: sourceListId,
                tasks: originalSourceTasks
            }));
            dispatch(setTasks({
                listId: destinationListId,
                tasks: originalDestinationTasks
            }));
            console.log(errors.response.data.errors);
        }
    };

    const reindexList = async () => {
        try {
            const response = await axios.post(route('taskList.reIndex'), { id: props.board.id });
            dispatch(setLists(response.data.reIndexedLists));
        } catch (errors) {
            console.log(errors);
        }
    };

    const reindexTasks = async (listId) => {
        console.log(listId);
        try {
            const response = await axios.post(route('tasks.reIndex'), { listId })
            dispatch(setTasks({
                listId: listId,
                tasks: response.data.reIndexedTasks
            }));
        } catch (errors) {
            console.log(errors);
        }
    };

    const handleDragEnd = (result) => {
        setIsDragging(false);
        const { source, destination } = result;

        if (!destination ||
            (source.droppableId === destination.droppableId &&
                source.index === destination.index)) return;

        if (result.type === 'list') {
            const movingList = taskLists[source.index];
            const taskListsClone = Array.from(taskLists);

            taskListsClone.splice(source.index, 1);

            const newPosition = calculateNewPosition(taskListsClone[destination.index - 1] || null, taskListsClone[destination.index] || null);

            const updatedMovingList = {
                ...movingList,
                position_number: newPosition
            }

            taskListsClone.splice(destination.index, 0, updatedMovingList);

            updateLists(updatedMovingList, taskLists, taskListsClone);
        }

        if (result.type === 'task') {
            if (source.droppableId === destination.droppableId) {
                const tasksClone = Array.from(taskLists.find((list) => list.id === source.droppableId).tasks);
                const movingTask = taskLists.find((list) => list.id === source.droppableId).tasks[source.index];

                tasksClone.splice(source.index, 1);

                const newPosition = calculateNewPosition(tasksClone[destination.index - 1] || null, tasksClone[destination.index] || null)

                const updatedMovingTask = {
                    ...movingTask,
                    position_number: newPosition
                };

                tasksClone.splice(destination.index, 0, updatedMovingTask);

                updateTask(
                    source.droppableId, destination.droppableId, updatedMovingTask,
                    tasksClone, tasksClone, Array.from(taskLists.find((list) => list.id === destination.droppableId).tasks),
                    Array.from(taskLists.find((list) => list.id === source.droppableId).tasks)
                )
            }

            if (source.droppableId !== destination.droppableId) {
                const sourceTasksClone = Array.from(taskLists.find((list) => list.id === source.droppableId).tasks);
                const destinationTasksClone = Array.from(taskLists.find((list) => list.id === destination.droppableId).tasks);

                sourceTasksClone.splice(source.index, 1);

                const movingTask = taskLists.find((list) => list.id === source.droppableId).tasks[source.index];

                const newPosition = calculateNewPosition(
                    destinationTasksClone[destination.index - 1] || null,
                    destinationTasksClone[destination.index] || null
                );

                const updatedMovingTask = {
                    ...movingTask,
                    listId: destination.droppableId,
                    position_number: newPosition
                };

                destinationTasksClone.splice(destination.index, 0, updatedMovingTask);

                updateTask(
                    source.droppableId, destination.droppableId, updatedMovingTask,
                    sourceTasksClone, destinationTasksClone, Array.from(taskLists.find((list) => list.id === destination.droppableId).tasks),
                    Array.from(taskLists.find((list) => list.id === source.droppableId).tasks)
                );
            }
        }
    };

    const [taskModalData, setTaskModalData] = useState({
        show: false,
        listId: null,
        taskId: null
    });

    const toggleTaskModal = (taskId, listId) => {
        if (!isDragging) {
            setTaskModalData((prev) => ({
                show: !prev.show,
                listId: prev.listId === null ? listId : null,
                taskId: prev.taskId === null ? taskId : null
            }));
        }
    };

    useEffect(() => {
        boardOwnerRef.current = boardOwner;
    }, [boardOwner]);

    useEffect(() => {
        dispatch(setBoard(props.board));
        dispatch(setLists(props.lists));
        dispatch(setUser(user));
        setData();
    }, [props.board, props.lists, dispatch]);

    useEffect(() => {
        const boardChannel = window.Echo.private(`board.${props.board.id}`);

        boardChannel.listen('.board.removed', (data) => {
            dispatch(removeBoard({
                workspace_id: data.workspaceId,
                id: data.boardId
            }));

            Inertia.visit('/workspaces');
        });

        boardChannel.listen('.task.move', (data) => {
            console.log(data);
            if (data.senderId !== user.id) {
                dispatch(moveTaskFromList({
                    previousListId: data.previousListId,
                    currentListId: data.currentListId,
                    task: data.task
                }));
            }
        });

        boardChannel.listen('.task.update.title', (data) => {
            if (data.senderId !== user.id) {
                dispatch(updateTaskTitle({
                    listId: data.listId,
                    taskId: data.taskId,
                    title: data.updatedTitle
                }));
            }
        });

        boardChannel.listen('.task.update.completed', (data) => {
            if (data.senderId !== user.id) {
                dispatch(updateTaskCompletionStatus({
                    listId: data.listId,
                    taskId: data.taskId,
                    completed: data.completed
                }));
            }
        });

        boardChannel.listen('.task.update.description', (data) => {
            if (data.senderId !== user.id) {
                dispatch(taskUpdateDescription({
                    listId: data.listId,
                    taskId: data.taskId,
                    description: JSON.stringify(data.updatedDescription)
                }));
            }
        });

        boardChannel.listen('.task.user.add', (data) => {
            if (data.senderId !== user.id) {
                dispatch(taskAddUser({
                    taskId: data.taskId,
                    user: data.addedUser,
                    listId: data.listId
                }));
            }
        });

        boardChannel.listen('.task.user.remove', (data) => {
            if (data.senderId !== user.id) {
                dispatch(taskRemoveUser({
                    taskId: data.taskId,
                    userId: data.removedUserId,
                    listId: data.listId
                }));
            }
        });

        boardChannel.listen('.board.user.add', (data) => {
            console.log(data);
            if (data.senderId !== user.id) {
                dispatch(boardAddUser({
                    newUser: data.addedUser
                }));
            }
        });

        boardChannel.listen('.board.user.remove', (data) => {
            if (data.senderId !== user.id) {
                dispatch(boardRemoveUser({
                    id: data.userId
                }));
            }
            if (data.userId === user.id) {
                Inertia.visit('/workspaces');
            }
        });

        boardChannel.listen('.board.user.update', (data) => {
            if (data.senderId !== user.id) {

                if (data.newRole === 'owner' && (boardOwnerRef.boardRole === 'owner' &&
                    data.userId === boardOwnerRef.id
                )) {
                    dispatch(boardUpdateUser({
                        id: boardOwnerRef.id,
                        newRole: 'team_leader'
                    }));
                }

                dispatch(boardUpdateUser({
                    id: data.userId,
                    newRole: data.newRole
                }));

            }
        });

        boardChannel.listen('.task.deadline.update', (data) => {
            if (data.senderId !== user.id) {
                dispatch(updateTaskDeadline({
                    listId: data.listId,
                    taskId: data.taskId,
                    date: data.date
                }));
            }
        });

        boardChannel.listen('.task.deadline.remove', (data) => {
            if (data.senderId !== user.id) {
                dispatch(removeTaskDeadline({
                    listId: data.listId,
                    taskId: data.taskId
                }));
            }
        });

        boardChannel.listen('.task.remove', (data) => {
            if (data.senderId !== user.id) {
                dispatch(removeTask({
                    listId: data.listId,
                    taskId: data.taskId
                }));
            }
        });

        boardChannel.listen('.task.restored', (data) => {
            if (data.senderId !== user.id) {
                dispatch(addTask({
                    listId: data.listId,
                    task: data.task
                }));
            }
        });

        boardChannel.listen('.list.update', (data) => {
            if(data.senderId !== user.id){
                dispatch(updateListName({
                    id: data.listId,
                    name: data.updatedListName
                }));
            }
        });

        boardChannel.listen('.list.remove', (data) => {
            if(data.senderId !== user.id){
                dispatch(removeList(data.listId));
            }
        });

        boardChannel.listen('.list.restored', (data) => {
            if(data.senderId !== user.id){
                dispatch(addList(data.list));
            }
        });

        return () => {
            boardChannel.stopListening('board.removed');
            boardChannel.stopListening(".task.move");
            boardChannel.stopListening(".task.update.title");
            boardChannel.stopListening(".task.update.completed");
            boardChannel.stopListening(".task.update.description");
            boardChannel.stopListening(".task.user.add");
            boardChannel.stopListening(".task.user.remove");
            boardChannel.stopListening(".task.deadline.update");
            boardChannel.stopListening(".task.deadline.remove");
            boardChannel.stopListening(".board.user.add");
            boardChannel.stopListening(".board.user.remove");
            boardChannel.stopListening(".board.user.update");
            boardChannel.stopListening(".list.update");
            boardChannel.stopListening(".list.remove");
            boardChannel.stopListening(".list.restored");
        }

    }, [user, boardOwner]);

    return (
        <AuthenticatedLayout>
            <div className="flex flex-row ">
                <Sidebar />
                <div
                    className="block p-12 w-full h-[calc(100vh-5rem)]"
                >
                    <div
                        className="flex flex-row h-full overflow-x-scroll"
                    >
                        <DragDropContext onDragStart={() => setIsDragging(true)} onDragEnd={handleDragEnd}>
                            <Droppable
                                droppableId="all-lists"
                                direction="horizontal"
                                type="list"
                            >
                                {(provided) => (
                                    <div
                                        className="flex flex-row"
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                    >
                                        {taskLists.map((list, index) => (
                                            <Draggable
                                                key={list.id}
                                                draggableId={list.id}
                                                index={index}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                    >
                                                        <BoardTaskList
                                                            key={list.id}
                                                            index={index}
                                                            list={list}
                                                            toggleTaskModal={toggleTaskModal}
                                                        />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                        {(props.board.boardRole !== 'member' || props.board.workspaceRole !== 'member') &&
                            <BoardTaskListAdd />
                        }
                    </div>
                </div>
            </div>
            <BoardTaskModal show={taskModalData.show} listId={taskModalData.listId} taskId={taskModalData.taskId} toggle={toggleTaskModal} />
        </AuthenticatedLayout>
    );
}

import { getBoard, getTask, taskAddUser, taskRemoveUser } from "@/Features/board/boardSlice";
import { Typography } from "@material-tailwind/react";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { autoUpdate, flip, offset, shift, useFloating } from "@floating-ui/react";

export default function BoardTaskUsers({ taskId, listId, setActivities }) {
    if (!taskId || !listId) return;

    const dispatch = useDispatch();
    const { workspaceRole, boardRole } = useSelector(getBoard);
    const [availableBoardMembers, setAvailableBoardMembers] = useState([]);
    const taskUsers = useSelector(state => getTask(state, listId, taskId)).users;
    const boardUsers = useSelector(state => state.board.users);
    const [show, setShow] = useState(false);
    const taskUsersRef = useRef();

    const toggle = () => {
        setShow((prev) => !prev);
    }
    const { x, y, strategy, refs } = useFloating({
        placement: "bottom-start",
        middleware: [offset(6), flip(), shift({ padding: 5 })],
        whileElementsMounted: autoUpdate
    });

    const initialsForPicture = (name) => {
        const nameParts = name.split(' ');
        let initials = '';

        for (let i = 0; i < nameParts.length; i++) {
            initials += nameParts[i].charAt(0).toUpperCase();
        }

        return initials;
    }

    const submitAddUsertoTask = async (taskId, userId) => {
        try {
            const response = await axios.post(route('task.add.user'), { taskId, userId });
            dispatch(taskAddUser({
                taskId: taskId,
                user: response.data.addedUser,
                listId: listId
            }));

            setActivities(prev => [response.data.activity, ...prev]);

        } catch (errors) {
            console.log(errors);
        }
    }

    const submitRemoveUserFromTask = async (taskId, userId) => {
        try {
            const response = await axios.post(route('task.remove.user'), { taskId, userId });

            dispatch(taskRemoveUser({
                taskId: taskId,
                userId: userId,
                listId: listId
            }))

            setActivities(prev => [response.data.activity, ...prev]);

        } catch (errors) {
            console.log(errors);
        }
    }

    useEffect(() => {
        const filteredMembers = boardUsers?.filter(boardUser => {
            const isTaskMember = taskUsers?.some(taskUser => taskUser.id === boardUser.id);
            const availableMember = boardUser.workspaceRole === 'member' || boardUser.boardRole === 'member';

            return !isTaskMember && availableMember;
        });
        setAvailableBoardMembers(filteredMembers);

    }, [boardUsers, taskUsers]);

    useEffect(() => {
        const handleOutsideClicks = (e) => {
            if (taskUsersRef.current && !taskUsersRef.current.contains(e.target)) {
                setShow(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClicks);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClicks);
        };
    }, [taskUsersRef]);

    return (
        <div
            ref={taskUsersRef}
        >
            <button
                ref={refs.setReference}
                className="flex flex-row items-center gap-1
                bg-gray-400 w-full p-1 justify-center text-blue-gray-800"
                onClick={toggle}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
                <Typography variant="h6">Users</Typography>
            </button>
            <div
                ref={refs.setFloating}
                style={{ position: strategy, top: y ?? 0, left: x ?? 0, minWidth: '18rem',maxWidth: "max-content" }}
                className={`
                mt-2 z-10 ${!show && 'hidden'}
                bg-[#ebe9e9] p-2 rounded-md
                text-blue-gray-800 w-[300px] max-w-[90vw]
                `}
            >
                <div className="flex flex-row justify-between mb-2">
                    <Typography variant="h6" color="blue-gray">Members</Typography>
                    <button
                        onClick={toggle}
                        className="hover:bg-gray-400 rounded-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                {taskUsers?.length !== 0 ?
                    <div>
                        <Typography
                            variant="paragraph"
                            color="blue-gray"
                            className="font-medium"
                        >
                            Task Members
                        </Typography>
                        <div
                            className="flex flex-col gap-1"
                        >
                            {taskUsers?.map((user) => (
                                <div
                                    key={user.id}
                                    onClick={() => {
                                        if (workspaceRole !== 'member' || boardRole !== 'member') {
                                            submitRemoveUserFromTask(taskId, user.id)
                                        }
                                    }}
                                    className={`flex flex-row justify-between items-center p-1 rounded-md
                                    ${(workspaceRole !== 'member' || boardRole !== 'member') && 'hover:bg-gray-300 cursor-pointer'}`}
                                >
                                    <div
                                        className="flex flex-row gap-2 items-center"
                                    >
                                        {!user.profilePicture ?
                                            <div
                                                className="rounded-full size-9 flex
                                            justify-center items-center border bg-gray-400"
                                            >
                                                <Typography
                                                    variant="h6"
                                                    color="blue-gray"
                                                >
                                                    {initialsForPicture(user.name)}
                                                </Typography>
                                            </div>
                                            :
                                            <img className="rounded-full size-9" src={`/storage/${user.profilePicture}`} />
                                        }
                                        <Typography
                                            variant="paragraph"
                                            color="blue-gray"
                                        >
                                            {user.name}
                                        </Typography>
                                    </div>
                                    {(workspaceRole !== 'member' || boardRole !== 'member') &&
                                        <button>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                                            </svg>
                                        </button>
                                    }
                                </div>
                            ))}
                        </div>
                    </div>
                    :
                    <>
                        <Typography
                            variant="small"
                            color="blue-gray"
                        >
                            No users found
                        </Typography>
                    </>
                }
                {(availableBoardMembers.length !== 0 && (workspaceRole !== 'member' || boardRole !== 'member')) &&
                    <div>
                        <Typography
                            variant="paragraph"
                            color="blue-gray"
                            className="font-medium"
                        >
                            Board Members
                        </Typography>
                        <div
                            className="flex flex-col gap-1"
                        >
                            {availableBoardMembers.map((user) => (
                                <div
                                    key={user.id}
                                    onClick={() => submitAddUsertoTask(taskId, user.id)}
                                    className="flex flex-row justify-between items-center
                                    p-1 rounded-md hover:bg-gray-300 cursor-pointer"
                                >
                                    <div
                                        className="flex flex-row gap-2"
                                    >
                                        {!user.profilePicture ?
                                            <div
                                                className="rounded-full size-9 flex
                                            justify-center items-center border bg-gray-400"
                                            >
                                                <Typography
                                                    variant="h6"
                                                    color="blue-gray"
                                                >
                                                    {initialsForPicture(user.name)}
                                                </Typography>
                                            </div>
                                            :
                                            <img className="rounded-full size-9" src={`/storage/${user.profilePicture}`} />
                                        }
                                        <Typography
                                            variant="paragraph"
                                            color="blue-gray"
                                        >
                                            {user.name}
                                        </Typography>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                                    </svg>
                                </div>
                            ))}
                        </div>
                    </div>
                }
            </div>
        </div>
    );
}

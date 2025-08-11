import { taskRemoveUser } from "@/Features/board/boardSlice";
import { Typography } from "@material-tailwind/react";
import axios from "axios";
import { useDispatch } from "react-redux";

export default function BoardTaskUserRemove({ listId, taskId, userId, setActivities }) {
    const dispatch = useDispatch();

    const submit = async () => {
        try {
            const response = await axios.post(route('task.remove.user'), {
                taskId: taskId,
                userId: userId
            });

            dispatch(taskRemoveUser({
                taskId: taskId,
                userId: userId,
                listId: listId
            }));

            setActivities(prev => [response.data.activity, ...prev]);
        } catch (errors) {
            console.log(errors);
        }
    };
    return (
        <>
            <button
                className="flex flex-row items-center gap-1 bg-gray-400 w-full p-1 justify-center text-blue-gray-800"
                onClick={submit}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                </svg>
                <Typography variant="h6">Leave</Typography>
            </button>
        </>
    );
}

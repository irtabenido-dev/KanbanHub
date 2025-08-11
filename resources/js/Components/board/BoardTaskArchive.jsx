import { addTask, getBoard } from "@/Features/board/boardSlice";
import { Button, Card, Typography } from "@material-tailwind/react";
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function BoardTaskArchive() {
    const headers = ['Name', 'From List', 'Archive Date', 'Actions'];
    const [archivedTasks, setArchivedTasks] = useState([]);
    const [processing, setProcessing] = useState(false);
    const dispatch = useDispatch();
    const board = useSelector(getBoard);

    const getAllArchivedTasks = async () => {
        setProcessing(true);
        try {
            const response = await axios.get(route('task.getAllArchived'), {
                params: {
                    boardId: board.id
                }
            });
            setArchivedTasks(response.data.allArchivedTasks || []);
        } catch (errors) {
            console.log(errors);
        } finally {
            setProcessing(false);
        }
    };

    const restore = async (taskId) => {
        setProcessing(true);
        try {
            const response = await axios.patch(route('task.unArchive'), {
                id: taskId
            });
            dispatch(addTask(response.data.restoredTask));
            setArchivedTasks(prev => prev.filter(task => task.id !== taskId));
        } catch (errors) {
            console.log(errors);
        } finally {
            setProcessing(false);
        }
    };

    useEffect(() => {
        getAllArchivedTasks();
    }, []);

    return (
        <div>
            <Card className="h-full overflow-scroll">
                <table className="table-auto text-left">
                    <thead>
                        <tr>
                            {headers.map((head) => (
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
                        {archivedTasks.length > 0 ? (
                            archivedTasks.map((task) => {
                                return (
                                    <tr key={task.id}>
                                        <td className="p-4">
                                            <Typography
                                                variant="small"
                                                color="blue-gray"
                                                className="font-normal"
                                            >
                                                {task.title}
                                            </Typography>
                                        </td>
                                        <td className="p-4">
                                            <Typography
                                                variant="small"
                                                color="blue-gray"
                                                className="font-normal"
                                            >
                                                {task.list.name}
                                            </Typography>
                                        </td>
                                        <td className="p-4">
                                            <Typography
                                                variant="small"
                                                color="blue-gray"
                                                className="font-normal"
                                            >
                                                {dayjs(task.archived_at).format('YYYY-MM-DD')}
                                            </Typography>
                                        </td>
                                        <td className="p-4 flex gap-4">
                                            <Button
                                                variant="filled"
                                                size="sm"
                                                color="blue"
                                                onClick={() => {
                                                    if (!processing) restore(task.id, task.listId);
                                                }}
                                            >
                                                Restore
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td
                                    colSpan={headers.length}
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

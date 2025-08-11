import { removeTask } from "@/Features/board/boardSlice";
import { Button, Dialog, DialogBody, DialogHeader, Typography } from "@material-tailwind/react";
import axios from "axios";
import { useState } from "react";
import { useDispatch } from "react-redux";

export default function BoardTaskArchiveButton({ taskId, toggle, listId }) {
    const [show, setShow] = useState(false);
    const [processing, setProcessing] = useState(false);

    const toggleConfirmation = (e) => {
        e.stopPropagation();
        setShow(prev => !prev);
    };

    const dispatch = useDispatch();

    const archiveTask = async () => {
        setProcessing(true);
        try {
            await axios.patch(route('task.archive'), {
                id: taskId
            });
            dispatch(removeTask({
                listId: listId,
                id: taskId
            }));
        } catch (error) {
            console.log(error);
        } finally {
            setProcessing(false);
            setShow(false);
            toggle();
        }
    };

    return (
        <>
            <span
                className="flex flex-row items-center gap-1 p-2
                mb-2 cursor-pointer hover:bg-gray-300 w-full"
                onClick={(e) => toggleConfirmation(e)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                </svg>
                Archive Task
            </span>
            <Dialog
                open={show}
                handler={toggleConfirmation}
                size="xs"
                animate={{
                    mount: { scale: 1, y: 0 },
                    unmount: { scale: 0.9, y: -100 },
                }}
            >
                <div className="p-4">
                    <DialogHeader className="flex flex-col items-start p-0">
                        <Typography variant="lead" color="red">
                            Confirm Archive Task
                        </Typography>
                        <Typography variant="paragraph">
                            Are you sure you want to archive the task?
                        </Typography>
                    </DialogHeader>
                    <DialogBody>
                        <div className="flex flex-row justify-center">
                            <Button variant="gradient" color="red" className="w-full mr-4" onClick={archiveTask} loading={processing}>
                                <Typography variant="h6">
                                    Confirm
                                </Typography>
                            </Button>
                            <Button variant="outlined" className="w-full" onClick={toggleConfirmation}>
                                <Typography variant="h6">
                                    Cancel
                                </Typography>
                            </Button>
                        </div>
                    </DialogBody>
                </div>
            </Dialog>
        </>
    );
}

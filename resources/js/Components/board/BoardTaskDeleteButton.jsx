import { removeTask } from "@/Features/board/boardSlice";
import { Button, Dialog, DialogBody, DialogHeader, Typography } from "@material-tailwind/react";
import axios from "axios";
import { useState } from "react";
import { useDispatch } from "react-redux";

export default function BoardTaskDeleteButton({ taskId, toggle, listId }) {
    const [show, setShow] = useState(false);
    const [processing, setProcessing] = useState(false);
    const dispatch = useDispatch();

    const toggleConfirmation = (e) => {
        e.stopPropagation();
        setShow(prev => !prev);
    };

    const deleteTask = async () => {
        setProcessing(true);
        try {
            await axios.delete(route('task.delete'), {
                data: {
                    id: taskId
                }
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
                cursor-pointer hover:bg-gray-300 w-full"
                onClick={(e) => toggleConfirmation(e)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
                Delete Task
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
                            Confirm Delete Task
                        </Typography>
                        <Typography variant="paragraph">
                            Are you sure you want to delete the task?
                        </Typography>
                    </DialogHeader>
                    <DialogBody>
                        <div className="flex flex-row justify-center">
                            <Button variant="gradient" color="red" className="w-full mr-4" onClick={deleteTask} loading={processing}>
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

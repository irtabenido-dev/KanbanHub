import {
    ListItem,
    ListItemPrefix,
    Dialog,
    DialogHeader,
    DialogBody,
    Button,
} from "@material-tailwind/react";
import { useState } from "react";
import BoardListArchive from "./BoardListArchive";
import BoardTaskArchive from "./BoardTaskArchive";

export default function BoardTaskListArchiveManagement() {
    const [mode, setMode] = useState('lists');
    const [show, setShow] = useState(false);
    const toggle = () => {
        setShow(prev => !prev);
    };
    const toggleMode = (mode) => {
        setMode(mode);
    };

    return (
        <>
            <ListItem className="text-[#E6E6E6]"
                onClick={toggle}
            >
                <ListItemPrefix>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                    </svg>
                </ListItemPrefix>
                Archives
            </ListItem>
            <Dialog
                open={show}
                handler={toggle}
                size='lg'
                animate={{
                    mount: { scale: 1, y: 0 },
                    unmount: { scale: 1, y: 100 }
                }}
            >
                <DialogHeader>Board Archives</DialogHeader>
                <DialogBody>
                    <div className="flex w-full mb-4 gap-4">
                        <Button
                            variant={mode === "lists" ? "filled" : "text"}
                            onClick={() => { toggleMode('lists') }}
                        >
                            Lists
                        </Button>
                        <Button
                            variant={mode === "tasks" ? "filled" : "text"}
                            onClick={() => { toggleMode('tasks') }}
                        >
                            Tasks
                        </Button>
                    </div>

                    {mode === "lists" ?
                        <BoardListArchive />
                    :
                        <BoardTaskArchive />
                    }

                </DialogBody>
            </Dialog>
        </>
    );
}

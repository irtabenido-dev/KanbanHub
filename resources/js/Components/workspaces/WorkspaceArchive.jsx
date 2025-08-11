
import { useCallback, useState } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    Typography,
} from "@material-tailwind/react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { removeWorkspace } from "@/Features/workspaces/workspacesSlice";

export default function WorkspaceArchive({ workspace, toggle }) {
    const dispatch = useDispatch();
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const toggleArchive = useCallback(() => {
        setIsArchiveModalOpen((prev) => !prev);
    }, []);

    const submit = useCallback(async () => {
        setProcessing(true);
        try {
            const response = await axios.patch(route('workspace.archive', workspace.id));
            dispatch(removeWorkspace(response.data.id));
            setProcessing(false);
            toggleArchive();
            toggle();
        } catch (error) {
            console.log(error);
            setProcessing(false);
        }
    }, [toggleArchive]);

    return (
        <div className="mb-4">
            <Typography variant="h6" color="black">
                Archive Workspace
            </Typography>
            <Typography className="mb-2" variant="paragraph" color="black">
                Archiving this workspace will also archive all data associated with it
            </Typography>
            <Button size="sm" variant="outlined" color="black" className="w-full block mx-auto" onClick={toggleArchive}>
                <Typography variant="h6" className="flex justify-center items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                    </svg>
                    Archive Workspace
                </Typography>
            </Button>
            <Dialog
                open={isArchiveModalOpen}
                handler={toggleArchive}
                size="xs"
                animate={{
                    mount: { scale: 1, y: 0 },
                    unmount: { scale: 0.9, y: -100 },
                }}
            >
                <div className="p-4">
                    <DialogHeader className="flex flex-col items-start p-0">
                        <Typography variant="lead" color="red">
                            Confirm Archive
                        </Typography>
                        <Typography variant="paragraph">
                            Are you sure you want to Archive the workspace?
                        </Typography>
                    </DialogHeader>
                    <DialogBody>
                        <div className="flex flex-row justify-center">
                            <Button variant="gradient" color="red" className="w-full mr-4" onClick={submit} loading={processing}>
                                <Typography variant="h6">
                                    Confirm
                                </Typography>
                            </Button>
                            <Button variant="outlined" className="w-full" onClick={toggleArchive}>
                                <Typography variant="h6">
                                    Cancel
                                </Typography>
                            </Button>
                        </div>
                    </DialogBody>
                </div>
            </Dialog>
        </div>
    );
}

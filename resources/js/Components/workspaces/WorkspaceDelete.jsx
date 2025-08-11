
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

export default function WorkspaceDelete({ workspace, toggle }) {
    const dispatch = useDispatch();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const toggleDelete = useCallback(() => {
        setIsDeleteModalOpen((prev) => !prev);
    }, []);

    const submit = useCallback(async () => {
        setProcessing(true);
        try {
            const response = await axios.delete(route('workspace.destroy', workspace.id));
            dispatch(removeWorkspace(response.data.id));
            setProcessing(false);
            toggleDelete();
            toggle();
        } catch (error) {
            console.log(error.response.data.errors);
            setProcessing(false);
        }
    }, [toggleDelete]);

    return (
        <>
            <Typography variant="h6" color="red">
                Delete Workspace
            </Typography>
            <Typography className="mb-2" variant="paragraph" color="black">
                Deleting this workspace will also delete all data associated with it
            </Typography>
            <Button size="sm" variant="gradient" color="red" className="w-full block mx-auto " onClick={toggleDelete}>
                <Typography variant="h6" className="flex justify-center items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                    Delete Workspace
                </Typography>
            </Button>
            <Dialog
                open={isDeleteModalOpen}
                handler={toggleDelete}
                size="xs"
                animate={{
                    mount: { scale: 1, y: 0 },
                    unmount: { scale: 0.9, y: -100 },
                }}
            >
                <div className="p-4">
                    <DialogHeader className="flex flex-col items-start p-0">
                        <Typography variant="lead" color="red">
                            Confirm Deletion
                        </Typography>
                        <Typography variant="paragraph">
                            Are you sure you want to delete the workspace?
                        </Typography>
                    </DialogHeader>
                    <DialogBody>
                        <div className="flex flex-row justify-center">
                            <Button variant="gradient" color="red" className="w-full mr-4" onClick={submit} loading={processing}>
                                <Typography variant="h6">
                                    Confirm
                                </Typography>
                            </Button>
                            <Button variant="outlined" className="w-full" onClick={toggleDelete}>
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

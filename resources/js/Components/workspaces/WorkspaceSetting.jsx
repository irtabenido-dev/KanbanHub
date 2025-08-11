import { useCallback, useEffect, useState } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Typography,
} from "@material-tailwind/react";
import TextInput from "../ui/TextInput";
import InputLabel from "../ui/InputLabel";
import InputError from "../ui/InputError";
import { useDispatch, useSelector } from "react-redux";
import { selectWorkspace, updateWorkspace } from "@/Features/workspaces/workspacesSlice";
import axios from "axios";
import InputSuccess from "../ui/InputSuccess";
import WorkspaceDataManagement from "./WorkspaceDataManagement";

export default function WorkspaceSetting({ workspace, show, toggle }) {
    const dispatch = useDispatch();

    const [successMessage, setSuccessMessage] = useState(null);

    const [errors, setErrors] = useState(null);
    const [processing, setProcessing] = useState(false);

    const currentWorkspace = useSelector((state) => selectWorkspace(workspace?.id)(state));

    const [data, setData] = useState({
        id: currentWorkspace?.id ,
        name: currentWorkspace?.name
    });

    const reset = useCallback(() => {
        setData({
            id: currentWorkspace.id,
            name: currentWorkspace.name
        })
    }, [currentWorkspace]);


    const submit = useCallback(async () => {
        setErrors(null);
        setProcessing(true);
        setSuccessMessage('');
        try {
            await axios.patch(route('workspace.update', workspace.id), data);
            setSuccessMessage("Workspace name has been updated!");
            dispatch(updateWorkspace(data));
            setProcessing(false);
        } catch (error) {
            setErrors(error.response.data.errors);
            setProcessing(false);
        }
    }, [data, dispatch]);

    useEffect(() => {
        setData({
            id: workspace?.id,
            name: workspace?.name
        });
        setSuccessMessage('');
        setErrors(null);
    }, [workspace, show]);

    return (
        <>
            <Dialog
                open={show}
                handler={toggle}
                size="xs"
                animate={{
                    mount: { scale: 1, y: 0 },
                    unmount: { scale: 0.9, y: -100 },
                }}
            >
                <DialogHeader>
                    <Typography variant="h4">Workspace Settings</Typography>
                </DialogHeader>
                <DialogBody>
                    <div className="border p-4 rounded-lg mb-4">
                        <InputLabel className="mb-2">
                            <Typography variant="lead" color="black">Name</Typography>
                        </InputLabel>
                        <TextInput className={`w-full text-black ${errors ? 'border-[2px] border-red-500' : ''} mb-2`}
                            type="text" value={data.name}
                            onChange={(e) => setData({ ...data, name: e.target.value })} />
                        {errors && <InputError message={errors.name} />}
                        {successMessage && <InputSuccess message={successMessage} />}
                        <div className="flex flex-row">
                            <Button
                                variant="text"
                                color="red"
                                onClick={reset}
                                className="mr-1">
                                <span>Reset</span>
                            </Button>
                            <Button variant="gradient" color="green" onClick={submit} loading={processing}>
                                <span>Save</span>
                            </Button>
                        </div>
                    </div>
                    <WorkspaceDataManagement workspace={workspace} toggle={toggle} />
                </DialogBody>
                <DialogFooter>
                    <Button variant="outlined" onClick={toggle}>
                        <span>Close</span>
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}

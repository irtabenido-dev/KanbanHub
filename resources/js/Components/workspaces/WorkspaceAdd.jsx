import {useCallback, useState} from "react";
import {
    IconButton,
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Typography, Tooltip,
} from "@material-tailwind/react";
import TextInput from "../ui/TextInput";
import InputLabel from "../ui/InputLabel";
import InputError from "../ui/InputError";
import {useDispatch} from "react-redux";
import {addWorkspace} from "@/Features/workspaces/workspacesSlice";
import axios from "axios";

export default function WorkspaceAdd() {
    const dispatch = useDispatch();
    const [showModal, setShowModal] = useState(false);
    const [data, setData] = useState({
        name: ''
    });
    const [errors, setErrors] = useState(null);
    const [processing, setProcessing] = useState(false);

    const reset = useCallback(()=>{
        setData({name: ''});
    }, []);

    const toggle = useCallback(()=>{
        reset();
        setProcessing(false);
        setShowModal((prev) => !prev);
    }, [reset]);

    const submit = useCallback(async () => {
        setErrors(null);
        setProcessing(true);
        try {
          const response = await axios.post(route('workspace.store', data));
          dispatch(addWorkspace(response.data.workspace));
          toggle();
        } catch (error) {
          setErrors(error.response?.data?.errors);
          setProcessing(false);
        }
      }, [data, dispatch, toggle]);

    return (
        <>
            <Tooltip content="Create Workspace">
                <IconButton onClick={toggle} variant="filled" size="sm" className="hover:scale-125">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                         stroke="white" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                    </svg>
                </IconButton>
            </Tooltip>
            <Dialog
                open={showModal}
                handler={toggle}
                size="xs"
                animate={{
                    mount: {scale: 1, y: 0},
                    unmount: {scale: 0.9, y: -100},
                }}
            >
                <DialogHeader>Create Workspace</DialogHeader>
                <DialogBody>
                    <InputLabel className="mb-2">
                        <Typography className="font-bold" variant="h5" color="black">Name</Typography>
                    </InputLabel>
                    <TextInput
                        className={`w-full text-black ${errors ? 'border-[2px] border-red-500' : ''} mb-2`}
                        type="text"
                        value={data.name} onChange={(e) => setData({...data, name: e.target.value})}/>
                    {errors && <InputError message={errors.name}/>}
                </DialogBody>
                <DialogFooter>
                    <Button
                        variant="text"
                        color="red"
                        onClick={toggle}
                        className="mr-4">
                        <span>Cancel</span>
                    </Button>
                    <Button variant="gradient" color="green" onClick={submit} loading={processing}>
                        <span>Create</span>
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}

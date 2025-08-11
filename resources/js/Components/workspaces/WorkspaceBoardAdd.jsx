import { useCallback, useState } from "react";
import {
    Button,
    Tooltip,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    IconButton,
    Typography
} from "@material-tailwind/react";
import InputLabel from "@/Components/ui/InputLabel.jsx";
import TextInput from "@/Components/ui/TextInput.jsx";
import InputError from "@/Components/ui/InputError.jsx";
import { addBoard as addBoardFromWorkspacePage } from "@/Features/workspaces/workspacesSlice.js";
import { addBoard as addBoardFromBoardPage } from "@/Features/board/boardSlice";
import { useDispatch } from "react-redux";

export default function WorkspaceBoardAdd({ workspaceId, type }) {
    const [data, setData] = useState({
        name: '',
        private: false
    });
    const [showModal, setShowModal] = useState(false);
    const [errors, setErrors] = useState(null);
    const [processing, setProcessing] = useState(false);
    const dispatch = useDispatch();

    const reset = useCallback(() => {
        setData({
            name: '',
            private: false
        });
    }, []);

    const toggle = useCallback(() => {
        reset();
        setProcessing(false);
        setShowModal((prev) => !prev);
    }, [reset]);


    const submit = useCallback(async () => {
        setErrors(null);
        setProcessing(true);

        const submitData = {
            workspaceId: workspaceId,
            name: data.name,
            private: data.private
        };

        try {
            const response = await axios.post(route('board.store', submitData));

            if (type === "workspace") {
                dispatch(addBoardFromWorkspacePage(response.data.board));
            };

            if (type === "board") {
                dispatch(addBoardFromBoardPage(response.data.board));
            };
            reset();
            toggle();
        } catch (error) {
            setErrors(error.response.data.errors);
            setProcessing(false);
        }

    }, [workspaceId, data.name, dispatch, toggle]);

    return (
        <>
            <Tooltip content='Create Board'>
                <IconButton
                    onClick={toggle}
                    variant="text"
                    size="sm"
                    className="hover:scale-125">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                    </svg>
                </IconButton>
            </Tooltip>
            <Dialog
                open={showModal}
                handler={toggle}
                size='xs'
                animate={{
                    mount: { scale: 1, y: 0 },
                    unmount: { scale: 1, y: 100 }
                }}
            >
                <DialogHeader>Create Board</DialogHeader>
                <DialogBody>
                    <InputLabel className="mb-2">
                        <Typography variant="lead" color="black">
                            Name
                        </Typography>
                    </InputLabel>
                    <TextInput
                        className={`w-full text-black ${errors ? 'border-[2px] border-red-500' : ''} mb-2`}
                        type="text" value={data.name}
                        onChange={(e) => setData({ ...data, name: e.target.value })}
                    />
                    {errors && <InputError message={errors.name} />}
                    <InputLabel className="mb-2">
                        <Typography variant="small">
                            Set to private?
                            <input className="ml-2" type="checkbox" checked={data.private} onChange={() => setData({ ...data, private: !data.private })} />
                        </Typography>
                    </InputLabel>
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

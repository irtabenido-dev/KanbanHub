import { addWorkspace } from "@/Features/workspaces/workspacesSlice";
import { Button, Card, Dialog, DialogBody, DialogFooter, DialogHeader, IconButton, Tooltip, Typography } from "@material-tailwind/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

export default function WorkspaceArchiveManagement() {
    const [show, setShow] = useState(false);
    const headers = ["Name", "Archived Date", "Action"];
    const [archivedWorkspace, setArchivedWorkspace] = useState([]);
    const dispatch = useDispatch();
    const toggle = () => {
        setShow((prev) => !prev);
    }

    const getArchivedWorkspaces = async () => {
        try {
            const response = await axios.get(route('workspaces.archived'));
            setArchivedWorkspace(response.data.workspaces);
        } catch (errors) {
            console.log(errors);
        }
    };

    const restore = async (workspaceId) => {
        try{
            const response = await axios.patch(route('workspace.unarchive', workspaceId));
            dispatch(addWorkspace(response.data?.restoredWorkspace));
            getArchivedWorkspaces();
        }catch(errors){
            console.log(errors);
        }
    };

    useEffect(() => {
        getArchivedWorkspaces();
    }, [show]);

    return (
        <>
            <Tooltip content="Workspace Archive">
                <IconButton onClick={toggle} className="hover:scale-125" variant="filled" size="sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                    </svg>
                </IconButton>
            </Tooltip>
            <Dialog
                open={show}
                handler={toggle}
                size="xs"
                animate={{
                    mount: { scale: 1, y: 0 },
                    unmount: { scale: 0.9, y: -100 },
                }}
            >
                <DialogHeader>Workspace Archive</DialogHeader>
                <DialogBody>
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
                                {archivedWorkspace.length > 0 ?
                                    (archivedWorkspace.map((workspace, index) => {
                                        return (
                                            <tr key={index}>
                                                <td className="p-4">
                                                    <Typography
                                                        variant="small"
                                                        color="blue-gray"
                                                        className="font-normal"
                                                    >
                                                        {workspace?.name}
                                                    </Typography>
                                                </td>
                                                <td className="p-4">
                                                    <Typography
                                                        variant="small"
                                                        color="blue-gray"
                                                        className="font-normal"
                                                    >
                                                        {workspace?.archived_at}
                                                    </Typography>
                                                </td>
                                                <td>
                                                    <Button onClick={()=>{
                                                        restore(workspace?.id)
                                                    }} size="sm" color="green">
                                                        Restore
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    }))
                                    :
                                    (
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
                                        </tr>)
                                }
                            </tbody>
                        </table>
                    </Card>
                </DialogBody >
                <DialogFooter>
                    <Button variant="outlined" onClick={toggle}>Close</Button>
                </DialogFooter>
            </Dialog >
        </>
    );
}

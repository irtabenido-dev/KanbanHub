import { addBoard } from "@/Features/workspaces/workspacesSlice";
import { Button, Card, Dialog, DialogBody, DialogFooter, DialogHeader, Spinner, Typography } from "@material-tailwind/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

export default function BoardArchiveManagement({ toggle, show, workspaceId }) {
    const [archivedBoards, setArchivedBoards] = useState([]);
    const dispatch = useDispatch();
    const headers = ["Name", "Archived Date", "Action"];
    const [processing, setProcessing] = useState(false);

    const getArchivedBoards = async () => {
        if (!workspaceId) return;
        try {
            const response = await axios.get(route('board.archived', workspaceId));
            setArchivedBoards(response.data.archivedBoards);
        } catch (errors) {
            console.log(errors);
        }
    }

    const restore = async (boardId) => {
        setProcessing(true);
        try {
            const response = await axios.patch(route('board.unarchive', boardId));
            dispatch(addBoard(response.data.restoredBoard));
            setProcessing(false);
            toggle();
        } catch (errors) {
            setProcessing(false);
            console.log(errors);
        }
    }

    useEffect(() => {
        getArchivedBoards();
    }, [show, workspaceId]);

    if(processing){
        return <Spinner className="m-auto" />
    }

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
                <DialogHeader>Board Archive</DialogHeader>
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
                                {archivedBoards.length > 0 ?
                                    (archivedBoards.map((board, index) => {
                                        return (
                                            <tr key={index}>
                                                <td className="p-4">
                                                    <Typography
                                                        variant="small"
                                                        color="blue-gray"
                                                        className="font-normal"
                                                    >
                                                        {board?.name}
                                                    </Typography>
                                                </td>
                                                <td className="p-4">
                                                    <Typography
                                                        variant="small"
                                                        color="blue-gray"
                                                        className="font-normal"
                                                    >
                                                        {board?.archived_at}
                                                    </Typography>
                                                </td>
                                                <td>
                                                    <Button onClick={() => {
                                                        restore(board?.id)
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
                </DialogBody>
                <DialogFooter>
                    <Button variant="outlined" onClick={toggle}>Close</Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}

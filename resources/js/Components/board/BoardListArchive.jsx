import { useDispatch, useSelector } from "react-redux";
import { Card, Typography, Button } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { addList } from "@/Features/board/boardSlice";

export default function BoardListArchive() {
    const headers = ['Name', 'Archive Date', 'Actions'];
    const [archivedLists, setArchivedLists] = useState([]);
    const board = useSelector(state => state.board.board);
    const [processing, setProcessing] = useState(false);
    const dispatch = useDispatch();

    const getArchivedLists = async () => {
        try {
            const response = await axios.get(route('taskList.get.archived'), {
                params: {
                    boardId: board.id
                }
            });
            setArchivedLists(response.data.archivedLists);
        } catch (errors) {
            console.log(errors);
        }
    };

    const restore = async (id) => {
        setProcessing(true);
        try {
            const response = await axios.patch(route('taskList.unArchive'), { id: id });
            dispatch(addList(response.data.restoredList));
            setArchivedLists(archivedLists.filter(list => list.id !== id));
            setProcessing(false);
        } catch (errors) {
            console.log(errors);
            setProcessing(false);
        }
    };

    useEffect(() => {
        getArchivedLists();
    }, [board]);

    return (
        <div>
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
                        {archivedLists.length > 0 ? (
                            archivedLists.map((list) => {
                                return (
                                    <tr key={list.id}>
                                        <td className="p-4">
                                            <Typography
                                                variant="small"
                                                color="blue-gray"
                                                className="font-normal"
                                            >
                                                {list.name}
                                            </Typography>
                                        </td>
                                        <td className="p-4">
                                            <Typography
                                                variant="small"
                                                color="blue-gray"
                                                className="font-normal"
                                            >
                                                {list.archived_at}
                                            </Typography>
                                        </td>
                                        <td className="p-4 flex gap-4">
                                            <Button
                                                variant="filled"
                                                size="sm"
                                                color="blue"
                                                onClick={()=>{
                                                    if(!processing) restore(list.id);
                                                }}
                                            >
                                                Restore
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
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
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}

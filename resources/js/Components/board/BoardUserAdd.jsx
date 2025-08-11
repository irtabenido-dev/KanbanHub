import { useSelector } from "react-redux";
import { Card, Typography, Spinner } from "@material-tailwind/react";
import { getBoard } from "@/Features/board/boardSlice";
import { useEffect, useState } from "react";
import axios from "axios";
import BoardUserAddRows from "./BoardUserAddRows";

export default function BoardUserAdd({ }) {

    const board = useSelector(getBoard);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [processing, setProcessing] = useState(false);
    const usersHeaders = ["Name", "Email", "Workspace Role", "Board Role", "Action"];

    const getAvailableUsers = async () => {
        setProcessing(true);
        try {
            const response = await axios.get(route('board.availableUsers.get', board.id));
            setAvailableUsers(response.data.availableUsers);
        } catch (errors) {
            console.log(errors);
        } finally {
            setProcessing(false);
        }
    };

    useEffect(() => {
        getAvailableUsers();
    }, []);

    if (processing) {
        return <Spinner className="m-auto" />
    }

    return (
        <div>
            <Card className="h-full overflow-scroll">
                <table className="table-auto text-left">
                    <thead>
                        <tr>
                            {usersHeaders.map((head) => (
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
                    <tbody className={processing ? 'animate-pulse' : ''}>
                        {(availableUsers.length > 0 && processing === false) ? (
                            availableUsers.map((user) => {
                                return (
                                    <BoardUserAddRows user={user} board={board} getAvailableUsers={getAvailableUsers} />
                                );
                            })
                        ) : (
                            <tr>
                                <td
                                    colSpan={usersHeaders.length}
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

import { useSelector } from "react-redux";
import { Card, Typography, IconButton, Spinner } from "@material-tailwind/react";
import { getBoard } from "@/Features/board/boardSlice";
import { useEffect, useState } from "react";
import axios from "axios";

export default function BoardJoinRequestList({ }) {

    const board = useSelector(getBoard);
    const [joinRequests, setJoinRequests] = useState([]);
    const [processing, setProcessing] = useState(false);
    const usersHeaders = ["Name", "Email", "Request Date", "Board Role", "Action"];
    const [role, setRole] = useState('member');

    const getJoinRequests = async () => {
        setProcessing(true);
        try {
            const response = await axios.get(route('board.joinRequests.get', board.id));
            setJoinRequests(response.data.joinRequests);
            setProcessing(false);
        } catch (errors) {
            console.log(errors);
            setProcessing(false);
        }
    };

    const submit = async (joinRequest, accept) => {
        console.log(joinRequest);

        const data = {
            id: joinRequest.id,
            role: role,
            userId: joinRequest.user_id,
            accept: accept
        };

        try {
            const response = await axios.post(route('board.request.response'), data);
            console.log(response.data);

            setJoinRequests(prev => {
                return prev.filter(user => user.id !== data.id);
            });
        } catch (errors) {
            console.log(errors);
        }

    };

    useEffect(() => {
        getJoinRequests();
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
                        {(joinRequests.length > 0 && processing === false) ? (
                            joinRequests.map((request) => {
                                return (
                                    <tr key={request.id}>
                                        <td className="p-4">
                                            <Typography
                                                variant="small"
                                                color="blue-gray"
                                                className="font-normal"
                                            >
                                                {request.name}
                                            </Typography>
                                        </td>
                                        <td className="p-4">
                                            <Typography
                                                variant="small"
                                                color="blue-gray"
                                                className="font-normal"
                                            >
                                                {request.email}
                                            </Typography>
                                        </td>
                                        <td className="p-4">
                                            <Typography
                                                variant="small"
                                                color="blue-gray"
                                                className="font-normal"
                                            >
                                                {request.requested_at}
                                            </Typography>
                                        </td>
                                        <td className="p-4 w-[20%]">
                                            <select
                                                value={role}
                                                className="block w-full mt-1 py-2 px-3 border rounded-md text-left"
                                                onChange={(e) => {
                                                    setRole(e.target.value);
                                                }}
                                            >
                                                <option value="member">Member</option>
                                                <option value="team_leader">Team Leader</option>
                                            </select>
                                        </td>
                                        <td className="p-4">
                                            <IconButton
                                                size="sm"
                                                className="mr-4"
                                                color="blue"
                                                onClick={() => {
                                                    submit(request, true)
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                </svg>
                                            </IconButton>
                                            <IconButton
                                                size="sm"
                                                color="red"
                                                onClick={() => {
                                                    submit(request, false)
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                </svg>
                                            </IconButton>
                                        </td>
                                    </tr>
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

import { Card, Typography, Button } from "@material-tailwind/react";
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

export default function BoardBlacklistControl({ boardId }) {
    const [processing, setProcessing] = useState(false);
    const [blacklistedUsers, setBlacklistedUsers] = useState([]);
    const tableHeaders = ['Name', 'Email', 'Blacklist Date', 'Action'];

    const getBlacklistedUsers = async () => {
        setProcessing(true);
        try {
            const response = await axios.get(route('user.blacklisted'), {
                params: {
                    id: boardId,
                    type: 'board'
                }
            });

            setBlacklistedUsers(response.data.blacklistedUsers);

        } catch (errors) {
            console.log(errors);
        } finally {
            setProcessing(false);
        }
    }

    const removeFromBlacklist = async (id) => {
        setProcessing(true);
        try {
            await axios.delete(route('user.removeUserFromBlacklist'), {
                params: { id }
            });
            setBlacklistedUsers(
                blacklistedUsers.filter(user => user.id !== id)
            );
        } catch (errors) {
            console.log(errors);
        }finally{
            setProcessing(false);
        }
    };

    useEffect(() => {
        getBlacklistedUsers();
    }, [boardId]);

    return (
        <>
            <Card className="h-full w-full overflow-scroll">
                <table className="w-full min-w-max table-auto text-left">
                    <thead>
                        <tr>
                            {tableHeaders.map((head) => (
                                <th
                                    key={head}
                                    className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-normal leading-none opacity-70">
                                        {head}
                                    </Typography>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {blacklistedUsers.length > 0 ? (
                            blacklistedUsers.map(({ id, user, created_at }, index) => (
                                <tr key={index}>
                                    <td className="p-4">
                                        <Typography
                                            variant="small"
                                            color="blue-gray"
                                            className="font-normal"
                                        >
                                            {user.name}
                                        </Typography>
                                    </td>
                                    <td className="p-4">
                                        <Typography
                                            variant="small"
                                            color="blue-gray"
                                            className="font-normal truncate"
                                        >
                                            {user.email}
                                        </Typography>
                                    </td>
                                    <td className="p-4">
                                        <Typography
                                            variant="small"
                                            color="blue-gray"
                                            className="font-normal truncate"
                                        >
                                            {dayjs(created_at).format('MMMM D, YYYY')}
                                        </Typography>
                                    </td>
                                    <td className="p-4">
                                        <Button
                                            loading={processing}
                                            variant="filled"
                                            color="blue"
                                            size="sm"
                                            onClick={(e) => {
                                                removeFromBlacklist(id);
                                            }}>
                                            Remove
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={tableHeaders.length} className="p-4 text-center">
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-normal">
                                        No results found.
                                    </Typography>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>
        </>
    );
}

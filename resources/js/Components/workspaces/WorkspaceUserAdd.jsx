import {
    Card,
    Typography,
} from "@material-tailwind/react";
import debounce from "just-debounce-it";
import { useCallback, useEffect, useState } from "react";
import WorkspaceUserAddRows from "./WorkspaceUserAddRows";

export default function WorkspaceUserAdd({ workspace }) {
    const addTabHeaders = ["Name", "Email", "Role", "Action"];
    const [result, setResult] = useState([]);

    const searchUsers = useCallback(
        debounce(async (e) => {
            if (e.target.value) {
                try {
                    const response = await axios.post(route('user.search', { workspaceId: workspace.id, searchInput: e.target.value }));
                    setResult(response.data.users);
                } catch (error) {
                    console.log(error.response.data.users);
                }
            }
        }, 500), [workspace]
    );

    useEffect(() => {
        return () => searchUsers.cancel();
    }, [searchUsers]);

    return (
        <>
            <input
                className="w-full mb-4 rounded-xl"
                placeholder="Search User"
                type="text"
                onChange={searchUsers}
            />

            <Card className="h-full w-full overflow-scroll">
                <table className="w-full min-w-max table-auto text-left">
                    <thead>
                        <tr>
                            {addTabHeaders.map((head) => (
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
                        {result.length > 0 ? (
                            result.map(({ id, name, email }, index) => {
                                return <WorkspaceUserAddRows key={index} index={index} id={id} name={name} email={email} workspace_id={workspace.id} />
                            })
                        ) : (
                            <tr>
                                <td colSpan={addTabHeaders.length} className="p-4 text-center">
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

import { boardAddUser } from "@/Features/board/boardSlice";
import {
    Typography,
    Button
} from "@material-tailwind/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

export default function BoardUserAddRows({ user, board, getAvailableUsers }) {

    const [blacklisted, setBlacklisted] = useState(false);
    const [userAdded, setUserAdded] = useState(false);
    const [role, setRole] = useState('member');
    const dispatch = useDispatch();

    const submitAddUser = async (userId) => {
        setUserAdded(true);
        try {
            const response = await axios.post(route('board.user.add'), {
                boardId: board.id,
                userId: userId,
                role: role
            });

            dispatch(boardAddUser({
                newUser: response.data.newUser
            }));

            getAvailableUsers();
        } catch (errors) {
            console.log(errors);
        } finally {
            setUserAdded(false);
        }
    };

    const submitBlacklist = async () => {
        try {
            await axios.post(route('user.blacklist'), {
                user_id: user.id,
                blacklistable_id: board.id,
                blacklistable_type: 'App\\Models\\Board'
            });
            setBlacklisted(true);
            getAvailableUsers();
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        setBlacklisted(false);
        setRole('member');
    }, [user.id, role]);

    return (
        <tr key={user.id}>
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
                    className="font-normal"
                >
                    {user.email}
                </Typography>
            </td>
            <td className="p-4">
                <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                >
                    {`${user.workspaceRole.charAt(0).toUpperCase() + user.workspaceRole.slice(1)}`}
                </Typography>
            </td>
            <td className=" w-[20%]">
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
            <td className="flex gap-2 p-4">
                <Button
                    disabled={userAdded}
                    variant="filled"
                    color="blue"
                    size="sm"
                    onClick={() => {
                        submitAddUser(user.id)
                    }}
                >
                    {userAdded ? 'User Added' : 'Add User'}
                </Button>
                <Button
                    disabled={blacklisted}
                    variant="filled"
                    color="gray"
                    size="sm"
                    onClick={() => {
                        submitBlacklist(user.id)
                    }}
                >
                    {blacklisted ? 'Blacklisted' : 'Blacklist'}
                </Button>
            </td>
        </tr>
    );
}

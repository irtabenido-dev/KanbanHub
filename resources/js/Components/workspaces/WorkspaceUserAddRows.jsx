import {
    Typography,
    Button
} from "@material-tailwind/react";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";

export default function WorkspaceUserAddRows({ id, name, email, workspace_id }) {

    const [selectedRole, setSelectedRole] = useState('admin');
    const [invited, setInvited] = useState(false);
    const [blacklisted, setBlacklisted] = useState(false);

    let inviteData = {
        user_id: id,
        workspace_id: workspace_id,
        role: selectedRole
    };

    let blacklistData = {
        user_id: id,
        blacklistable_id: workspace_id,
        blacklistable_type: 'App\\Models\\Workspace'
    }

    const submitInvite = useCallback(async () => {
        try {
            await axios.post(route('user.invite'), inviteData);
            setInvited(true);
        } catch (error) {
            console.log(error);
        }
    }, [id, workspace_id, selectedRole]);

    const submitBlacklist = useCallback(async () => {
        try {
            await axios.post(route('user.blacklist'), blacklistData);
            setBlacklisted(true);
        } catch (error) {
            console.log(error);
        }
    }, [id, workspace_id]);

    useEffect(() => {
        setInvited(false);
        setBlacklisted(false);
        setSelectedRole('admin');
    }, [id]);

    return (
        <tr key={name}>
            <td className="p-4">
                <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                >
                    {name}
                </Typography>
            </td>
            <td className="p-4">
                <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal truncate"
                >
                    {email}
                </Typography>
            </td>
            <td className="p-4">
                <select
                    disabled={invited}
                    className="py-1 rounded-md text-left"
                    onChange={(e) => {
                        setSelectedRole(e.target.value);
                    }}
                >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                </select>
            </td>
            <td className="flex gap-2 p-4">
                {invited ? (
                    <Button disabled variant="filled" color="blue" size="sm">
                        Sent
                    </Button>
                ) : (
                    <Button
                        disabled={blacklisted}
                        variant="filled"
                        color="blue"
                        size="sm"
                        onClick={submitInvite}
                    >
                        Invite
                    </Button>
                )}

                {blacklisted ? (
                    <Button disabled variant="filled" color="gray" size="sm">
                        Blacklisted
                    </Button>
                ) : (
                    <Button
                        disabled={invited}
                        variant="filled"
                        color="gray"
                        size="sm"
                        onClick={submitBlacklist}
                    >
                        Blacklist
                    </Button>
                )}
            </td>
        </tr>
    );
}

import { Dialog, DialogBody, DialogHeader, Typography, Button, DialogFooter } from "@material-tailwind/react";
import InputLabel from "../ui/InputLabel";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, } from "react-redux";
import { updateUserRole } from "@/Features/workspaces/workspacesSlice";
import InputError from "../ui/InputError";

export default function WorkspaceUserEdit({ show, toggle, name, workspaceId, userId, currentUserId, role, currentUserRole, ownerId }) {
    const [data, setData] = useState({
        'previousOwnerId': ownerId,
        'role': 'placeholder',
        'targetId': userId,
        'workspaceId': workspaceId,
        'targetName': name,
        'currentUserId': currentUserId
    });

    const [processing, setProcessing] = useState(false);
    const dispatch = useDispatch();
    const [error, setError] = useState(null);

    const submit = useCallback(async () => {
        setProcessing(true);
        setError(null);

        if (data.role === 'placeholder') {
            setError('Please select a role');
            setProcessing(false);
            return;
        };

        try {
            const response = await axios.patch(route('userRole.update'), data);
            dispatch(updateUserRole({
                'previousOwnerId': ownerId,
                'role': data.role,
                'targetId': userId,
                'workspaceId': workspaceId,
                'targetName': name,
                'currentUserId': currentUserId
            }));
            toggle();
        } catch (error) {
            console.log(error);
            setError(error.response.data.errors.role);
        } finally {
            setProcessing(false);
        }
    }, [dispatch, data, toggle]);

    useEffect(() => {
        setData({
            'previousOwnerId': ownerId,
            'role': 'placeholder',
            'targetId': userId,
            'workspaceId': workspaceId,
            'targetName': name,
            'currentUserId': currentUserId
        });
    }, [workspaceId, ownerId, role, userId, name, currentUserId]);

    return (
        <Dialog
            className="
                z-[9999]
                "
            open={show}
            handler={toggle}
            size="xs"
            animate={{
                mount: { scale: 1, y: 0 },
                unmount: { scale: 0.9, y: -100 },
            }}>
            <DialogHeader className="text-center">
                Edit {currentUserId === userId ? "your" : name} role
            </DialogHeader>
            <DialogBody>
                {currentUserRole === "owner" && userId === currentUserId &&
                    <Typography variant="paragraph">
                        You are currently the owner of the workspace as such you
                        will be unable to change your role unless you assign someone else
                        as the new owner of the workspace
                    </Typography>
                }
                <div className="flex flex-col gap-4">
                    {currentUserRole === "owner" && userId !== currentUserId &&
                        <div className="w-full">
                            <InputLabel>Role</InputLabel>
                            <select
                                value={data?.role}
                                className="block w-full mt-1 py-2 px-3 border rounded-md text-left"
                                onChange={(e) => {
                                    setData({ ...data, role: e.target.value });
                                }}
                            >
                                <option value="placeholder">--Choose Role--</option>
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                                {currentUserRole === "owner" && (
                                    <option value="owner">Owner</option>
                                )}
                            </select>
                        </div>
                    }
                    {error && <InputError message={error} />}
                    <DialogFooter className="flex justify-start gap-4 p-0 mt-4">
                        <Button variant="outlined" size="sm" onClick={toggle}>
                            {currentUserRole === "owner" ? "Back" : "Cancel"}
                        </Button>
                        {currentUserRole === "owner" && userId !== currentUserId &&
                            <Button loading={processing} variant="gradient" color="green" size="sm" onClick={submit}>
                                Save
                            </Button>
                        }
                    </DialogFooter>
                </div>
            </DialogBody>
        </Dialog>
    );
}

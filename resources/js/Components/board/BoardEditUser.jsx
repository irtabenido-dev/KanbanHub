import { Button, Dialog, DialogBody, DialogFooter, DialogHeader, IconButton, Typography } from "@material-tailwind/react";
import { useDispatch, useSelector } from "react-redux";
import InputLabel from "../ui/InputLabel";
import { useEffect, useState } from "react";
import axios from "axios";
import { boardUpdateUser, getBoardOwner } from "@/Features/board/boardSlice";
import InputError from "../ui/InputError";

export default function BoardEditUser({ show, toggle, name, targetId,
    boardId, currentUserBoardRole, currentUserWorkspaceRole
}) {
    const user = useSelector(state => state.user);
    const [processing, setProcessing] = useState(false);
    const [role, setRole] = useState('member');
    const dispatch = useDispatch();
    const [errors, setErrors] = useState([]);
    const boardOwner = useSelector(getBoardOwner);

    const submit = async () => {
        const data = {
            boardId: boardId,
            targetId: targetId,
            role: role
        };
        console.log(data);
        setProcessing(true);
        setErrors([]);
        try {
            await axios.patch(route('board.user.update'), data);
            dispatch(boardUpdateUser({
                id: targetId,
                newRole: role
            }));

            if(role === 'owner' && currentUserWorkspaceRole !== 'member'){
                dispatch(boardUpdateUser({
                    id: boardOwner.id,
                    newRole: 'admin'
                }));
            }

            if (role === 'owner' && currentUserBoardRole === 'owner') {
                dispatch(boardUpdateUser({
                    id: user.id,
                    newRole: 'admin'
                }));
            }
            toggle();
        } catch (errors) {
            setErrors(errors);
            console.log(errors);
        } finally {
            setProcessing(false);
        }
    };

    useEffect(()=>{
        if(show){
            setErrors([]);
        }
    }, [show]);

    return (
        <>
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
                }}
            >
                <DialogHeader>Edit {user.id === targetId ? "your" : name} role</DialogHeader>
                <DialogBody>
                    <div className="w-full">
                        {(currentUserBoardRole === 'owner' && targetId === user.id) ?
                            <Typography
                                variant="paragraph"
                                color="blue-gray"
                            >
                                You are currently the owner of the board to change your role please pass on the ownership of the board to another user
                            </Typography>
                            :
                            <>
                                <InputLabel>Role</InputLabel>
                                <select
                                    value={role}
                                    className="block w-full mt-1 py-2 px-3 border rounded-md text-left"
                                    onChange={(e) => {
                                        setRole(e.target.value);
                                    }}
                                >
                                    <option value="member">Member</option>
                                    <option value="admin">Admin</option>
                                    {
                                        (currentUserBoardRole === "owner" || currentUserWorkspaceRole === "owner") &&
                                        <option value="owner">Owner</option>
                                    }
                                </select>
                                {(role === 'owner' && currentUserWorkspaceRole === 'member')  &&
                                    <Typography
                                        className="mt-1"
                                        variant="paragraph"
                                        color="red"
                                    >
                                        Proceeding with this role assignment will change your role in the board to an Admin
                                    </Typography>
                                }
                            </>
                        }
                        {errors &&
                            <InputError className="mt-2" message={errors?.response?.data?.message} />
                        }
                    </div>
                </DialogBody>
                <DialogFooter>
                    {!(currentUserBoardRole === 'owner' && targetId === user.id) &&
                        <Button
                            loading={processing}
                            variant="gradient"
                            color="green"
                            size="sm"
                            onClick={submit}>
                            Save
                        </Button>
                    }
                    <Button className="ml-4" variant="outlined" size="sm" onClick={toggle}>
                        Back
                    </Button>
                </DialogFooter>
            </Dialog >
        </>
    );
}

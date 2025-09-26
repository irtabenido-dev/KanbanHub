import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import {
    Button,
    Dialog,
    DialogBody,
    DialogFooter,
    DialogHeader,
    Typography,
} from "@material-tailwind/react";
import { removeUser, removeWorkspace } from "@/Features/workspaces/workspacesSlice.js";

export default function WorkspaceRemoveUser({
    currentUserId,
    currentUserRole,
    workspaceId,
    userId,
    name,
    show,
    toggle,
}) {
    const dispatch = useDispatch();

    const submit = useCallback(async () => {
        try {
            await axios.delete(
                route("user.remove", {
                    userId: userId,
                    workspaceId: workspaceId,
                })
            );
            toggle();
            dispatch(removeUser({ userId, workspaceId, currentUserId }));
            if (currentUserId === userId) {
                dispatch(removeWorkspace(workspaceId));
            }
        } catch (error) {
            console.log(error);
        }
    }, [dispatch, userId, workspaceId, currentUserId, toggle]);

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
                <DialogHeader>
                    {currentUserId === userId ? (
                        <Typography variant="h4">Leave Workspace</Typography>
                    ) : (
                        <Typography variant="h4">Remove User</Typography>
                    )}
                </DialogHeader>
                <DialogBody className="flex flex-col gap-4">
                    {currentUserRole === "owner" && currentUserId === userId ? (
                        <Typography variant="paragraph" color="blue-gray">
                            You are currently the{" "}
                            <span className="font-bold">Owner</span> of the
                            workspace. To leave the workspace please assign a
                            new owner.
                        </Typography>
                    ) : currentUserId === userId ? (
                        <Typography variant="paragraph" color="blue-gray">
                            Are you sure you want to leave the workspace?
                        </Typography>
                    ) : (
                        <Typography variant="paragraph" color="blue-gray">
                            Are you sure you want to remove{" "}
                            <span className="font-bold">{name}</span> from the
                            workspace?
                        </Typography>
                    )}
                </DialogBody>
                <DialogFooter className="flex flex-row gap-4 justify-center items-center">
                    {currentUserRole === "owner" && currentUserId === userId ? (
                        <Button variant="filled" onClick={toggle}>
                            Go Back
                        </Button>
                    ) : (
                        <>
                            <Button
                                onClick={submit}
                                variant="filled"
                                color="red"
                            >
                                Confirm
                            </Button>
                            <Button variant="text" onClick={toggle}>
                                Cancel
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </Dialog>
        </>
    );
}

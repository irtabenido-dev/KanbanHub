import { boardRemoveUser } from "@/Features/board/boardSlice";
import { getUser } from "@/Features/user/userSlice";
import { Button, Dialog, DialogBody, DialogFooter, DialogHeader, Typography } from "@material-tailwind/react";
import axios from "axios";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function BoardRemoveUser({ show, name, targetId, toggle, refreshUsers }) {
    const [processing, setProcessing] = useState(false);
    const board = useSelector(state => state.board.board);
    const user = useSelector(getUser);
    const dispatch = useDispatch();
    const submit = async () => {
        setProcessing(true);
        try {
            await axios.delete(route('board.remove.user', {
                targetId: targetId,
                boardId: board.id
            }));
            toggle();
            dispatch(boardRemoveUser({
                id: targetId
            }));
            setProcessing(false);
            refreshUsers();
        } catch (errors) {
            console.log(errors);
            setProcessing(false);
        }
    };

    return (
        <Dialog
            open={show}
            handler={toggle}
            size='sm'
            animate={{
                mount: { scale: 1, y: 0 },
                unmount: { scale: 1, y: 100 }
            }}
        >
            <DialogHeader>
                <Typography
                    variant="h3"
                    color="red"
                >
                   {user.id === targetId ?
                        `Leave board ${board.name}?`
                    :
                        'Remove User'
                    }
                </Typography>
            </DialogHeader>
            <DialogBody>
                <Typography
                    variant="paragraph"
                    color="black"
                    className="text-center"
                >
                    {user.id === targetId ?
                        `Continue to leave the board ${board.name}?`
                    :
                        `Remove ${name} from the board ${board.name}?`
                    }
                </Typography>
            </DialogBody>
            <DialogFooter className="flex gap-4">
                <Button
                    loading={processing}
                    color="red"
                    onClick={submit}
                >
                    {user.id === targetId ?
                        'Leave'
                    :
                        'Remove'
                    }
                </Button>
                <Button
                    variant="outlined"
                    onClick={toggle}
                >
                    Cancel
                </Button>
            </DialogFooter>
        </Dialog>
    );
}

import { Button, Typography } from "@material-tailwind/react";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import InputError from "../ui/InputError";
import { addTask } from "@/Features/board/boardSlice";

export default function BoardTaskAdd({ id }) {
    const dispatch = useDispatch();
    const board = useSelector(state => state.board.board);
    const [errors, setErrors] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const inputRef = useRef(null);
    const [data, setData] = useState({
        boardId: board.id,
        listId: id,
        title: ''
    });

    const reset = () => {
        setData({
            boardId: board.id,
            listId: id,
            title: ''
        });
        setErrors(null);
    };

    const toggle = () => {
        setIsActive((prev) => !prev);
        reset();
    };

    const submit = async () => {
        setProcessing(true);
        try {
            const response = await axios.post(route('task.add'), data);
            dispatch(addTask(response.data.addedTask));
            toggle();
            reset();
            setProcessing(false);
        } catch (errors) {
            console.log(errors);
            setErrors(errors.response.data.errors);
            setProcessing(false);
        }
    };

    useEffect(() => {
        if (isActive && inputRef.current) {
            inputRef.current.focus();
        }
    });

    return (
        <div className="mt-2">
            {!isActive && (
                <Button
                    className="
                flex flex-row justify-center items-center gap-2 bg-gray-300
                hover:bg-gray-100 transition-colors duration-300
                self-start h-auto w-full rounded-md p-1 opacity-80"
                    size="sm"
                    variant="filled"
                    onClick={toggle}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="#333333"
                        className="size-5"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <Typography
                        variant="paragraph"
                        className="font-medium text-gray-900"
                    >
                        Add new task
                    </Typography>
                </Button>
            )}
            {isActive && (
                <div className="
            bg-white rounded-lg h-auto self-start p-2
            border-gray-300"
                >
                    <input
                        ref={inputRef}
                        className="w-full rounded-md mb-2 p-1
                        box-border border-gray-300
                        focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="text"
                        placeholder="Enter task name"
                        value={data.title}
                        onChange={(e) => {
                            setData({ ...data, title: e.target.value })
                        }}
                    />
                    {errors && <InputError message={errors.title} />}
                    <div className="flex flex-row items-center gap-2">
                        <Button
                            loading={processing}
                            onClick={submit}
                            variant="filled"
                            color="blue"
                            className="h-[2rem] w-[4rem] p-0"
                        >
                            Save
                        </Button>
                        <Button
                            onClick={toggle}
                            variant="outlined"
                            color="black"
                            className="h-[2rem] w-[4rem] p-0"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

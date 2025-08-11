import { Button, Typography } from "@material-tailwind/react";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import InputError from "../ui/InputError";
import { addList } from "@/Features/board/boardSlice";

export default function BoardTaskListAdd() {
    const board = useSelector(state => state.board.board);
    const dispatch = useDispatch();
    const [errors, setErrors] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const inputRef = useRef(null);
    const [data, setData] = useState({
        boardId: board.id,
        name: ''
    });

    const reset = () => {
        setData({
            boardId: board.id,
            name: ''
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
            const response = await axios.post(route('taskList.add'), data);
            console.log(response.data.newList);
            dispatch(addList(response.data.newList));
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
        <>
            {!isActive && (
                <Button
                    className="
                    flex flex-row justify-center items-center gap-2 bg-white
                    hover:bg-gray-100 transition-colors duration-300 shadow-md
                    self-start h-auto min-w-[12rem] rounded-md p-1
                    "
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
                        Add a new list
                    </Typography>
                </Button>
            )}
            {isActive && (
                <div className="
                    bg-white rounded-lg p-4 min-w-[12rem] h-auto self-start
                "
                >
                    <input
                        ref={inputRef}
                        className="p-1 rounded-md mb-2"
                        type="text"
                        placeholder="Enter list name"
                        value={data.name}
                        onChange={(e) => {
                            setData({ ...data, name: e.target.value })
                        }}
                    ></input>
                    {errors && <InputError message={errors.name} />}
                    <div className="flex flex-row  items-center gap-2 mt-2">
                        <Button
                            loading={processing}
                            onClick={submit}
                            variant="filled"
                            color="blue"
                            className="h-[2rem] w-[4rem] p-0"
                        >Save</Button>
                        <Button
                            onClick={toggle}
                            variant="outlined"
                            color="black"
                            className="h-[2rem] w-[4rem] p-0"
                        >Cancel</Button>
                    </div>
                </div>
            )}
        </>
    );
}

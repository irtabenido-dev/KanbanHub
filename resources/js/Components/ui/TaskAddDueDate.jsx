import { Typography } from "@material-tailwind/react";
import { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { autoUpdate, flip, offset, shift, useFloating } from "@floating-ui/react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { getUserRoles, removeTaskDeadline, updateTaskDeadline } from "@/Features/board/boardSlice";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { getUser } from "@/Features/user/userSlice";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function TaskAddDueDate({ task, setActivities, sidebar }) {
    const dueDateRef = useRef(null);
    const [show, setShow] = useState(false);
    const [currentDeadline, setCurrentDeadline] = useState(task.deadline ? new Date(task.deadline) : new Date());
    const dispatch = useDispatch();
    const user = useSelector(getUser);
    const {workspaceRole, boardRole} = useSelector(state => getUserRoles(state, user.id));
    const canInteract = (workspaceRole !== 'member' || boardRole !== 'member');
    const toggle = () => {
        setShow(prev => !prev);
    };

    const overdue = dayjs(task.deadline).isBefore(dayjs());

    const { x, y, strategy, refs } = useFloating({
        placement: "bottom-start",
        middleware: [offset(6), flip(), shift({ padding: 5 })],
        whileElementsMounted: autoUpdate
    });

    const submitDate = async () => {
        const deadline = currentDeadline;
        const deadlineUTC = deadline.toISOString().slice(0, 19).replace('T', ' ');
        try {
            const response = await axios.post(route('task.set.dueDate'), {
                taskId: task.id,
                date: deadlineUTC
            });

            toggle();

            dispatch(updateTaskDeadline({
                listId: task.listId,
                taskId: task.id,
                date: deadlineUTC
            }));

            setActivities(prev => [response.data.activity, ...prev]);

        } catch (errors) {
            console.log(errors);
        }
    }

    const removeDueDate = async () => {
        try {
            const response = await axios.delete(route('task.remove.dueDate'), {
                params: {
                    taskId: task.id
                }
            });

            toggle();

            dispatch(removeTaskDeadline({
                listId: task.listId,
                taskId: task.id
            }));

            setActivities(prev => [response.data.activity, ...prev]);

        } catch (errors) {
            console.log(errors);
        }
    }

    useEffect(() => {
        const handleOutsideClicks = (e) => {
            if (dueDateRef.current && !dueDateRef.current.contains(e.target)) {
                setShow(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClicks);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClicks);
        };
    }, [dueDateRef]);

    return (
        <div
            ref={dueDateRef}
            className="mb-2"
        >
            {(sidebar && canInteract) &&
                <button
                    onClick={toggle}
                    ref={refs.setReference}
                    className="flex flex-row items-center gap-1
                bg-gray-400 w-full p-1 justify-center
                text-blue-gray-800"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <Typography
                        variant="h6"
                    >
                        Dates
                    </Typography>
                </button>
            }
            {(!sidebar && task.deadline) &&
                <div>
                    <Typography
                        variant="h6"
                        color="blue-gray"
                    >
                        Due Date
                    </Typography>
                    <button
                        className="bg-[#E5E7EA] p-2 rounded-md flex flex-row gap-2
                        items-baseline"
                        onClick={toggle}
                        ref={refs.setReference}
                        disabled={!(canInteract)}
                    >
                        <Typography
                            variant="small"
                            color="blue-gray"
                        >
                            {dayjs.utc(task.deadline).tz(dayjs.tz.guess()).format('MMMM DD, YYYY hh:mm A')}
                        </Typography>
                        {overdue &&
                            <div
                                className="bg-[#FFECEB] px-1 rounded-sm"
                            >
                                <span
                                    className="text-[#B1372D] text-sm"
                                >
                                    Overdue
                                </span>
                            </div>
                        }
                    </button>
                </div>

            }
            {show && (
                <div
                    ref={refs.setFloating}
                    style={{
                        position: strategy,
                        top: y ?? 0,
                        left: x ?? 0,
                        width: "max-content",
                    }}
                    className="bg-[#ebe9e9] p-2 rounded-md z-10
                    text-blue-gray-800 flex flex-col gap-2"
                >
                    <DatePicker
                        selected={currentDeadline}
                        onChange={(date) => setCurrentDeadline(date)}
                        showTimeInput
                        timeIntervals={30}
                        timeCaption="Time"
                        dateFormat="MMMM d, yyyy h:mm aa"
                        className="min-w-[13rem]"
                        minDate={new Date()}
                    />
                    <button
                        className="rounded-md bg-[#0C66E4] p-1"
                        onClick={submitDate}
                    >
                        <Typography
                            variant="h6"
                            color="white"
                        >
                            Set Due Date
                        </Typography>
                    </button>
                    {task.deadline &&
                        <button
                            className="rounded-md bg-[#b93030] p-1"
                            onClick={removeDueDate}
                        >
                            <Typography
                                variant="h6"
                                color="white"
                            >
                                Remove Due Date
                            </Typography>
                        </button>
                    }
                </div>
            )}
        </div>
    );
}

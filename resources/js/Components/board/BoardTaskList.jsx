import { getBoard, updateListName } from "@/Features/board/boardSlice";
import { Typography } from "@material-tailwind/react";
import axios from "axios";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import InputError from "../ui/InputError";
import TaskListOptions from "./TaskListOptions";
import BoardTaskAdd from "./BoardTaskAdd";
import BoardTaskCard from "./BoardTaskCard";
import { Draggable, Droppable } from "@hello-pangea/dnd";

export default function BoardTaskList({ list, toggleTaskModal }) {
    const dispatch = useDispatch();
    const { workspaceRole, boardRole } = useSelector(getBoard);
    const [nameUpdateData, setNameUpdateData] = useState({
        'id': list.id,
        'name': list.name
    });
    const [errors, setErrors] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [isActiveNameUpdate, setIsActiveNameUpdate] = useState(false);

    const reset = () => {
        setNameUpdateData({
            id: list.id,
            name: list.name
        });
        setErrors(null);
    };

    const toggleNameUpdate = () => {
        if (workspaceRole !== 'member' && boardRole !== 'member') {
            setIsActiveNameUpdate(prev => !prev);
        }
    };

    const submitNameUpdate = async () => {
        if (processing) {
            return;
        }

        if (nameUpdateData.name) {
            if (nameUpdateData.name === list.name) {
                toggleNameUpdate();
                return;
            }
            setProcessing(true);
            try {
                await axios.post(route('taskList.update.name'), nameUpdateData);
                dispatch(updateListName(nameUpdateData));
                toggleNameUpdate();
                setProcessing(false);
                setErrors(null);
            } catch (errors) {
                console.log(errors.response.data.errors);
                setErrors(errors.response.data.errors);
                setProcessing(false);
            }
        } else {
            reset();
            toggleNameUpdate();
        }

    };

    return (
        <div
            className={`bg-[#F1F3F5] mr-2 px-2 py-3 rounded-md
            w-[12rem] h-auto max-h-[calc(100vh-5rem)] self-start`}>
            <div className="flex flex-row items-center
                justify-between gap-2 mb-2">
                <div
                    className="cursor-pointer w-full"
                    onClick={toggleNameUpdate}>
                    {!isActiveNameUpdate &&
                        <Typography
                            className="w-fit"
                            variant="h6">
                            {list.name}
                        </Typography>
                    }
                    <div className="block">
                        {isActiveNameUpdate &&
                            <input
                                autoFocus
                                className="py-0 w-full"
                                type="text"
                                value={nameUpdateData.name}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                    setNameUpdateData({
                                        id: list.id,
                                        name: e.target.value
                                    });
                                }}
                                onBlur={() => {
                                    setNameUpdateData((prev) => ({
                                        ...prev,
                                        name: prev.name.trim(),
                                    }));
                                    submitNameUpdate();
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        setNameUpdateData((prev) => ({
                                            ...prev,
                                            name: prev.name.trim(),
                                        }));
                                        submitNameUpdate();
                                    }

                                    if(e.key === "Escape"){
                                        toggleNameUpdate();
                                    }
                                }}

                            />
                        }
                        {errors && <InputError message={errors.name} />}
                    </div>
                </div>
                {(workspaceRole !== 'member' || boardRole !== 'member') &&
                    <TaskListOptions list={list} />
                }
            </div>
            <Droppable
                droppableId={list.id}
                direction="vertical"
                type="task"
            >
                {(provided) => (
                    <div
                        className="flex flex-col min-h-5"
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                    >
                        {list.tasks && list.tasks.map((task, index) => (
                            <Draggable
                                key={task.id}
                                draggableId={task.id}
                                index={index}
                            >
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                    >
                                        <BoardTaskCard key={task.id} toggleTaskModal={toggleTaskModal} task={task} index={index} />
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
            {(workspaceRole !== 'member' || boardRole !== 'member') &&
                <BoardTaskAdd id={list.id} />
            }
        </div>
    );
}

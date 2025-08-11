import {
    Card,
    CardBody,
    Typography,
} from "@material-tailwind/react";
import dayjs from "dayjs";

export default function BoardTaskCard({ toggleTaskModal, task }) {
    const isOverdue = dayjs(task?.deadline).isBefore(dayjs());

    return (
        <div
            className={`mb-2 cursor-pointer`}
            onClick={() => toggleTaskModal(task.id, task.listId)}
        >
            <Card className={`p-0 ${(isOverdue && !task.completed) && 'border border-red-500 bg-red-50 text-red-600'}
            ${task.completed && 'bg-green-50 text-green-700'}`}>
                <CardBody className="flex flex-row justify-between items-center p-1">
                    <Typography variant="paragraph">
                        {task.title}
                    </Typography>
                    {(isOverdue && !task.completed) &&
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                            </svg>
                        </div>
                    }
                    {task.completed &&
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    }
                </CardBody>
            </Card>
        </div>
    );
}

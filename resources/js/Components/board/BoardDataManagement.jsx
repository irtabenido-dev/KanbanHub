import { Typography } from "@material-tailwind/react";
import BoardArchive from "./BoardArchive";
import BoardDelete from "./BoardDelete";

export default function BoardDataManagement() {

    return (
        <div className="border flex flex-col gap-4 rounded-xl p-4">
            <Typography className="mb-4" variant="lead" color="black">
                Data Management
            </Typography>
            <BoardArchive />
            <BoardDelete />
        </div>
    );
}

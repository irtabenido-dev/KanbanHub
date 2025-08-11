import { Typography } from "@material-tailwind/react";
import WorkspaceDelete from "./WorkspaceDelete";
import WorkspaceArchive from "./WorkspaceArchive";

export default function WorkspaceDataManagement({ workspace, toggle}){
    return (
        <div className="border rounded-xl p-4">
            <Typography className="mb-4" variant="lead" color="black">
                Data Management
            </Typography>
            <WorkspaceArchive workspace={workspace} toggle={toggle} />
            <WorkspaceDelete workspace={workspace} toggle={toggle} />
        </div>
    );
}

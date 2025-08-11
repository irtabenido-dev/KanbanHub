import { Typography } from "@material-tailwind/react";
import axios from "axios";
import { useSelector } from "react-redux";
import { getUser } from "@/Features/user/userSlice";

export default function TaskAttachments({ task, files, setFiles, setActivities }) {

    const userId = useSelector(getUser).id;

    const deleteFile = async (id) => {
        try {
            await axios.post(route('task.delete.files'), { fileId: id });
            setFiles(prev => prev.filter(file => file.id !== id));
            setActivities(prev => (prev.filter(activity =>
            !(activity.activityDetails.type === 'attachment' &&
                activity.activityDetails.id === id))
            ));
        } catch (errors) {
            console.log(errors);
        }
    }

    return (
        <>
            {(files.length > 0) &&
                <div
                    className="mt-2"
                >
                    <button className="flex flex-row gap-2 items-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                        </svg>
                        <Typography
                            variant='h6'
                            color='blue-gray'
                        >
                            Attachments
                        </Typography>
                    </button>
                    <div
                        className="flex flex-col gap-2 p-2 max-h-24 overflow-x-hidden"
                    >
                        {files.map((file, index) => (
                            <div key={file.id} className={`flex flex-row justify-between items-center py-1 ${index < files.length - 1 ? 'border-b border-blue-gray-100' : ''}`}> {/* Added subtle bottom border */}
                                <div className="flex flex-row gap-2 items-center">
                                    <a download={true} href={`/storage/${file.attachment_attributes.path}`}>
                                        <Typography
                                            variant="body1"
                                            color="blue"
                                            className="truncate"
                                        >
                                            {file.attachment_attributes.name}
                                        </Typography>
                                    </a>
                                    {file.attachment_attributes.uploader_id === userId && (
                                        <button
                                            onClick={() => deleteFile(file.id)}
                                            className="focus:outline-none text-red-500
                                            hover:text-red-700 transition duration-200"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                                <Typography
                                    variant="caption"
                                    color="blue-gray"
                                    className="text-right"
                                >
                                    Uploaded by: {file.attachment_attributes.uploader_name}
                                </Typography>
                            </div>
                        ))}
                    </div>
                </div>
            }
        </>
    );
}

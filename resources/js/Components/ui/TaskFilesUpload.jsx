import { Typography } from "@material-tailwind/react";
import { useEffect, useRef, useState } from "react";
import Uppy from '@uppy/core';
import Dashboard from '@uppy/dashboard';
import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';
import XHRUpload from '@uppy/xhr-upload';
import { autoUpdate, flip, offset, shift, useFloating } from "@floating-ui/react";

export default function TaskFilesUpload({ listId, taskId, setFiles, setActivities }) {
    const [show, setShow] = useState(false);
    const filesUploadRef = useRef(null);
    const toggle = () => {
        setShow(prev => !prev);
    }

    const { x, y, strategy, refs } = useFloating({
            placement: "bottom-start",
            middleware: [offset(6), flip(), shift({ padding: 5 })],
            whileElementsMounted: autoUpdate
        });

    useEffect(() => {
        const uppy = new Uppy().use(Dashboard, {
            inline: true,
            target: '#uppy-dashboard',
            height: 200,
        });

        uppy.use(XHRUpload, {
            endpoint: route('task.upload.files'),
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            },
            formData: true,
            fieldName: 'file'
        });

        uppy.on('file-added', (file) => {
            uppy.setFileMeta(file.id, {
                taskId: taskId,
            })
        });

        uppy.on('upload-success', (file, response) => {
            setFiles(prev => [...prev, response.body.uploadedFile]);
            setActivities(prev => [response.body.activity, ...prev]);
        });

        return () => {
            uppy.destroy()
        }
    }, [taskId, listId]);

    useEffect(() => {
        const handleOutsideClicks = (e) => {
            if (filesUploadRef.current && !filesUploadRef.current.contains(e.target)) {
                setShow(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClicks);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClicks);
        };
    }, [filesUploadRef]);

    return (
        <div
            ref={filesUploadRef}
        >
            <button
                ref={refs.setReference}
                className="flex flex-row items-center gap-1 bg-gray-400 w-full p-1 justify-center text-blue-gray-800"
                onClick={toggle}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                </svg>
                <Typography variant="h6">Attachments</Typography>
            </button>
            <div
                ref={refs.setFloating}
                style={{ position: strategy, top: y ?? 0, left: x ?? 0, width: "max-content" }}
                className={`
                    mt-2 z-10 ${!show && 'hidden'}
                    bg-[#ebe9e9] rounded-md w-full max-w-[75%] md:max-w-[50%]
                    text-blue-gray-800
                `}
            >
                <div className="flex justify-end w-full">
                    <button
                        onClick={toggle}
                        className="hover:bg-gray-400 rounded-sm mb-2 mt-2 mr-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div id="uppy-dashboard" />
            </div>
        </div>
    );
}

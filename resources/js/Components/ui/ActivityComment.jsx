import { Tooltip, Typography } from "@material-tailwind/react";
import { generateHTML } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import axios from "axios";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { useSelector } from "react-redux";
import { getUser } from "@/Features/user/userSlice";
import { getUserRoles } from "@/Features/board/boardSlice";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function ActivityComment({ activity, updateComment, deleteComment }) {
    const user = useSelector(getUser);
    const {workspaceRole, boardRole} = useSelector(state => getUserRoles(state, user.id));
    const canInteract = (workspaceRole !== 'member' || boardRole !== 'member');
    const [enableEdit, setEnableEdit] = useState(false);
    const toggleEdit = () => {
        setEnableEdit(prev => !prev);
    }
    const [isLoading, setIsLoading] = useState(false);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isStrike, setIsStrike] = useState(false);
    const [isCode, setIsCode] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bold: {
                    HTMLAttributes: {
                        class: 'font-bold'
                    }
                },
                code: {
                    HTMLAttributes: {
                        class: 'code'
                    }
                }
            }),
        ],
        content: activity.activityDetails.content,
        editorProps: {
            attributes: {
                class: 'p-1 min-h-24'
            }
        },
    });

    const submitEdit = async () => {
        const data = {
            commentId: activity.id,
            comment: editor.getJSON()
        }
        setIsLoading(true);
        try {
            await axios.patch(route('task.comment.edit'), data);
            updateComment(activity.id, editor.getJSON());
            setIsLoading(false);
            toggleEdit();
        } catch (errors) {
            setIsLoading(false);
            toggleEdit();
            console.log(errors);
        }
    }

    const submitDelete = async () => {
        const data = {
            commentId: activity.id
        }
        setIsLoading(true);
        try {
            await axios.delete(route('task.comment.delete'), {
                params: data
            });
            deleteComment(activity.id);
            setIsLoading(false);
        } catch (errors) {
            setIsLoading(false);
            console.log(errors);
        }
    }

    useEffect(() => {
        if (editor) {
            if (enableEdit) {
                editor.commands.focus();
            }
        }
    }, [editor, enableEdit]);

    useEffect(() => {
        if (editor) {
            const updateFormatState = () => {
                setIsBold(editor.isActive('bold'));
                setIsItalic(editor.isActive('italic'));
                setIsStrike(editor.isActive('strike'));
                setIsCode(editor.isActive('code'));
            };

            updateFormatState();

            editor.on('selectionUpdate', updateFormatState);
            editor.on('transaction', updateFormatState);

            return () => {
                editor.off('selectionUpdate', updateFormatState);
                editor.off('transaction', updateFormatState);
            };
        }
    }, [editor]);

    return (
        <div className="flex flex-row gap-2 mt-2">
            <img src={activity.userDetails.profilePicture || '/images/default-avatar.png'}
                className="rounded-full size-9"
                alt="User Profile Picture"
            />
            <div
                className="flex flex-col w-full"
            >
                <div
                    className="flex flex-row gap-4 items-baseline"
                >
                    <Typography
                        variant="h6"
                        color="blue-gray"
                    >
                        {activity.userDetails.name}
                    </Typography>
                    <Typography
                        variant="small"
                        color="blue-gray"
                    >
                        {dayjs.utc(activity.created_at).tz(dayjs.tz.guess()).format('MMMM DD, YYYY hh:mm A')}
                    </Typography>
                </div>
                {enableEdit ?
                    <div
                        className='ml-7 w-full'
                    >
                        <div
                            className='tooltip border-b p-1 bg-white border-gray-500 flex flex-row gap-2'
                        >
                            <Tooltip
                                content="Bold"
                                className="z-[9999]"
                            >
                                <button
                                    className={`${isBold ?
                                        'bg-blue-100 text-blue-600'
                                        : 'bg-white text-black hover:bg-gray-200'} p-2 rounded-md`}
                                    onClick={() => {
                                        editor.chain().focus().toggleBold().run();
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4">
                                        <path fillRule="evenodd" d="M3 3a1 1 0 0 1 1-1h5a3.5 3.5 0 0 1 2.843 5.541A3.75 3.75 0 0 1 9.25 14H4a1 1 0 0 1-1-1V3Zm2.5 3.5v-2H9a1 1 0 0 1 0 2H5.5Zm0 2.5v2.5h3.75a1.25 1.25 0 1 0 0-2.5H5.5Z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </Tooltip>
                            <Tooltip
                                content="Italic"
                                className="z-[9999]"
                            >
                                <button
                                    className={`${isItalic ?
                                        'bg-blue-100 text-blue-600'
                                        : 'bg-white text-black hover:bg-gray-200'} p-2 rounded-md`}
                                    onClick={() => {
                                        editor.chain().focus().toggleItalic().run();
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4">
                                        <path fillRule="evenodd" d="M6.25 2.75A.75.75 0 0 1 7 2h6a.75.75 0 0 1 0 1.5h-2.483l-3.429 9H9A.75.75 0 0 1 9 14H3a.75.75 0 0 1 0-1.5h2.483l3.429-9H7a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </Tooltip>
                            <Tooltip
                                content="Strikethrough"
                                className="z-[9999]"
                            >
                                <button
                                    className={`${isStrike ?
                                        'bg-blue-100 text-blue-600'
                                        : 'bg-white text-black hover:bg-gray-200'} p-2 rounded-md`}
                                    onClick={() => {
                                        editor.chain().focus().toggleStrike().run();
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4">
                                        <path fillRule="evenodd" d="M9.165 3.654c-.95-.255-1.921-.273-2.693-.042-.769.231-1.087.624-1.173.947-.087.323-.008.822.543 1.407.389.412.927.77 1.55 1.034H13a.75.75 0 0 1 0 1.5H3A.75.75 0 0 1 3 7h1.756l-.006-.006c-.787-.835-1.161-1.849-.9-2.823.26-.975 1.092-1.666 2.191-1.995 1.097-.33 2.36-.28 3.512.029.75.2 1.478.518 2.11.939a.75.75 0 0 1-.833 1.248 5.682 5.682 0 0 0-1.665-.738Zm2.074 6.365a.75.75 0 0 1 .91.543 2.44 2.44 0 0 1-.35 2.024c-.405.585-1.052 1.003-1.84 1.24-1.098.329-2.36.279-3.512-.03-1.152-.308-2.27-.897-3.056-1.73a.75.75 0 0 1 1.092-1.029c.552.586 1.403 1.056 2.352 1.31.95.255 1.92.273 2.692.042.55-.165.873-.417 1.038-.656a.942.942 0 0 0 .13-.803.75.75 0 0 1 .544-.91Z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </Tooltip>
                            <Tooltip
                                content="Code"
                                className="z-[9999]"
                            >
                                <button
                                    className={`${isCode ?
                                        'bg-blue-100 text-blue-600'
                                        : 'bg-white text-black hover:bg-gray-200'} p-2 rounded-md
                                                                            `}
                                    onClick={() => {
                                        editor.chain().focus().toggleCode().run();
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4">
                                        <path fillRule="evenodd" d="M4.78 4.97a.75.75 0 0 1 0 1.06L2.81 8l1.97 1.97a.75.75 0 1 1-1.06 1.06l-2.5-2.5a.75.75 0 0 1 0-1.06l2.5-2.5a.75.75 0 0 1 1.06 0ZM11.22 4.97a.75.75 0 0 0 0 1.06L13.19 8l-1.97 1.97a.75.75 0 1 0 1.06 1.06l2.5-2.5a.75.75 0 0 0 0-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0ZM8.856 2.008a.75.75 0 0 1 .636.848l-1.5 10.5a.75.75 0 0 1-1.484-.212l1.5-10.5a.75.75 0 0 1 .848-.636Z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </Tooltip>
                        </div>
                        <EditorContent
                            editor={editor}
                        />
                        <div className='flex flex-row gap-2 mt-2'>
                            <button
                                className='h-8 w-16 text-white bg-blue-400 rounded-lg text-sm font-semibold
                                hover:bg-blue-500'
                                disabled={isLoading}
                                onClick={submitEdit}
                            >
                                Save
                            </button>
                            <button
                                className='h-8 w-16 text-blue-gray-900 bg-white rounded-lg
                                text-sm font-semibold hover:bg-gray-200'
                                onClick={toggleEdit}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                    :
                    <div>
                        <div
                            className="bg-gray-200 p-2 rounded-lg shadow-sm activity"
                            dangerouslySetInnerHTML={{ __html: generateHTML(activity.activityDetails.content, [StarterKit]) }}
                        />
                        {(activity.userDetails.id === user.id || canInteract) && (
                            <div className="flex items-center gap-1 mt-1">
                                <button
                                    onClick={toggleEdit}
                                >
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                    >
                                        Edit
                                    </Typography>
                                </button>
                                <span className="text-gray-400">•</span>
                                <button
                                    onClick={submitDelete}
                                >
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                    >
                                        Delete
                                    </Typography>
                                </button>
                            </div>
                        )}
                    </div>
                }
            </div>
        </div>
    );
}

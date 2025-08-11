import { Tooltip, Typography } from '@material-tailwind/react';
import { useEffect, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { getTask, getUserRoles, taskUpdateDescription } from '@/Features/board/boardSlice';
import { getUser } from '@/Features/user/userSlice';

export default function TaskDescription({ task, setActivities }) {
    const { description } = useSelector(state => getTask(state, task.listId, task.id));
    const user = useSelector(getUser);
    const { workspaceRole, boardRole } = useSelector(state => getUserRoles(state, user.id));
    const isTaskMember = task.users.some(taskUser => taskUser.id === user.id);
    const canEdit = (workspaceRole !== 'member' || boardRole !== 'member') || isTaskMember;
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
                        class: 'p-1 code rounded-md'
                    }
                }
            }),
        ],
        content: JSON.parse(description) || '',
        editorProps: {
            attributes: {
                class: 'p-1 min-h-24'
            }
        },
    });

    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);

    const [enableDescriptionInput, setEnableDescriptionInput] = useState(false);

    const toggleDescriptionInput = () => {
        setEnableDescriptionInput((prev) => !prev);
    };

    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isStrike, setIsStrike] = useState(false);
    const [isCode, setIsCode] = useState(false);

    const submitDescription = async () => {
        const initialDescription = description;

        try {
            setIsLoading(true);
            const description = editor.getJSON();

            dispatch(taskUpdateDescription({
                taskId: task.id,
                listId: task.listId,
                description: JSON.stringify(description)
            }));

            const response = await axios.post(route('task.description.update'), {
                taskId: task.id,
                description: description
            });

            setActivities(prev => [response.data.activity, ...prev]);

            setIsLoading(false);

            setEnableDescriptionInput(prev => !prev);
        } catch (errors) {
            setIsLoading(false);
            dispatch(taskUpdateDescription({
                taskId: task.id,
                listId: task.listId,
                description: initialDescription
            }));
        }
        setIsLoading(false);
    }

    useEffect(() => {
        if (editor) {
            if (enableDescriptionInput) {
                editor.commands.focus();
            }
        }
    }, [editor, enableDescriptionInput]);

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

    useEffect(() => {
        const taskChannel = window.Echo.private(`task.${task.id}`);

        taskChannel.listen('.task.update.description', (data) => {
            if (data.senderId !== user.id) {
                editor.commands.setContent(data.updatedDescription, false);
            }
        });

        return () => {
            taskChannel.stopListening(".task.update.description");
        };

    }, [task.id]);

    return (
        <div>
            <div className='flex flex-row gap-2 items-center'>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                    <path fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                </svg>
                <Typography
                    variant='h6'
                    color='blue-gray'
                >
                    Description
                </Typography>
            </div>
            {(canEdit && enableDescriptionInput) ?
                <div
                    className='mt-2 ml-7'
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
                                    : 'bg-white text-black hover:bg-gray-200'} p-2 rounded-md
                                `}
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
                                    : 'bg-white text-black hover:bg-gray-200'} p-2 rounded-md
                                `}
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
                                    : 'bg-white text-black hover:bg-gray-200'} p-2 rounded-md
                                `}
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
                            onClick={submitDescription}
                            disabled={isLoading}
                        >
                            Save
                        </button>
                        <button
                            className='h-8 w-16 text-blue-gray-900 bg-white rounded-lg text-sm font-semibold
                            hover:bg-gray-200'
                            onClick={toggleDescriptionInput}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
                :
                <div
                    className={`bg-white w-full min-h-16 mt-2 justify-start p-2
                    rounded-md ${canEdit ? 'cursor-pointer hover:bg-gray-300' : ''}`}
                    onClick={toggleDescriptionInput}
                    disabled={!canEdit}
                >
                    <div
                        className='text-sm text-blue-gray'
                        dangerouslySetInnerHTML={{
                            __html: editor.getHTML() || 'Add a description...'
                        }}
                    />
                </div>
            }
        </div>
    );
}

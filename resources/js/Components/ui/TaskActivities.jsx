import { getUser } from "@/Features/user/userSlice";
import { Tooltip, Typography } from "@material-tailwind/react";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import axios from 'axios';
import ActivityAction from "./ActivityAction";
import ActivityComment from "./ActivityComment";
import ActivityAttachment from "./ActivityAttachment";
import { getUserRoles } from "@/Features/board/boardSlice";
import { VariableSizeList as List } from 'react-window';

export default function TaskActivities({ task, activities, setActivities }) {
    const user = useSelector(getUser);
    const [enableCommentInput, setEnableCommentInput] = useState(false);
    const [showActions, setShowActions] = useState(true);
    const { workspaceRole, boardRole } = useSelector(state => getUserRoles(state, user.id));
    const isTaskMember = task?.users?.some(taskUser => taskUser.id === user.id);
    const toggleShowActions = () => {
        setShowActions(prev => !prev);
    };
    const canInteract = (workspaceRole !== 'member' || boardRole !== 'member') || isTaskMember;
    const updateComment = (id, comment) => {
        setActivities((prev) =>
            prev.map((activity) =>
                activity.id === id ? {
                    ...activity,
                    activityDetails: {
                        ...activity.activityDetails,
                        content: comment,
                    }
                } : activity
            ));
    };

    const deleteComment = (id) => {
        setActivities(prev =>
            prev.filter((activity) => activity.id !== id)
        );
    };

    const deleteFile = (id) => {
        setActivities(prev => (prev.filter(activity =>
            !(activity.activityDetails.type === 'attachment' &&
                activity.activityDetails.id === id)
        )));
    };

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
        content: '',
        editorProps: {
            attributes: {
                class: 'p-1 min-h-24'
            }
        },
    });

    const [isLoading, setIsLoading] = useState(false);

    const toggleComment = () => {
        setEnableCommentInput(prev => !prev);
    };

    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isStrike, setIsStrike] = useState(false);
    const [isCode, setIsCode] = useState(false);

    const submitComment = async () => {
        try {
            const data = {
                taskId: task.id,
                comment: editor.getJSON()
            };

            const response = await axios.post(route('task.add.comment'), data);

            setActivities(prev => {
                return [response.data.newComment, ...prev];
            });

            editor.commands.clearContent();

            toggleComment();
        } catch (errors) {
            setIsLoading(false);
            console.log(errors);
        }
        setIsLoading(false);
    };

    const getItemSize = (index) => {
        const activity = activities[index];

        let baseHeight = 0;

        if (activity?.activityDetails?.type === 'attachment') {
            baseHeight = 65;
        } else if (activity?.activityDetails?.type === 'action') {
            baseHeight = 65;
        } else if (activity?.activityDetails?.type === 'comment') {
            baseHeight = 100;
        }

        return baseHeight;
    };

    const activityRow = useCallback(({ index, style }) => {
        const activity = activities[index];
        if (!activity) return null;

        if (activity?.activityDetails?.type === 'action' && showActions) {
            return (
                <div style={style}>
                    <ActivityAction
                        key={activity.id}
                        activity={activity}
                    />
                </div>
            );
        } else if (activity?.activityDetails?.type === 'comment') {
            return (
                <div style={style}>
                    <ActivityComment
                        key={activity.id}
                        updateComment={updateComment}
                        activity={activity}
                        deleteComment={deleteComment}
                    />
                </div>
            );
        } else if (activity?.activityDetails?.type === 'attachment') {
            return (
                <div style={style}>
                    <ActivityAttachment
                        key={activity.id}
                        activity={activity}
                    />
                </div>
            );
        } else {
            return null;
        }
    });

    useEffect(() => {
        if (editor) {
            if (enableCommentInput) {
                editor.commands.focus();
            }
        }
    }, [editor, enableCommentInput]);

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

        taskChannel.listen('.task.add.comment', (data) => {
            console.log(data);
            if (data.senderId !== user.id) {
                setActivities(prev => [data.activity, ...prev]);
            };
        });

        taskChannel.listen('.task.edit.comment', (data) => {
            if (data.senderId !== user.id) {
                updateComment(data.commentId, data.updatedComment);
            };
        });

        taskChannel.listen('.task.delete.comment', (data) => {
            if (data.senderId !== user.id) {
                deleteComment(data.commentId);
            };
        });

        taskChannel.listen('.task.add.file', (data) => {
            if (data.senderId !== user.id) {
                setActivities(prev => [data.activity, ...prev]);
            };
        });

        taskChannel.listen('.task.delete.file', (data) => {
            if (data.senderId !== user.id) {
                deleteFile(data.fileId);
                setActivities(prev => [data.activity, ...prev]);
            };
        });

        return () => {
            taskChannel.stopListening('.task.add.comment');
            taskChannel.stopListening('.task.edit.comment');
            taskChannel.stopListening('.task.delete.comment');
            taskChannel.stopListening('.task.add.file');
            taskChannel.stopListening('.task.delete.file');
        }
    }, [task.id]);

    return (
        <div
            className="w-full flex flex-col mt-2"
        >
            <div className='flex flex-row gap-2 items-center justify-between'>
                <div
                    className="flex flex-row items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                    <Typography
                        variant='h6'
                        color='blue-gray'
                    >
                        Activity
                    </Typography>
                </div>
                {showActions ?
                    <button
                        className="p-1 border self-end
                        rounded-md bg-[#E5E7EA] hover:bg-gray-200"
                        onClick={() => { toggleShowActions() }}
                    >
                        <Typography
                            variant="h6"
                            color="blue-gray"
                        >
                            Hide Actions
                        </Typography>
                    </button>
                    :
                    <button
                        className="p-1 border self-end
                        rounded-md bg-[#E5E7EA] hover:bg-gray-200"
                        onClick={() => { toggleShowActions() }}
                    >
                        <Typography
                            variant="h6"
                            color="blue-gray"
                        >
                            Show Actions
                        </Typography>
                    </button>
                }
            </div>
            <div
                className="flex flex-col gap-2"
            >
                <div
                    className={`flex flex-col gap-2 mt-2 `}
                >
                    {canInteract &&
                        <div
                            className="flex flex-row gap-2 items-center"
                        >
                            <img src={user.profile_data.profilePicture || '/images/default-avatar.png'}
                                className="rounded-full size-9"
                                alt="User Profile Picture"
                            />
                            {enableCommentInput ?
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
                                                    : 'bg-white text-black hover:bg-gray-200'} p-2 rounded-md `}
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
                                                    : 'bg-white text-black hover:bg-gray-200'} p-2 rounded-md`}
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
                                            onClick={submitComment}
                                        >
                                            Save
                                        </button>
                                        <button
                                            className='h-8 w-16 text-blue-gray-900 bg-white rounded-lg text-sm font-semibold
                                                    hover:bg-gray-200'
                                            onClick={toggleComment}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                                :
                                <div
                                    className="rounded-md w-full bg-white p-2 text-gray-400
                                border border-gray-300 cursor-pointer hover:shadow-sm"
                                    onClick={() => toggleComment()}
                                >
                                    Write a comment...
                                </div>
                            }
                        </div>
                    }
                    {/* {shownActivities?.map((activity) => {
                        switch (activity?.activityDetails?.type) {
                            case 'action':
                                return <ActivityAction
                                    key={activity.id}
                                    activity={activity}
                                />
                            case 'comment':
                                return <ActivityComment
                                    key={activity.id}
                                    updateComment={updateComment}
                                    activity={activity}
                                    deleteComment={deleteComment}
                                />
                            case 'attachment':
                                return canInteract ? (
                                    <ActivityAttachment
                                        key={activity.id}
                                        activity={activity}
                                    />
                                )
                                    :
                                    null;
                            default: return;
                        }
                    })} */}
                    <List
                        height={385}
                        itemCount={activities.length}
                        itemSize={getItemSize}
                        width="100%"
                        overscanCount={2}
                    >
                        {activityRow}
                    </List>
                </div>
            </div>
        </div>
    );
}

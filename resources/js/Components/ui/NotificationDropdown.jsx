import { Badge, IconButton } from "@material-tailwind/react";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import Notification from "./Notification";
import { useDispatch, useSelector } from "react-redux";
import {
    setNotifications,
} from "@/Features/notifications/notificationsSlice";
import { VariableSizeList as List } from 'react-window';

export default function NotificationDropdown({ user }) {
    const notifications = useSelector((state) => state.notifications);
    const [show, setShow] = useState(false);
    const dispatch = useDispatch();
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    const toggle = () => {
        setShow(!show);
    };

    const getNotifications = async () => {
        try {
            const response = await axios.get(route("user.notifications"));
            dispatch(setNotifications(response.data.notifications));
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const handleClick = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(e.target)
            ) {
                setShow(false);
            };
        };

        if (show) {
            document.addEventListener('mousedown', handleClick);
        } else {
            document.removeEventListener('mousedown', handleClick);
        };

        return () => {
            document.removeEventListener('mousedown', handleClick);
        }

    }, [show]);

    useEffect(() => {
        const generalChannel = window.Echo.private(`App.Models.User.${user.id}`);

        generalChannel.listen(
            "refreshNotifications",
            () => {
                getNotifications();
            }
        );

        getNotifications();

        return () => {
            generalChannel.stopListening("refreshNotifications");
        }

    }, []);

    const getItemSize = (index) => {
        const notification = notifications[index];
        if (!notification) return 120;

        let baseHeight = 120;

        const longNotificationTypes = [
            'workspace_invitation',
            'workspace_user_role_update',
            'list_updated',
            'board_user_update',
            'task_title_update'
        ];

        if (longNotificationTypes.includes(notification?.type)) {
            baseHeight += 30;
        }

        return baseHeight;
    };

    const NotificationRow = useCallback(({ index, style }) => {
        const notification = notifications[index];
        if (!notification) return null;

        return (
            <div style={style} className="px-6">
                <Notification
                    key={notification.id}
                    index={index}
                    notification={notification}
                />
            </div>
        );
    }, [notifications]);

    return (
        <div className="relative">
            {notifications.length > 0 ? (
                <Badge content={notifications.length} overlap="circular">
                    <IconButton ref={buttonRef} variant="text" size="sm" onClick={toggle}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="white"
                            className="h-6 w-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                            />
                        </svg>
                    </IconButton>
                </Badge>
            ) : (
                <Badge invisible overlap="circular">
                    <IconButton ref={buttonRef} variant="text" size="sm" onClick={toggle}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="white"
                            className="h-6 w-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                            />
                        </svg>
                    </IconButton>
                </Badge>
            )}

            {show && (
                <div ref={dropdownRef} className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg overflow-hidden z-10">
                    <div className="p-3 text-gray-700 font-medium border-b text-sm">
                        Notifications
                    </div>
                    {notifications.length > 0 ? (
                        <div className="h-80 mb-2">
                            <List
                                height={320}
                                itemCount={notifications.length}
                                itemSize={getItemSize}
                                width="100%"
                                overscanCount={2}
                            >
                                {NotificationRow}
                            </List>
                        </div>
                    ) : (
                        <div className="p-4 text-gray-500 text-sm">
                            No new notifications
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

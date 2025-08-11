import { Link, useForm } from '@inertiajs/react';
import { Avatar, Menu, MenuHandler, MenuList, MenuItem, Typography } from "@material-tailwind/react";
import { useState, createElement } from 'react';
import { UserCircleIcon, PowerIcon } from "@heroicons/react/24/solid";
import { useSelector } from 'react-redux';

export default function Profile() {
    const user = useSelector((state) => state.user);
    const profileMenuItems = [
        {
            label: "Profile",
            icon: UserCircleIcon,
            url: '/profile'
        },
        {
            label: "Log out",
            icon: PowerIcon,
            url: '/logout'
        },
    ];

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { post } = useForm();

    const closeMenu = () => setIsMenuOpen(false);

    return (
        <header className="flex flex-row justify-between items-center p-4">
            <Menu open={isMenuOpen} handler={setIsMenuOpen} placement='bottom-end'>
                <MenuHandler>
                    <Avatar
                        variant='circular'
                        size='md' alt={user.name}
                        className='border border-gray-900 p-0.5 cursor-pointer'
                        src={user.profile_data?.profilePicture || '/images/default-avatar.png'}
                    >
                    </Avatar>
                </MenuHandler>
                <MenuList className='p-0'>
                    {profileMenuItems.map(({ label, icon, url }, key) => {
                        const isLastItem = key === profileMenuItems.length - 1;
                        return (
                            <MenuItem
                                key={label}
                                onClick={closeMenu}
                                className={`flex items-center gap-2 rounded ${isLastItem
                                    ? "hover:bg-red-500/10 focus:bg-red-500/10 active:bg-red-500/10"
                                    : ""
                                    }`}
                            >
                                {createElement(icon, {
                                    className: `h-4 w-4 ${isLastItem ? "text-red-500" : ""}`,
                                    strokeWidth: 2,
                                })}
                                <Typography
                                    as="span"
                                    variant="small"
                                    className="font-normal"
                                    color={isLastItem ? "red" : "inherit"}
                                >
                                    {label === 'Log out' ?
                                        <button onClick={() => { post(route('logout')) }}>Log out</button>
                                        :
                                        <Link href={url}>{label}</Link>
                                    }
                                </Typography>
                            </MenuItem>
                        );
                    })}
                </MenuList>
            </Menu>
        </header>
    );
}

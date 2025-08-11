import NotificationDropdown from '@/Components/ui/NotificationDropdown';
import Profile from '@/Components/ui/profile';
import { setUser } from '@/Features/user/userSlice';
import { usePage, Head, Link } from '@inertiajs/react';
import { Typography } from '@material-tailwind/react';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

export default function AuthenticatedLayout({ children }) {
    const user = usePage().props.auth.user;
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setUser(user));
    }, [user.id]);

    return (
        <div className="min-h-screen min-w-full bg-[#1A1A1A] flex flex-col">
            <Head title="KanbanHub" />
            <div className='flex justify-between items-center px-4'>
                <Link href="/">
                    <Typography className="text-3xl" variant="h1" color="white">KanbanHub</Typography>
                </Link>
                <div className='flex flex-row items-center'>
                    <NotificationDropdown user={user} />
                    <Profile user={user} />
                </div>
            </div>
            <main>
                {children}
            </main>
        </div>
    );
}

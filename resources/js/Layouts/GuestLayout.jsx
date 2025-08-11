import { Button, Typography } from "@material-tailwind/react";
import { Head, Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen bg-[#1A1A1A]">
            <Head title="KanbanHub" />
            <header className="flex flex-row justify-between items-center p-4">
                <Link href="/">
                    <Typography className="text-3xl" variant="h1" color="white">KanbanHub</Typography>
                </Link>
                <div className="flex flex-row gap-4">
                    <Link href={route('login')}>
                        <Button variant="outlined" size="sm" color="white">Login</Button>
                    </Link>
                    <Link href={route('register')}>
                        <Button variant="outlined" size="sm" color="white">Register</Button>
                    </Link>
                </div>
            </header>
            <div className="flex flex-col justify-center items-center h-[calc(100vh-4.5rem)]">
                {children}
            </div>
        </div>
    );
}

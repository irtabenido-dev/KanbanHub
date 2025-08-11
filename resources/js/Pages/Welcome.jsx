import GuestLayout from '@/Layouts/GuestLayout';
import { Link } from '@inertiajs/react';
import { Typography, Button } from '@material-tailwind/react';

export default function Welcome({ auth }) {

    return (
        <GuestLayout>
            <div className='p-4 md:max-w-[80%] text-center'>
                <Typography className='text-[2rem] mb-4' variant='h2' color='white'>Organize Anything, Alone or Together</Typography>
                <Typography className='text-[1.5rem] mb-4' variant='h4' color='white'>Manage personal projects or bring your team together effortlessly</Typography>
                <Link href='/register'>
                    <Button variant='filled' color='blue' size='lg'>Get Started</Button>
                </Link>
            </div>
        </GuestLayout>
    );
}

import InputError from '@/Components/ui/InputError';
import TextInput from '@/Components/ui/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button, Typography } from '@material-tailwind/react';

export default function ResetPassword({ token, email }) {

    const {data, setData, errors, processing, post} = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: ''
    });

    const submit = () => {
        post(route('password.store'), data);
    };

    return (
        <GuestLayout>
            <Head title="Reset Password" />
            <div className='border border-gray-200 p-4 rounded-xl w-[24rem]'>
                <Typography variant='h3' color='white' className='mb-2'>
                    Reset Password
                </Typography>
                <TextInput type="password" onChange={(e) => setData('password', e.target.value)} className="w-full mb-2 mt-4" placeholder="New Password" />
                <InputError message={errors.password} />
                <TextInput type="password" onChange={(e) => setData('password_confirmation', e.target.value)} className="w-full mb-2 mt-4" placeholder="Confirm Password" />
                <InputError message={errors.password_confirmation} />
                <Button disabled={processing} onClick={submit} className='mt-4 w-full' color='blue'>
                    Reset Password
                </Button>
            </div>
        </GuestLayout>
    );
}

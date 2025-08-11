
import InputError from '@/Components/ui/InputError';
import TextInput from '@/Components/ui/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button, Typography } from '@material-tailwind/react';

export default function ForgotPassword({ status }) {

    const { data, setData, post, processing, errors } = useForm({
        email: ''
    });


    const submit = async () => {
        post(route('password.email'));
    }

    return (
        <GuestLayout>
            <Head title="Forgot Password" />
            <div className='border border-gray-200 p-4 rounded-xl w-[24rem]'>
                <Typography variant='h3' color='white' className='mb-2'>
                    Forgot Password
                </Typography>
                <Typography variant='paragraph' color='white'>
                    Please enter the email you'd like the password reset link to be sent to
                </Typography>
                <TextInput onChange={(e) => setData({ email: e.target.value })} className="w-full mb-2 mt-4" placeholder="Email Address" />
                <InputError message={errors.email} />

                {status && (
                    <div className="text-sm text-green-500">
                        {status}
                    </div>
                )}

                <Button disabled={processing} onClick={submit} className='mt-4 w-full' color='blue'>
                    Send Reset Link
                </Button>
            </div>
        </GuestLayout>
    );
}

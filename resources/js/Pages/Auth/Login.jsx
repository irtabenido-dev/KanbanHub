import InputError from '@/Components/ui/InputError';
import InputLabel from '@/Components/ui/InputLabel';
import TextInput from '@/Components/ui/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button, Typography } from '@material-tailwind/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className='border border-gray-200 p-4 rounded-xl w-[24rem]'>
                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 block">
                    <label className="flex items-center">
                        <input
                            type='checkbox'
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-sm dark:text-gray-400">
                            <Typography variant='small' color='white'>
                                Remember me
                            </Typography>
                        </span>
                    </label>
                </div>

                <div className="mt-4 flex items-center justify-end">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="rounded-md text-sm hover:text-gray-900 hover:scale-105
                            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                            dark:text-gray-400 dark:hover:text-gray-100 dark:focus:ring-offset-gray-800"
                        >
                            <Typography variant='small' color='white'>
                                Forgot your password?
                            </Typography>
                        </Link>
                    )}

                    <Button type='submit' color='blue' variant='filled' size='sm' className="ms-4" loading={processing}>
                        <Typography variant='small' color='white'>
                            Log in
                        </Typography>
                    </Button>
                </div>
            </form>
        </GuestLayout>
    );
}

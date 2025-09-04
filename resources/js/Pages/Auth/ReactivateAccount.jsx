import GuestLayout from "@/Layouts/GuestLayout";
import { useForm, usePage } from "@inertiajs/react";
import { Button, Typography } from "@material-tailwind/react";

export default function ReactivateAccount({ message }) {
    const { props } = usePage();
    const { data, post } = useForm({
        email: props.email
    });

    const submit = () => {
        post(route('account.reactivation-request'), data);
    };

    return (
        <>
            <GuestLayout>
                <div className="flex justify-center items-center min-h-screen">
                    <div className="border  p-6 rounded-xl shadow-xl w-[24rem]">
                        <Typography variant="h5" color="white" className="text-center mb-4">
                            Your account is currently deactivated.
                        </Typography>
                        {message && (
                            <Typography variant="paragraph" color="green">
                                {message}
                            </Typography>
                        )}
                        <Button
                            color="blue"
                            className="w-full mt-4 hover:bg-blue-600 transition duration-300 ease-in-out"
                            onClick={submit}
                        >
                            Send Reactivation Request
                        </Button>
                    </div>
                </div>
            </GuestLayout>
        </>
    );
}

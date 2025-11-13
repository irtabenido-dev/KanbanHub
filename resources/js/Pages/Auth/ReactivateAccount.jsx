import GuestLayout from "@/Layouts/GuestLayout";
import { usePage } from "@inertiajs/react";
import { Button, Typography } from "@material-tailwind/react";
import axios from "axios";
import { useState } from "react";

export default function ReactivateAccount({ message }) {
    const { props } = usePage();
    const [isLoading, setIsLoading] = useState(false);

    const submit = async () => {
        setIsLoading(true);
        try {
            await axios.post(route('account.reactivation-request'), {
                email: props.email
            });
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <GuestLayout>
                <div className="flex justify-center items-center h-[calc(100vh-5rem)]">
                    <div className="border flex flex-col p-6 rounded-xl shadow-xl w-[24rem]">
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
                            className="mt-4 flex justify-center hover:bg-blue-600 transition duration-300 ease-in-out"
                            onClick={submit}
                            loading={isLoading}
                        >
                            Send Reactivation Request
                        </Button>
                    </div>
                </div>
            </GuestLayout>
        </>
    );
}

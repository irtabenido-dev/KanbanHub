import GuestLayout from "@/Layouts/GuestLayout";
import { usePage } from "@inertiajs/react";
import { Button, Typography } from "@material-tailwind/react";
import axios from "axios";
import { useState } from "react";

export default function ReactivateAccount() {
    const { props } = usePage();
    const [isLoading, setIsLoading] = useState(false);
    const [requestSuccess, setRequestSuccess] = useState(false);

    const submit = async () => {
        setIsLoading(true);
        setRequestSuccess(false);

        try {
            await axios.post(route('account.reactivation-request'), {
                email: props.email
            });
            setRequestSuccess(true);
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
                        {requestSuccess && (
                            <Typography variant="paragraph" color="green" className="text-center">
                                Reactivation request has been sent to your email address
                            </Typography>
                        )}
                        <Button
                            color="blue"
                            className="mt-4 flex justify-center hover:bg-blue-600 transition duration-300 ease-in-out"
                            onClick={submit}
                            loading={isLoading}
                            disabled={requestSuccess}
                        >
                            Send Reactivation Request
                        </Button>
                    </div>
                </div>
            </GuestLayout>
        </>
    );
}

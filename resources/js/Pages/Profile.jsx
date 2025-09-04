import ProfileDeactivate from "@/Components/profile/ProfileDeactivate";
import ProfileDelete from "@/Components/profile/ProfileDelete";
import ProfileUpdate from "@/Components/profile/ProfileUpdate";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import { Typography } from "@material-tailwind/react";

export default function Profile() {
    const { props } = usePage();

    return (
        <AuthenticatedLayout>
            <div className="h-full flex flex-col justify-center items-center p-4">
                <Head title="Update Profile" />
                <div className="w-full md:w-96">
                    <ProfileUpdate />
                    <div className="flex flex-col gap-4 border rounded-lg p-4">
                        <Typography variant="h2" color="red">
                            Danger Zone
                        </Typography>
                        <ProfileDeactivate />
                        <ProfileDelete />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

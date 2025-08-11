import ProfileDelete from "@/Components/profile/ProfileDelete";
import ProfileUpdate from "@/Components/profile/ProfileUpdate";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";

export default function Profile() {
    const { props } = usePage();

    return (
        <AuthenticatedLayout>
            <div className="h-full flex flex-col justify-center items-center p-4">
                <Head title="Update Profile" />
                <div className="w-full md:w-96">
                    <ProfileUpdate />
                    <ProfileDelete />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

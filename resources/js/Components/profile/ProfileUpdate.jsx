import axios from "axios";
import { useEffect, useState } from "react";
import InputError from "@/Components/ui/InputError";
import InputLabel from "@/Components/ui/InputLabel";
import TextInput from "@/Components/ui/TextInput";
import {
    Typography,
    Button,
} from "@material-tailwind/react";
import { useDispatch } from "react-redux";
import { updateUser } from "@/Features/user/userSlice";
import { usePage } from "@inertiajs/react";

export default function ProfileUpdate({ }) {
    const dispatch = useDispatch();
    const { props } = usePage();

    const user = props.auth.user;

    const [profileData, setProfileData] = useState({
        'name': user.name,
        'email': user.email,
        'newPassword': '',
        'confirmPassword': '',
        'profilePicture': null
    });

    const [errors, setErrors] = useState(null);
    const [processing, setProcessing] = useState(false);

    const submit = async () => {
        setProcessing(true);

        const data = new FormData();

        data.append('name', profileData.name);
        data.append('email', profileData.email);


        if (profileData.newPassword) {
            data.append('newPassword', profileData.newPassword);
        }
        if (profileData.confirmPassword) {
            data.append('confirmPassword', profileData.confirmPassword);
        }

        if (profileData.profilePicture) {
            data.append('profilePicture', profileData.profilePicture);
        }


        try {
            const response = await axios.post(route('profile.update'), data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                params: {
                    _method: 'PATCH'
                }
            });

            dispatch(updateUser(response.data.user));
            setProcessing(false);
        } catch (errors) {
            setErrors(errors.response.data.errors);
            setProcessing(false);
        }
    };


    return (
        <div className="w-full m-auto p-4">
            <div className="flex flex-col gap-2">
                <Typography variant="h3" color="white">
                    Update Profile
                </Typography>
                <InputLabel>
                    <Typography
                        variant="lead"
                        color="white"
                    >
                        Name
                    </Typography>
                </InputLabel>
                <TextInput
                    className={`w-full text-black ${errors && errors.name ? 'border-[2px] border-red-500' : ''} mb-2`}
                    type="text" value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                />
                {errors && <InputError message={errors.name} />}
                <InputLabel>
                    <Typography
                        variant="lead"
                        color="white"
                    >
                        Email
                    </Typography>
                </InputLabel>
                <TextInput
                    className={`w-full text-black ${errors && errors.email ? 'border-[2px] border-red-500' : ''} mb-2`}
                    type="text" value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                />
                {errors && <InputError message={errors.email} />}
                <InputLabel>
                    <Typography
                        variant="lead"
                        color="white"
                    >
                        New Password
                    </Typography>
                </InputLabel>
                <TextInput
                    className={`w-full text-black ${errors && errors.newPassword ? 'border-[2px] border-red-500' : ''} mb-2`}
                    type="password"
                    placeholder="Optional: Only fill in to change password"
                    onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                />
                {errors && <InputError message={errors.newPassword} />}
                <InputLabel>
                    <Typography
                        variant="lead"
                        color="white"
                    >
                        Confirm New Password
                    </Typography>
                </InputLabel>
                <TextInput
                    className={`w-full text-black ${errors && errors.confirmPassword ? 'border-[2px] border-red-500' : ''} mb-2`}
                    type="password"
                    placeholder="Optional: Only fill in to change password"
                    onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                />
                {errors && <InputError message={errors.confirmPassword} />}
                <InputLabel>
                    <Typography
                        variant="lead"
                        color="white"
                    >
                        Profile Picture
                    </Typography>
                </InputLabel>
                <input
                    type="file"
                    className="bg-white rounded-lg"
                    onChange={(e) => setProfileData({ ...profileData, profilePicture: e.target.files[0] })}
                />
                {errors && <InputError message={errors.profilePicture} />}
            </div>
            <div className="pt-4">
                <Button loading={processing} className="w-full" color="blue" onClick={submit}>
                    Save
                </Button>
            </div>
        </div>
    );
}

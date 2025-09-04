import { Button, Dialog, DialogBody, Typography } from "@material-tailwind/react";
import axios from "axios";
import { useState } from "react";
import TextInput from "../ui/TextInput";
import InputError from "../ui/InputError";
import { router, usePage } from "@inertiajs/react";

export default function ProfileDeactivate({ }) {
    const { props } = usePage();
    const user = props.auth.user;
    const [show, setShow] = useState(false);
    const [data, setData] = useState({
        id: user.id,
        password: ''
    });

    const [errors, setErrors] = useState(null);
    const toggle = () => {
        setShow(!show);
    };

    const submit = async () => {
        try {
            await axios.post(route('account.deactivate'), data);
            router.visit('/');
        } catch (errors) {
            setErrors(errors.response.data.errors);
            console.log(errors);
        }
    };

    return (
        <div>
            <Typography variant="h3" color="white" className="pb-2">
                Deactivate Account
            </Typography>
            <Typography variant="paragraph" color="white">
                By deactivating your account, you will lose access to your data, services, and content. Some information may be retained for legal or security reasons.
            </Typography>
            <Button className="mt-4 w-full" color="red" onClick={toggle}>
                Deactivate
            </Button>
            <Dialog
                size="xs"
                open={show}
                handler={toggle}
                animate={{
                    mount: { scale: 1, y: 0 },
                    unmount: { scale: 0.9, y: -100 },
                }}
            >
                <DialogBody className="p-4 text-justify">
                    <Typography variant="paragraph">
                        Deactivating your account will remove access to your data and services
                    </Typography>
                    <Typography variant="paragraph">
                        Please enter your password to proceed with your account deactivation
                    </Typography>
                    <TextInput
                        type="password"
                        className="w-full mt-4"
                        onChange={(e) => setData({ ...data, password: e.target.value })}
                    />
                    {errors?.password && <InputError className="text-left mt-2" message={errors.password} />}
                    {errors?.owner && <InputError className="text-left mt-2" message={errors.owner} />}
                    <div className="flex flex-row gap-2 justify-center mt-4">
                        <Button className="w-full" color="red" onClick={submit}>Proceed</Button>
                        <Button className="w-full" color="gray" onClick={toggle}>Cancel</Button>
                    </div>
                </DialogBody>
            </Dialog>
        </div>
    );
}

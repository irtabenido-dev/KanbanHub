import { Typography } from "@material-tailwind/react";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc);
dayjs.extend(timezone);

export default function ActivityAction({ activity }) {

    return (
        <div className="flex flex-row gap-2 items-center">
            <img src={activity.userDetails.profilePicture || '/images/default-avatar.png'}
                className="rounded-full size-9"
                alt="User Profile Picture"
            />
            <div
                className="flex flex-col w-full"
            >
                <div className="flex flex-row items-baseline gap-4">
                    <Typography
                        variant="h6"
                        color="blue-gray"
                    >
                        {activity.userDetails.name}
                    </Typography>
                    <Typography
                        variant="small"
                        color="blue-gray"
                    >
                        {activity.activityDetails.content.length > 40
                            ? activity.activityDetails.content.substring(0, 40) + '...'
                            : activity.activityDetails.content
                        }
                    </Typography>
                </div>
                <Typography
                    variant="small"
                    color="gray"
                >
                    {dayjs.utc(activity.created_at).tz(dayjs.tz.guess()).format('MMMM DD, YYYY hh:mm A')}
                </Typography>
            </div>
        </div>
    );
}

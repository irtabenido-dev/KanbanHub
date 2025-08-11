import { Link } from '@inertiajs/react';
import { Button, Chip, Typography } from '@material-tailwind/react';
import axios from 'axios';
import { useState } from 'react';

export default function WorkspaceBoard({ board }) {
    const [requestSent, setRequestSent] = useState(false);
    const submit = async () => {
        setRequestSent(true);
        try {
            await axios.post(route('board.request.send'), { boardId: board.id });
        } catch (errors) {
            setRequestSent(false);
            console.log(errors);
        }
    }

    return (
        <div className='h-[7.5rem] w-[15rem] bg-gray-200 rounded-xl'>
            {board.hasAccess &&
                <Link
                    href={route('board.index', { workspaceId: board.workspaceId, id: board.id })}
                    className="h-full flex flex-shrink-0 justify-center items-center">
                    <Typography variant='h6'>{board.name}</Typography>
                </Link>
            }

            {(!board.hasAccess && !board.blacklisted) &&
                <div className='h-full flex flex-col justify-center items-center p-2 text-center'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                    <Typography variant='small'>You do not have access to <span className='font-bold'>{board.name}</span> board</Typography>
                    {board.requestStatus !== 'pending' ? (
                        <Button
                            variant='filled'
                            color='blue'
                            size='sm'
                            disabled={requestSent}
                            onClick={submit}
                        >{!requestSent ? 'Request access' : 'Request sent'}</Button>
                    ) : (
                        <Chip
                            color='blue'
                            value="Request Pending"
                        />
                    )
                    }
                </div>
            }
            {board.blacklisted &&
                <div className='h-full flex flex-col justify-center items-center p-2 text-center'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-red-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    <Typography variant='small' className='text-red-600 font-medium'>
                        Access <span className='font-bold'>Denied</span>
                    </Typography>
                    <Typography variant='paragraph' className='text-red-500 text-xs mt-1'>
                        Blacklisted from <span className='font-semibold'>{board.name}</span> board
                    </Typography>
                </div>
            }
        </div>
    );
}

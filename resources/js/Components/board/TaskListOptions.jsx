import { IconButton, Menu, MenuHandler, MenuList } from "@material-tailwind/react";
import BoardTaskListArchiveButton from "./BoardTaskListArchiveButton";
import BoardTaskListDeleteButton from "./BoardTaskListDeleteButton";

export default function listListOptions({ list }) {

    return (
        <Menu
            animate={{
                mount: { y: 0 },
                unmount: { y: 25 },
            }}
        >
            <MenuHandler>
                <IconButton
                    variant="text"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                    </svg>
                </IconButton>
            </MenuHandler>
            <MenuList className="p-0">
                <BoardTaskListArchiveButton list={list} />
                <BoardTaskListDeleteButton list={list} />
            </MenuList>
        </Menu>
    );
}

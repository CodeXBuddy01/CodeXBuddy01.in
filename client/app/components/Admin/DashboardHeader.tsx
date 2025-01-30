'use client';
import { ThemeSwitcher } from "@/app/utils/ThemeSwitcher";
import React, { FC, useState } from "react";
import { IoMdNotificationsOutline } from "react-icons/io";

type Props = {};

const DashboardHeader: FC<Props> = () => {
    const [open, setOpen] = useState(false);

    return (
        <div className="w-full flex items-center justify-end p-6 fixed top-5 right-0 bg-white dark:bg-gray-900 shadow-lg rounded-lg">
            <ThemeSwitcher />
            <div
                className="relative cursor-pointer m-2"
                onClick={() => setOpen(!open)}
            >
                <IoMdNotificationsOutline className="text-3xl cursor-pointer dark:text-white text-black transition-all duration-300 hover:scale-110" />
                <span className="absolute -top-2 -right-2 bg-[#3ccba0] rounded-full w-[20px] h-[20px] text-[12px] flex items-center justify-center text-white font-bold">
                    3
                </span>
            </div>
            {open && (
                <div className="absolute top-16 right-8 bg-white dark:bg-gray-800 shadow-xl rounded-lg w-80 p-4 border border-gray-200 dark:border-gray-700">
                    <h5 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2 mb-3">
                        Notifications
                    </h5>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer">
                            <p className="text-gray-800 dark:text-white text-sm">New Question Received</p>
                            <p className="text-blue-600 dark:text-blue-400 text-sm font-medium cursor-pointer hover:underline">
                                Mark as read
                            </p>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ullam nulla suscipit debitis!
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">5 days ago</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardHeader;
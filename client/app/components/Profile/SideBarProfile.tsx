import Image from 'next/image';
import React, { FC } from 'react';
import avatarDefault from '../../../public/assests/avatar.svg';
import { RiLockPasswordLine } from 'react-icons/ri';
import { SiCoursera } from 'react-icons/si';
import { AiOutlineLogout } from 'react-icons/ai';

type Props = {
  user: any;
  active: number;
  avatar: string | null;
  setActive: (active: number) => void;
  logOutHandler: any;
};

const SideBarProfile: FC<Props> = ({ user, active, avatar, setActive, logOutHandler }) => {
  return (
    <div className="w-full">
      {/* My Account */}
      <div
        className={`w-full flex items-center gap-3 px-3 py-4 cursor-pointer ${
          active === 1 ? 'dark:bg-slate-800 bg-gray-200' : 'bg-transparent'
        }`}
        onClick={() => setActive(1)}
      >
        <Image
          src={user.avatar || avatar ? user.avatar.url || avatar : avatarDefault}
          alt="Avatar"
          width={30}
          height={30}
          className="rounded-full border border-gray-300"
        />
        <h5 className="font-Poppins text-sm text-black dark:text-white">My Account</h5>
      </div>

      {/* Change Password */}
      <div
        className={`w-full flex items-center gap-3 px-3 py-4 cursor-pointer ${
          active === 2 ? 'dark:bg-slate-800 bg-gray-200' : 'bg-transparent'
        }`}
        onClick={() => setActive(2)}
      >
        <RiLockPasswordLine size={20} className="text-gray-700 dark:text-white" />
        <h5 className="font-Poppins text-sm text-black dark:text-white">Change Password</h5>
      </div>

      {/* Enrolled Courses */}
      <div
        className={`w-full flex items-center gap-3 px-3 py-4 cursor-pointer ${
          active === 3 ? 'dark:bg-slate-800 bg-gray-200' : 'bg-transparent'
        }`}
        onClick={() => setActive(3)}
      >
        <SiCoursera size={20} className="text-gray-700 dark:text-white" />
        <h5 className="font-Poppins text-sm text-black dark:text-white">Enrolled Courses</h5>
      </div>

      {/* Log Out */}
      <div
        className={`w-full flex items-center gap-3 px-3 py-4 cursor-pointer ${
          active === 4 ? 'dark:bg-slate-800 bg-gray-200' : 'bg-transparent'
        }`}
        onClick={logOutHandler}
      >
        <AiOutlineLogout size={20} className="text-gray-700 dark:text-white" />
        <h5 className="font-Poppins text-sm text-black dark:text-white">Log Out</h5>
      </div>
    </div>
  );
};

export default SideBarProfile;

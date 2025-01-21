'use client';

import React, { FC, useEffect, useState } from 'react';
import SideBarProfile from './SideBarProfile';
import { useLogOutQuery } from '@/redux/features/auth/authApi';
import { signOut } from 'next-auth/react';
import ProfileInfo from './ProfileInfo';
import ChangePassword from './ChangePassword'

type Props = {
  user: any;
};

const Profile: FC<Props> = ({ user }) => {
  const [scroll, setScroll] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [logout, setLogout] = useState(false);

  const {} = useLogOutQuery(undefined, {
    skip: !logout ? true : false,
  });

  const [active, setActive] = useState(1);

  const logOutHandler = async () => {
    setLogout(true);
    await signOut();
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 85) {
        setScroll(true);
      } else {
        setScroll(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4 md:p-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
      {/* flex flex-col items-center p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-lg rounded-md w-full max-w-lg mx-auto */}
      <div
        className={`transition-all duration-300 w-full md:w-[310px] h-auto md:h-[450px] bg-white dark:bg-slate-900 shadow-md rounded-md p-4 ${
          scroll ? 'fixed top-[100px]' : 'relative top-[30px]'
        }`}
      >
        <SideBarProfile
          
          user={user}
          active={active}
          avatar={avatar}
          setActive={setActive}
          logOutHandler={logOutHandler}
        />
      </div>
      <div className="flex-1 mt-8">
        {active === 1 && <ProfileInfo avatar={avatar} user={user} />}
        {active === 2 && <ChangePassword avatar={avatar} user={user} />}
      </div>
    </div>
  );
};

export default Profile;

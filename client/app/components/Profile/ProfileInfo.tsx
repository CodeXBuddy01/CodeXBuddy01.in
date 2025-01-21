import Image from 'next/image';
import React, { FC, useEffect, useState } from 'react';
import { AiOutlineCamera } from 'react-icons/ai';
import avatarIcon from '../../../public/assests/avatar.svg';
import { useEditProfileMutation, useUpdateAvatarMutation } from '@/redux/features/user/userApi';
import { useLoadUserQuery } from '@/redux/features/api/apiSlice';
import toast from 'react-hot-toast';

type Props = {
  avatar: string | null;
  user: any;
};

const ProfileInfo: FC<Props> = ({ avatar, user }) => {
  const [name, setName] = useState(user && user.name);
  const [updateAvatar, {isSuccess, error}] = useUpdateAvatarMutation();
  const [editProfile, {isSuccess:success, error:updateError}] = useEditProfileMutation();
  const [loadUser, setLoadUser] = useState(false);
  const {} = useLoadUserQuery(undefined, {skip: loadUser ? false : true});

  const imageHandler = async (e: any) => {
    const fileReader = new FileReader();

    fileReader.onload = () => {
      if(fileReader.readyState === 2){
        const avatar = fileReader.result;
        updateAvatar(
          avatar,
        )
      }
    }
    fileReader.readAsDataURL(e.target.files[0]);
  };

  useEffect(() => {
    if(isSuccess || success){
      setLoadUser(true);
    }
    if(error || updateError){
      console.log(error)
    }
    if(success){
      toast.success("Profile updated successfully!")
    }
  }, [isSuccess, error, success, updateError]);
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(name !== "") {
      await editProfile({
        name: name,
      })
    }
  };

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-lg rounded-md w-full max-w-lg mx-auto">
      {/* Avatar Section */}
      <div className="relative mb-4 sm:mb-6">
        <Image
          src={user.avatar || avatar ? user.avatar.url || avatar : avatarIcon}
          alt="User Avatar"
          width={120}
          height={120}
          className="rounded-full object-cover border-[4px] border-[#37a39a]"
        />
        <input
          type="file"
          name=''
          id="avatar"
          className="hidden"
          onChange={imageHandler}
          accept="image/png, image/jpg, image/jpeg, image/webp"
        />
        <label
          htmlFor="avatar"
          className="absolute bottom-0 right-0 w-10 h-10 sm:w-12 sm:h-12 bg-[#37a39a] text-white rounded-full flex items-center justify-center cursor-pointer"
        >
          <AiOutlineCamera size={20} />
        </label>
      </div>

      {/* User Information Form */}
      <form onSubmit={handleSubmit} className="w-full px-2 sm:px-4">
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-200 font-medium mb-1">Full Name</label>
          <input
            type="text"
            className="w-full p-2 sm:p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#37a39a] focus:outline-none dark:bg-gray-700 text-gray-500 dark:text-gray-400"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-200 font-medium mb-1">Email Address</label>
          <input
            type="text"
            className="w-full p-2 sm:p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
            readOnly
            required
            value={user?.email}
          />
        </div>
        <input
          className="w-full px-4 py-2 sm:px-6 sm:py-3 bg-[#37a39a] text-white font-semibold rounded-md hover:bg-[#2d8d85] transition duration-200"
          required
          value="Update"
          type="submit"
        />
      </form>
    </div>
  );
};

export default ProfileInfo;

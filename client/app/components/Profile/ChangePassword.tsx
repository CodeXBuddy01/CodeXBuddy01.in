import { useUpdatePasswordMutation } from '@/redux/features/user/userApi';
import Image from 'next/image';
import React, { FC, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

type Props = {
  avatar: string | null;
  user: any;
};

const ChangePassword: FC<Props> = (props) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [updatePassword, {isSuccess, error}] = useUpdatePasswordMutation();

  const passwordChangeHandler = async (e:any) => {
    e.preventDefault();

    if(newPassword !== confirmPassword){
        toast.error("Password do not match");
    } else {
        await updatePassword({oldPassword,newPassword});
    }
  }

  useEffect(() => {
    if(isSuccess){
        toast.success("Password changed successfully!")
    }
    if(error) {
        if("data" in error) {
            const errorData = error as any;
            toast.error(errorData.data.message);
        }
    }
  }, [isSuccess, error]);

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-lg rounded-md w-full max-w-lg mx-auto">
        <h1 className='block text-[25px] 800px:text-[30px] font-Poppins text-center font-[500] text-black dark:text-[#fff] pb-2'>Change Password</h1>
      {/* User Information Form */}
      <form onSubmit={passwordChangeHandler} className="w-full px-2 sm:px-4">
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-200 font-medium mb-1">Enter your old password</label>
          <input
            type="password"
            className="w-full p-2 sm:p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#37a39a] focus:outline-none dark:bg-gray-700 text-gray-500 dark:text-gray-400"
            required
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-200 font-medium mb-1">Enter your new password</label>
          <input
            type="password"
            className="w-full p-2 sm:p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-200 font-medium mb-1">Enter your confirm password</label>
          <input
            type="password"
            className="w-full p-2 sm:p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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

export default ChangePassword;

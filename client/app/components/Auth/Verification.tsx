import { styles } from '@/app/styles/style';
import { useActivationMutation } from '@/redux/features/auth/authApi';
import React, { FC, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { VscWorkspaceTrusted } from 'react-icons/vsc';
import { useSelector } from 'react-redux';

type Props = {
    setRoute: (route: string) => void;
};

type VerifyNumber = {
    [key: number]: string;
};

const Verification: FC<Props> = ({ setRoute }) => {
    const { token } = useSelector((state: any) => state.auth);
    const [activation, { isSuccess, error }] = useActivationMutation();
    const [invalidError, setInvalidError] = useState<boolean>(false);

    useEffect(() => {
        if (isSuccess) {
            toast.success("Account activated successfully");
            setRoute("Login");
        }
        if (error) {
            if ("data" in error) {
                const errorData = error as any;
                toast.error(errorData.data.message);
            } else {
                console.log('An error occurred', error);
            }
        }
    }, [isSuccess, error]);

    const inputRefs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

    const [verifyNumber, setVerifyNumber] = useState<VerifyNumber>({
        0: "",
        1: "",
        2: "",
        3: "",
        4: "",
        5: "",
    });

    // OTP Verification Handler
    const verificationHandler = async () => {
        const verificationNumber = Object.values(verifyNumber).join("");
        if (verificationNumber.length !== 6) {
            setInvalidError(true);
            return;
        }
        await activation({
            activation_token: token,
            activation_code: verificationNumber,
        });
    };

    // Handle Input Changes
    const handleInputChange = (index: number, value: string) => {
        setInvalidError(false);

        // Allow only numeric input
        if (!/^\d$/.test(value)) return;

        // Update state
        const newVerifyNumber = { ...verifyNumber, [index]: value };
        setVerifyNumber(newVerifyNumber);

        // Move focus to next input
        if (value && index < 5) {
            inputRefs[index + 1].current?.focus();
        }
    };

    // Handle Backspace
    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            const newVerifyNumber = { ...verifyNumber, [index]: "" };
            setVerifyNumber(newVerifyNumber);

            if (index > 0) {
                inputRefs[index - 1].current?.focus();
            }
        }
    };

    return (
        <div>
            <h1 className={`${styles.title}`}>
                Verify Your Account
            </h1>
            <br />
            <div className='w-full flex items-center justify-center mt-2'>
                <div className='w-[80px] h-[80px] rounded-full bg-[#497DF2] flex items-center justify-center'>
                    <VscWorkspaceTrusted size={40} />
                </div>
            </div>
            <br />
            <br />
            <div className='m-auto flex items-center justify-around'>
                {Array.from({ length: 6 }, (_, index) => (
                    <input
                        key={index}
                        ref={inputRefs[index]}
                        type='text' // Changed from 'number' to 'text'
                        className={`w-[65px] h-[65px] bg-transparent border-[3px] rounded-[10px] flex items-center text-black dark:text-white justify-center text-[18px] font-Poppins outline-none text-center ${
                            invalidError
                                ? "shake border-red-500"
                                : "dark:border-white border-[#0000004a]"
                        }`}
                        maxLength={1}
                        value={verifyNumber[index]}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                    />
                ))}
            </div>
            <br />
            <br />
            <div className='w-full flex justify-center'>
                <button className={`${styles.button}`} onClick={verificationHandler}>
                    Verify OTP
                </button>
            </div>
            <br />
            <h5 className='text-center pt-4 font-Poppins text-[14px] text-black dark:text-white'>
                Go back to Sign in?{" "}
                <span className='text-[#2190ff] pl-1 cursor-pointer' onClick={() => setRoute("Login")}>
                    Sign in
                </span>
            </h5>
        </div>
    );
};

export default Verification;

import Image from "next/image";
import React, { FC } from "react";

// Define Props (if needed, but here it's empty)
type Props = {};

const Hero: FC<Props> = () => {
  return (
    <div className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 dark:from-gray-800 dark:to-gray-900 py-20">
      <div className="container mx-auto px-5 flex flex-col-reverse lg:flex-row items-center justify-between gap-10">
        {/* Left Content */}
        <div className="text-center lg:text-left max-w-lg">
          <h1 className="text-4xl lg:text-6xl font-extrabold text-white leading-tight">
            Welcome to <span className="text-yellow-300">CodeXBuddy01</span>
          </h1>
          <p className="text-lg text-gray-200 mt-4">
            Learn programming from the best! Build your skills in MERN, Redux,
            and more with a fun, interactive platform.
          </p>
          <div className="mt-6 flex justify-center lg:justify-start gap-4">
            <button className="px-6 py-3 bg-yellow-400 text-gray-900 font-bold rounded-md shadow-md hover:bg-yellow-500 transition">
              Get Started
            </button>
            <button className="px-6 py-3 bg-gray-800 text-white font-bold rounded-md shadow-md hover:bg-gray-700 transition">
              Learn More
            </button>
          </div>
        </div>

        {/* Right Image */}
        <div className="w-full lg:w-1/2">
          <Image
            src="/assests/banner-img-1.png" // Corrected path
            alt="Hero Illustration"
            width={500} // Provide explicit dimensions
            height={500}
            className="w-full h-auto rounded-lg shadow-lg"
            priority // Optimize image for initial load
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;

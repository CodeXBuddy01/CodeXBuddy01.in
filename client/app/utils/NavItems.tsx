// Importing required dependencies
import Image from "next/image";
import Link from "next/link";
import React from "react";

// Navigation items data
export const navItemsData = [
  { name: "Home", url: "/" },
  { name: "Courses", url: "/courses" },
  { name: "About", url: "/about" },
  { name: "Policy", url: "/policy" },
  { name: "FAQ", url: "/faq" },
];

// Props type
type Props = {
  activeItem: number;
  isMobile: boolean;
};

const NavItems: React.FC<Props> = ({ activeItem, isMobile }) => {
  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden 800px:flex space-x-6">
        {navItemsData.map((item, index) => (
          <Link href={item.url} key={index} passHref>
            <span
              className={`transition-colors duration-300 ease-in-out cursor-pointer rounded-lg px-4 py-2 font-Poppins text-[18px] font-[400] ${
                activeItem === index
                  ? "dark:text-[#37a39a] text-[crimson] border-b-2 border-crimson"
                  : "dark:text-white text-black hover:text-[crimson] hover:dark:text-[#37a39a]"
              }`}
            >
              {item.name}
            </span>
          </Link>
        ))}
      </div>

      {/* Mobile Navigation */}
      {isMobile && (
        <div className="800px:hidden mt-5">
          <div className="w-full text-center py-6">
            <Link href="/" passHref>
              <span className="text-[25px] font-Poppins font-[500] text-black dark:text-white flex items-center justify-center">
                {/* Logo */}
                <div className="w-12 h-12 lg:w-16 lg:h-16 relative flex items-center justify-center">
                  <Image
                    src="/assests/CXB01.png" // Corrected path
                    alt="CodeXBuddy01 Logo"
                    width={64}
                    height={64}
                    className="object-contain"
                    priority
                  />
                  <span className="ml-2">CodeXBuddy01</span>
                </div>
              </span>
            </Link>
          </div>

          <div className="flex flex-col space-y-4">
            {navItemsData.map((item, index) => (
              <Link href={item.url} key={index} passHref>
                <span
                  className={`block text-center rounded-lg px-4 py-2 font-Poppins text-[18px] font-[400] transition-colors duration-300 ease-in-out cursor-pointer ${
                    activeItem === index
                      ? "dark:text-[#37a39a] text-[crimson] bg-gray-100 dark:bg-gray-800"
                      : "dark:text-white text-black hover:text-[crimson] hover:dark:text-[#37a39a]"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default NavItems;

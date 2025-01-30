'use client'

import React from 'react'
import Heading from '../utils/Heading'
import AdminSidebar from '../components/Admin/sidebar/AdminSidebar'
import AdminProtected from '../hooks/adminProtected'
import DashboardHero from '../components/Admin/DashboardHero'

type Props = {}

const page = (props: Props) => {
  return (
    <div>
        <AdminProtected>
        <Heading 
        title='CodeXBuddy01 Admin'
        description='CodeXBuddy01 is a platform for developers to create and manage code'
        keywords='Programming, MERN, Visual Studio, Redux, NextJS'
        />
        <div className='flex h-[200vh]'>
            <div className="1500px:w-[16%] w-1/5">
            <AdminSidebar />
            </div>
            <div className="w-[85%]">
              <DashboardHero />
            </div>
        </div>
        </AdminProtected>
    </div>
  )
}

export default page
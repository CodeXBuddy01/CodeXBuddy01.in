import React, {FC, useState} from 'react'

type Props = {
  courseInfo: any;
  setCourseInfo: (courseInfo: any) => void;
  active: number;
  setActive: (active: number) => void;
}

const CourseInformation:FC<Props> = ({courseInfo, setCourseInfo, active, setActive}) => {
  const [dragging, setDragging] = useState(false);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setActive(active + 1);
  };

  return (
    <div className='w-[80%] m-auto mt-24'>
      <form onSubmit={handleSubmit}>
        <div>
        <label htmlFor="">
          Course Name
        </label>
        <input 
        type="name"
        name=''
        required
        value={courseInfo.name}
        onChange={(e:any) => setCourseInfo({ ...courseInfo, name: e.targer.value})}
        id='name'
        placeholder='MERN Stack LMS Platform with NEXT 13'
        className={'${styles.input'}
         />
        </div>
        <br />
        <div className='mb-5'>
          <label className={`${styles.label}`}>Course Description</label>
          <textarea name="" id="" cols={30} rows={10}
          placeholder='Write something amazing...'
          className={`${styles.input} !h-min !py-2`}
          ></textarea>
        </div>
      </form>
    </div>
  )
}

export default CourseInformation
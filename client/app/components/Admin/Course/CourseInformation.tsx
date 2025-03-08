import { styles } from "@/app/styles/style";
import React, { FC, useState, DragEvent, ChangeEvent } from "react";

type CourseInfo = {
  name: string;
  description: string;
  price: string;
  estimatedPrice?: string;
  tags: string;
  level: string;
  demoUrl: string;
  thumbnail?: string;
};

type Props = {
  courseInfo: CourseInfo;
  setCourseInfo: (courseInfo: CourseInfo) => void;
  active: number;
  setActive: (active: number) => void;
};

const CourseInformation: FC<Props> = ({
  courseInfo,
  setCourseInfo,
  active,
  setActive,
}) => {
  const [dragging, setDragging] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActive(active + 1);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setCourseInfo({ ...courseInfo, thumbnail: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCourseInfo({ ...courseInfo, thumbnail: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-[80%] m-auto mt-36">
      <form onSubmit={handleSubmit} className={`${styles.label}`}>
        {/* Course Name */}
        <div>
          <label>Course Name</label>
          <input
            type="text"
            name="name"
            required
            value={courseInfo.name}
            onChange={(e) => setCourseInfo({ ...courseInfo, name: e.target.value })}
            placeholder="MERN Stack LMS Platform with NEXT 13"
            className={`${styles.input}`}
          />
        </div>

        {/* Course Description */}
        <div className="my-5">
          <label className={`${styles.label}`}>Course Description</label>
          <textarea
            name="description"
            cols={30}
            rows={10}
            placeholder="Write something amazing..."
            className={`${styles.input} !h-min !py-2`}
            value={courseInfo.description}
            onChange={(e) => setCourseInfo({ ...courseInfo, description: e.target.value })}
          />
        </div>

        {/* Pricing Section */}
        <div className="w-full flex justify-between my-5">
          <div className="w-[45%]">
            <label className={`${styles.label}`}>Course Price</label>
            <input
              type="number"
              name="price"
              required
              value={courseInfo.price}
              onChange={(e) => setCourseInfo({ ...courseInfo, price: e.target.value })}
              placeholder="299"
              className={`${styles.input}`}
            />
          </div>
          <div className="w-[45%]">
            <label className={`${styles.label}`}>Estimated Price (optional)</label>
            <input
              type="number"
              name="estimatedPrice"
              value={courseInfo.estimatedPrice || ""}
              onChange={(e) => setCourseInfo({ ...courseInfo, estimatedPrice: e.target.value })}
              placeholder="999"
              className={`${styles.input}`}
            />
          </div>
        </div>

        {/* Course Tags */}
        <div className="my-5">
          <label className={`${styles.label}`}>Course Tag</label>
          <input
            type="text"
            name="tags"
            required
            value={courseInfo.tags}
            onChange={(e) => setCourseInfo({ ...courseInfo, tags: e.target.value })}
            placeholder="MERN, Next.js, Socket io, Node.js"
            className={`${styles.input}`}
          />
        </div>

        {/* Course Level and Demo URL */}
        <div className="w-full flex justify-between my-5">
          <div className="w-[45%]">
            <label className={`${styles.label}`}>Course Level</label>
            <input
              type="text"
              name="level"
              required
              value={courseInfo.level}
              onChange={(e) => setCourseInfo({ ...courseInfo, level: e.target.value })}
              placeholder="Beginner/Intermediate/Expert"
              className={`${styles.input}`}
            />
          </div>
          <div className="w-[45%]">
            <label className={`${styles.label}`}>Demo URL</label>
            <input
              type="text"
              name="demoUrl"
              required
              value={courseInfo.demoUrl}
              onChange={(e) => setCourseInfo({ ...courseInfo, demoUrl: e.target.value })}
              placeholder="eer74fd"
              className={`${styles.input}`}
            />
          </div>
        </div>

        {/* Thumbnail Upload */}
        <div className="w-full my-5">
          <input
            type="file"
            accept="image/*"
            id="thumbnail"
            className="hidden"
            onChange={handleFileChange}
          />
          <label
            htmlFor="thumbnail"
            className={`w-full min-h-[10vh] dark:border-white border-[#00000026] p-3 border flex items-center justify-center ${
              dragging ? "bg-blue-500" : "bg-transparent"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {courseInfo.thumbnail ? (
              <img
                src={courseInfo.thumbnail}
                alt="Course thumbnail"
                className="max-h-full w-full object-cover"
              />
            ) : (
              <span className="text-black dark:text-white">
                {dragging ? "Drop Here" : "Drag and drop thumbnail or click to browse"}
              </span>
            )}
          </label>
        </div>

        {/* Submit Button */}
        <div className="w-full flex items-center justify-end my-5">
          <button
            type="submit"
            className="w-full 800px:w-[180px] h-[40px] bg-[#37a39a] text-white rounded mt-8 cursor-pointer hover:bg-[#2d847e] transition-colors"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseInformation;
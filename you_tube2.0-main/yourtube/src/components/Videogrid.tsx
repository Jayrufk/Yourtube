import React, { useEffect, useState } from "react";
import Videocard from "./videocard";
import axiosInstance from "@/lib/axiosinstance";

const Videogrid = () => {
  const [videos, setvideo] = useState<any[]>([]);
  const [loading, setloading] = useState(true);

  useEffect(() => {
    const fetchvideo = async () => {
      try {
        const res = await axiosInstance.get("/video/getall");
        setvideo(res.data || []);
      } catch (error) {
        console.log(error);
        setvideo([]);
      } finally {
        setloading(false);
      }
    };
    fetchvideo();
  }, []);

  return (
    <div className="mt-4 grid 
      grid-cols-1 
      sm:grid-cols-2 
      md:grid-cols-3 
      lg:grid-cols-4 
      gap-6 px-2">

      {loading ? (
        <p className="text-center col-span-full text-gray-600">Loading...</p>
      ) : videos.length > 0 ? (
        videos.map((video: any) => (
          <Videocard key={video._id} video={video} />
        ))
      ) : (
        <p className="text-center col-span-full text-gray-500">
          No videos found
        </p>
      )}
    </div>
  );
};

export default Videogrid;

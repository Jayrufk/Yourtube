"use client";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "./ui/avatar";

export default function VideoCard({ video }: any) {
  return (
    <Link href={`/watch/${video?._id}`} className="group block">
      <div className="space-y-3">
        <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-200">
          <img
            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/${video?.thumbnail}`}
            alt="thumbnail"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] px-1.5 py-0.5 rounded">
            10:24
          </div>
        </div>

        <div className="flex gap-3">
          <Avatar className="w-9 h-9 flex-shrink-0">
            <AvatarFallback className="uppercase">
              {video?.videochanel?.[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[15px] leading-tight line-clamp-2 group-hover:text-black">
              {video?.videotitle}
            </h3>

            <p className="text-sm text-gray-600 mt-[2px]">
              {video?.videochanel}
            </p>

            <p className="text-sm text-gray-600">
              {video?.views?.toLocaleString()} views •{" "}
              {formatDistanceToNow(new Date(video?.createdAt))} ago
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

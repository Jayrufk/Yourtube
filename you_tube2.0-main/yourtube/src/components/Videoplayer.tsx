"use client";

import { useRef, useState } from "react";

interface VideoPlayerProps {
  video: {
    _id: string;
    videotitle: string;
    filepath: string;
    thumbnail?: string;
  };
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [toast, setToast] = useState<{ icon: string; text: string } | null>(null);
  let tapTimeout: any = null;
  let tapCount = 0;

  const showToast = (icon: string, text: string) => {
    setToast({ icon, text });
    setTimeout(() => setToast(null), 800);
  };

  const scrollToComments = () => {
    const el = document.getElementById("comments");
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goToNextVideo = () => {
    const links = Array.from(
      document.querySelectorAll('a[href^="/watch/"]')
    ) as HTMLAnchorElement[];

    const currentIndex = links.findIndex((l) =>
      l.href.includes(video._id)
    );

    if (currentIndex !== -1 && links[currentIndex + 1]) {
      links[currentIndex + 1].click();
      return;
    }

    if (links.length > 0) {
      links[0].click();
    }
  };

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    tapCount++;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;

    const zone =
      x < rect.width / 3
        ? "left"
        : x > (rect.width * 2) / 3
        ? "right"
        : "middle";

    clearTimeout(tapTimeout);

    tapTimeout = setTimeout(() => {
      if (tapCount === 1 && zone === "middle") {
        videoEl.paused ? videoEl.play() : videoEl.pause();
        showToast(videoEl.paused ? "⏸️" : "▶️", videoEl.paused ? "Paused" : "Playing");
      }

      if (tapCount === 2) {
        if (zone === "right") {
          videoEl.currentTime += 10;
          showToast("⏩", "+10s");
        }
        if (zone === "left") {
          videoEl.currentTime -= 10;
          showToast("⏪", "-10s");
        }
      }

      if (tapCount === 3) {
        if (zone === "middle") {
          showToast("⏭️", "Next Video");
          goToNextVideo();
        }
        if (zone === "right") {
          showToast("🏠", "Home");
          window.location.href = "/";
        }
        if (zone === "left") {
          showToast("💬", "Comments");
          setTimeout(scrollToComments, 100);
        }
      }

      tapCount = 0;
    }, 300);
  };

  return (
    <div
      onClick={handleTap}
      className="relative aspect-video bg-black rounded-lg overflow-hidden"
    >
      {toast && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-2 px-5 py-3 bg-black/70 text-white rounded-full text-lg font-medium">
            <span className="text-2xl">{toast.icon}</span>
            <span>{toast.text}</span>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        className="w-full h-full"
        poster={`http://localhost:5000/uploads/${video?.thumbnail || "video.png"}`}
      >
        <source
          src={`http://localhost:5000/uploads/${video?.filepath}`}
          type="video/mp4"
        />
      </video>
    </div>
  );
}

import Link from "next/link";
import React, { useState } from "react";
import { Button } from "./ui/button";
import Channeldialogue from "./channeldialogue";
import { useUser } from "@/lib/AuthContext";
import { useRouter } from "next/router";
import { useLayout } from "@/pages/_app"; // ✅ GLOBAL COLLAPSE

import {
  MdHome,
  MdExplore,
  MdSubscriptions,
  MdHistory,
  MdThumbUp,
  MdWatchLater,
  MdPerson,
} from "react-icons/md";

const Sidebar = () => {
  const { collapsed } = useLayout();   // ✅ READ FROM GLOBAL CONTEXT
  const { user } = useUser();
  const router = useRouter();
  const [isdialogeopen, setisdialogeopen] = useState(false);

  const Icon = ({ children }: { children: React.ReactNode }) => (
    <span
      className={`text-black flex items-center
        ${collapsed ? "text-[22px]" : "text-[20px]"}
      `}
    >
      {children}
    </span>
  );

  const SidebarItem = ({
    href,
    icon,
    label,
  }: {
    href: string;
    icon: React.ReactNode;
    label: string;
  }) => {
    const active = router.pathname === href;

    return (
      <Link href={href}>
        <div
          className={`flex items-center
            ${collapsed ? "justify-center px-0" : "px-3 justify-start"}
            py-2.5 rounded-xl cursor-pointer
            transition-all duration-150
            ${active ? "bg-gray-200 font-medium" : "hover:bg-gray-100"}
          `}
        >
          <Icon>{icon}</Icon>

          {!collapsed && (
            <span className="ml-4 text-[15px] text-black truncate">
              {label}
            </span>
          )}
        </div>
      </Link>
    );
  };

  return (
    <aside
      className={`
        ${collapsed ? "w-16" : "w-64"}
        bg-white border-r min-h-screen p-3
        transition-all duration-200 select-none
      `}
    >
      <nav className="space-y-1">
        <SidebarItem href="/" icon={<MdHome />} label="Home" />
        <SidebarItem href="/explore" icon={<MdExplore />} label="Explore" />
        <SidebarItem href="/subscriptions" icon={<MdSubscriptions />} label="Subscriptions" />

        {user && (
          <div className="border-t pt-3 mt-3 space-y-1">
            <SidebarItem href="/history" icon={<MdHistory />} label="History" />
            <SidebarItem href="/liked" icon={<MdThumbUp />} label="Liked videos" />
            <SidebarItem href="/watch-later" icon={<MdWatchLater />} label="Watch later" />

            {user?.channelname ? (
              <SidebarItem
                href={`/channel/${user.id}`}
                icon={<MdPerson />}
                label="Your channel"
              />
            ) : (
              <div className="px-1 py-1">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => setisdialogeopen(true)}
                >
                  {!collapsed && "Create Channel"}
                </Button>
              </div>
            )}
          </div>
        )}
      </nav>

      <Channeldialogue
        isopen={isdialogeopen}
        onclose={() => setisdialogeopen(false)}
        mode="create"
      />
    </aside>
  );
};

export default Sidebar;

import { Bell, Menu, Mic, Search, User, VideoIcon } from "lucide-react";
import React, { useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Channeldialogue from "./channeldialogue";
import { useRouter } from "next/router";
import { useUser } from "@/lib/AuthContext";
import { useLayout } from "@/pages/_app";
import Image from "next/image";

const Header = () => {
  const { collapsed, setCollapsed } = useLayout();

  // ✅ ONLY NECESSARY CHANGE: loading added
  const { user, logout, handlegooglesignin, loading } = useUser();

  // ✅ STOP RENDER UNTIL AUTH IS READY
  if (loading) return null;

  const [searchQuery, setSearchQuery] = useState("");
  const [isdialogeopen, setisdialogeopen] = useState(false);

  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeypress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(e as any);
    }
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 bg-white border-b sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-gray-200"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Menu className="w-8 h-8" />
        </Button>

        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Image
              src="/youtube-logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="rounded-md"
            />

            <span
              className="flex items-baseline text-[22px] tracking-tight"
              style={{ fontFamily: "Roboto, Arial, sans-serif" }}
            >
              <span style={{ fontWeight: 700 }}>YourTube</span>
            </span>

            <span className="text-xs text-gray-400">IN</span>
          </div>
        </Link>
      </div>

      <form
        onSubmit={handleSearch}
        className="flex items-center gap-3 flex-1 max-w-2xl mx-6"
      >
        <div className="flex flex-1 border rounded-full overflow-hidden bg-white shadow-sm">
          <Input
            type="search"
            placeholder="Search"
            value={searchQuery}
            onKeyPress={handleKeypress}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-none border-none px-4 py-2 focus-visible:ring-0 text-[15px]"
          />

          <Button
            type="submit"
            className="rounded-none rounded-r-full px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 border-l"
          >
            <Search className="w-5 h-5" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <Mic className="w-5 h-5" />
        </Button>
      </form>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Button variant="ghost" size="icon" className="hover:bg-gray-100">
              <VideoIcon className="w-6 h-6" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-gray-100">
              <Bell className="w-6 h-6" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image} />
                    <AvatarFallback>
                      {user.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56" align="end">
                {user?.channelname ? (
                  <DropdownMenuItem asChild>
                    <Link href={`/channel/${user?._id}`}>Your channel</Link>
                  </DropdownMenuItem>
                ) : (
                  <div className="px-2 py-1.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={() => setisdialogeopen(true)}
                    >
                      Create Channel
                    </Button>
                  </div>
                )}

                <DropdownMenuItem asChild>
                  <Link href="/history">History</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/liked">Liked videos</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/watch-later">Watch later</Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={logout}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Button
            className="flex items-center gap-2 border px-4 py-1 rounded-full"
            onClick={handlegooglesignin}
          >
            <User className="w-4 h-4" />
            Sign in
          </Button>
        )}
      </div>

      <Channeldialogue
        isopen={isdialogeopen}
        onclose={() => setisdialogeopen(false)}
        mode="create"
      />
    </header>
  );
};

export default Header;

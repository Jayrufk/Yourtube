import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";

interface Comment {
  _id: string;
  videoid: string;
  userid: string;
  commentbody: string;
  usercommented: string;
  commentedon: string;
  usercity?: string;
  likes?: string[];
  dislikes?: string[];
  removed?: boolean;
  translated?: { [key: string]: string };
  showingTranslated?: boolean;
  currentLang?: string;
}

const LANGUAGES = [
  { name: "English", code: "en" },
  { name: "Hindi", code: "hi" },
  { name: "Marathi", code: "mr" },
  { name: "Bengali", code: "bn" },
  { name: "Gujarati", code: "gu" },
  { name: "Tamil", code: "ta" },
  { name: "Telugu", code: "te" },
  { name: "Kannada", code: "kn" },
  { name: "Malayalam", code: "ml" },
  { name: "Punjabi", code: "pa" },
];

const Comments = ({ videoId }: any) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [videoId]);

  const loadComments = async () => {
    try {
      const res = await axiosInstance.get(`/comment/${videoId}`);
      setComments(res.data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  // ⭐ GET CITY USING GPS
  const getCityFromGPS = (): Promise<string> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve("City not shared");

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          try {
            const r = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
            );
            const data = await r.json();

            resolve(
              data.address.city ||
                data.address.town ||
                data.address.village ||
                "City not shared"
            );
          } catch {
            resolve("City not shared");
          }
        },
        () => resolve("City not shared"),
        { enableHighAccuracy: true }
      );
    });
  };

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;
    setIsSubmitting(true);

    let city = await getCityFromGPS();

    try {
      const res = await axiosInstance.post("/comment/postcomment", {
        videoid: videoId,
        userid: user._id,
        commentbody: newComment,
        usercommented: user.name,
        usercity: city,
      });

      if (res.data._id) {
        setComments([res.data, ...comments]);
      }

      setNewComment("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setEditText(comment.commentbody);
  };

  const handleUpdateComment = async () => {
    if (!editText.trim()) return;

    try {
      const res = await axiosInstance.post(
        `/comment/editcomment/${editingCommentId}`,
        { commentbody: editText }
      );

      if (res.data) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === editingCommentId ? { ...c, commentbody: editText } : c
          )
        );
        setEditingCommentId(null);
        setEditText("");
      }
    } catch {}
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await axiosInstance.delete(`/comment/deletecomment/${id}`);
      if (res.data.comment) {
        setComments((prev) => prev.filter((c) => c._id !== id));
      }
    } catch {}
  };

  const handleLike = async (id: string) => {
    if (!user) return;
    try {
      const res = await axiosInstance.post(`/comment/like/${id}`, {
        userid: user._id,
      });
      setComments((prev) => prev.map((c) => (c._id === id ? res.data : c)));
    } catch {}
  };

  const handleDislike = async (id: string) => {
    if (!user) return;
    try {
      const res = await axiosInstance.post(`/comment/dislike/${id}`, {
        userid: user._id,
      });

      if (res.data.removed) {
        setComments((prev) => prev.filter((c) => c._id !== id));
        return;
      }

      setComments((prev) => prev.map((c) => (c._id === id ? res.data : c)));
    } catch {}
  };

  // ⭐ TRANSLATE HANDLER
  const handleTranslate = async (id: string, lang: string) => {
    const target = comments.find((c) => c._id === id);
    if (!target) return;

    // Already showing this language → toggle back to original
    if (target.currentLang === lang) {
      setComments((prev) =>
        prev.map((c) =>
          c._id === id
            ? { ...c, currentLang: "", showingTranslated: false }
            : c
        )
      );
      return;
    }

    // If already translated → reuse
    if (target.translated?.[lang]) {
      setComments((prev) =>
        prev.map((c) =>
          c._id === id
            ? {
                ...c,
                currentLang: lang,
                showingTranslated: true,
              }
            : c
        )
      );
      return;
    }

    // Fresh translation
    try {
      const res = await axiosInstance.get(
        `/comment/translate/${id}?to=${lang}`
      );

      setComments((prev) =>
        prev.map((c) =>
          c._id === id
            ? {
                ...c,
                translated: {
                  ...c.translated,
                  [lang]: res.data.translatedText,
                },
                currentLang: lang,
                showingTranslated: true,
              }
            : c
        )
      );
    } catch {}
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{comments.length} Comments</h2>

      {user && (
        <div className="flex gap-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.image || "/default-avatar.png"} />
            <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e: any) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none border-b"
            />

            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setNewComment("")}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
              >
                Comment
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {comments.map((comment) => {
          const isTranslated = comment.showingTranslated && comment.currentLang;

          return (
            <div key={comment._id} className="flex gap-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src="/default-avatar.png" />
                <AvatarFallback>{comment.usercommented[0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">
                    {comment.usercommented}
                  </span>

                  <span className="text-xs text-gray-600">
                    {formatDistanceToNow(new Date(comment.commentedon))} ago
                  </span>

                  <span className="text-xs text-gray-600">
                    {comment.usercity || "City not shared"}
                  </span>
                </div>

                {editingCommentId === comment._id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />

                    <div className="flex gap-2">
                      <Button onClick={handleUpdateComment}>Save</Button>
                      <Button
                        variant="ghost"
                        onClick={() => setEditingCommentId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm">
                    {isTranslated
                      ? comment.translated?.[comment.currentLang!]
                      : comment.commentbody}
                  </p>
                )}

                <div className="flex gap-4 mt-2">
                  {/* ⭐ TRANSLATE / SHOW ORIGINAL BUTTON */}
                  {isTranslated ? (
                    // ⭐ Show Original (NO DROPDOWN)
                    <button
                      className="text-sm underline flex items-center gap-1"
                      onClick={() =>
                        setComments((prev) =>
                          prev.map((c) =>
                            c._id === comment._id
                              ? {
                                  ...c,
                                  currentLang: "",
                                  showingTranslated: false,
                                }
                              : c
                          )
                        )
                      }
                    >
                      Show Original
                      <span className="rotate-180">▼</span>
                    </button>
                  ) : (
                    // ⭐ Normal Translate dropdown
                    <DropdownMenu>
                      <DropdownMenuTrigger className="text-sm underline flex items-center gap-1">
                        Translate <span>▼</span>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent>
                        {LANGUAGES.map((l) => (
                          <DropdownMenuItem
                            key={l.code}
                            onClick={() =>
                              handleTranslate(comment._id, l.code)
                            }
                          >
                            {l.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  <button onClick={() => handleLike(comment._id)}>
                    👍 {comment.likes?.length || 0}
                  </button>

                  <button onClick={() => handleDislike(comment._id)}>
                    👎 {comment.dislikes?.length || 0}
                  </button>
                </div>

                {user && comment.userid === user._id && (
                  <div className="flex gap-2 mt-2 text-sm text-gray-500">
                    <button onClick={() => handleEdit(comment)}>Edit</button>
                    <button onClick={() => handleDelete(comment._id)}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Comments;

"use client";

import React, { useState } from "react";
import {
  Users2,
  MessageSquare,
  Sparkles,
  Search,
  Plus,
  ThumbsUp,
  Brain,
  Code2,
  Terminal,
  Rocket,
  Palette,
  Briefcase,
  Share2,
  Tag,
  CheckCircle2,
  Send,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { useData } from "@/context/DataContext";
import { Community } from "@/types";

export default function CommunitiesPage() {
  const {
    communities,
    toggleJoinCommunity,
    upvotePost,
    createPost,
  } = useData();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);

  // New Post Modal State
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postTags, setPostTags] = useState("");

  const categories = [
    { id: "all", label: "All Hubs" },
    { id: "AI & ML", label: "AI & ML" },
    { id: "Web Development", label: "Web Dev" },
    { id: "DSA & Prep", label: "DSA & Prep" },
    { id: "Startups", label: "Startups" },
    { id: "UI/UX Design", label: "UI/UX" },
    { id: "Career Growth", label: "Career Growth" },
  ];

  const filteredCommunities = communities.filter((comm) => {
    const matchesSearch =
      comm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comm.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || comm.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const activeCommunity = selectedCommunity || communities[0];

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    createPost(
      activeCommunity.id,
      postTitle.trim(),
      postContent.trim(),
      postTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    );

    setIsNewPostOpen(false);
    setPostTitle("");
    setPostContent("");
    setPostTags("");
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "AI & ML":
        return <Brain className="w-5 h-5" />;
      case "Web Development":
        return <Code2 className="w-5 h-5" />;
      case "DSA & Prep":
        return <Terminal className="w-5 h-5" />;
      case "Startups":
        return <Rocket className="w-5 h-5" />;
      case "UI/UX Design":
        return <Palette className="w-5 h-5" />;
      default:
        return <Briefcase className="w-5 h-5" />;
    }
  };

  return (
    <RoleGuard allowedRole="student">
      <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Student Communities &amp; Hubs
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Share code insights, prepare for placement rounds, and build alongside peer engineers.
          </p>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider shrink-0 transition-colors border ${
                selectedCategory === cat.id
                  ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                  : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search communities..."
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* 2-Column Layout: Hub Cards (Left) & Active Community Feed (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Community Directory (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
            Explore Hubs ({filteredCommunities.length})
          </h2>

          <div className="space-y-3.5">
            {filteredCommunities.map((comm) => {
              const isSelected = comm.id === activeCommunity.id;
              return (
                <Card
                  key={comm.id}
                  hoverEffect
                  onClick={() => setSelectedCommunity(comm)}
                  className={`p-4 border-border/80 bg-card cursor-pointer transition-all ${
                    isSelected
                      ? "ring-2 ring-purple-500/50 bg-purple-500/5 dark:bg-purple-950/20"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-muted border border-border/60 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                        {getCategoryIcon(comm.category)}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-foreground leading-snug">
                          {comm.name}
                        </h3>
                        <span className="text-[11px] text-muted-foreground">
                          {comm.category}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant={comm.isJoined ? "secondary" : "gradient"}
                      size="sm"
                      className="h-7 text-xs px-3 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleJoinCommunity(comm.id);
                      }}
                    >
                      {comm.isJoined ? "Joined" : "Join"}
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {comm.description}
                  </p>

                  <div className="pt-3 mt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users2 className="w-3.5 h-3.5 text-purple-500" />
                      {comm.membersCount.toLocaleString()} members
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                      {comm.activeDiscussions} discussions
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Community Posts & Discussions Feed (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Community Banner */}
          <Card className="p-6 border-border/80 bg-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  {getCategoryIcon(activeCommunity.category)}
                </div>
                <div>
                  <h2 className="font-bold text-lg text-foreground">
                    {activeCommunity.name}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {activeCommunity.membersCount.toLocaleString()} student members • {activeCommunity.activeDiscussions} active topics
                  </p>
                </div>
              </div>

              <Button
                variant="gradient"
                size="sm"
                onClick={() => setIsNewPostOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                New Discussion
              </Button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {activeCommunity.description}
            </p>
          </Card>

          {/* Posts Feed */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
              Recent Discussions
            </h3>

            {activeCommunity.posts.length === 0 ? (
              <div className="p-8 border border-dashed border-border rounded-2xl text-center text-xs text-muted-foreground bg-card">
                No discussions in this hub yet. Be the first to start a conversation!
              </div>
            ) : (
              activeCommunity.posts.map((post) => (
                <Card
                  key={post.id}
                  hoverEffect
                  className="p-5 border-border/80 bg-card space-y-3.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        src={post.author.avatar}
                        name={post.author.name}
                        size="sm"
                      />
                      <div>
                        <div className="font-bold text-xs text-foreground">
                          {post.author.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {post.author.headline} • {post.timestamp}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-foreground hover:text-purple-600 transition-colors">
                      {post.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {post.content}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-medium text-foreground/70 border border-border/40"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                    <button
                      onClick={() => upvotePost(activeCommunity.id, post.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${
                        post.hasUpvoted
                          ? "bg-purple-500/10 border-purple-500/40 text-purple-600 dark:text-purple-400 font-bold"
                          : "border-border hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{post.upvotes} Upvotes</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{post.commentCount} Comments</span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Start a Discussion Modal */}
      <Modal
        isOpen={isNewPostOpen}
        onClose={() => setIsNewPostOpen(false)}
        title={`Post in ${activeCommunity.name}`}
        description="Ask a question, share a hackathon learning, or start an architecture review."
      >
        <form onSubmit={handleCreatePost} className="space-y-4">
          <Input
            label="Topic Title"
            placeholder="e.g. How to structure CRDT synchronization in React 19"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            required
          />

          <Input
            label="Tags (comma-separated)"
            placeholder="React, TypeScript, Architecture"
            value={postTags}
            onChange={(e) => setPostTags(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase mb-1.5">
              Content &amp; Insights
            </label>
            <textarea
              rows={4}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Share the problem you solved, code snippet notes, or question details..."
              className="w-full p-3 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsNewPostOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gradient" size="sm" rightIcon={<Send className="w-3.5 h-3.5" />}>
              Publish Post
            </Button>
          </div>
        </form>
      </Modal>
    </div>
    </RoleGuard>
  );
}

"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Flame,
  Sparkles,
  Clock,
  TrendingUp,
  Bookmark,
  MessageSquare,
  Share2,
  ArrowBigUp,
  ArrowBigDown,
  Search,
  Plus,
  CheckCircle2,
  ShieldCheck,
  Award,
  ExternalLink,
  Code2,
  Terminal,
  Brain,
  Rocket,
  Briefcase,
  ShieldAlert,
  Users2,
  Calendar,
  ChevronRight,
  ChevronDown,
  Check,
  Send,
  Github,
  Compass,
  HelpCircle,
  Tag,
  Globe,
  Info,
  Layers,
  FileText,
  AlertCircle,
  X,
  SlidersHorizontal,
  Menu,
  Filter,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  Community,
  CommunityPost,
  CommunityComment,
  PostType,
  CommunityDomain,
} from "@/types";
import {
  initialRedditPosts,
  structuredMockCommunities,
  trendingTopics,
  communityRules,
} from "@/lib/community-store";
import { useSidebar } from "@/context/SidebarContext";

export default function CommunitiesPage() {
  const { user } = useAuth();
  const { success, info } = useToast();
  const { openMobileDrawer } = useSidebar();

  // --------------------------------------------------------------------------
  // Core State: Posts & Communities
  // --------------------------------------------------------------------------
  const [posts, setPosts] = useState<CommunityPost[]>(initialRedditPosts);
  const [communities, setCommunities] = useState<Community[]>(structuredMockCommunities);

  // Active Navigation & Filters
  const [activeFeed, setActiveFeed] = useState<
    "home" | "popular" | "latest" | "following" | "saved"
  >("home");
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [selectedPostType, setSelectedPostType] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"hot" | "new" | "top" | "discussed">("hot");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);

  // Compact Category Filter Dropdowns (More dropdown & Mobile popover)
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        moreDropdownRef.current &&
        !moreDropdownRef.current.contains(e.target as Node)
      ) {
        setIsMoreMenuOpen(false);
      }
      if (
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(e.target as Node)
      ) {
        setIsMobileCategoryOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMoreMenuOpen(false);
        setIsMobileCategoryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Category Configuration for Compact Post-Type Filter
  const primaryCategories = useMemo(
    () => [
      { id: "ALL", label: "All Posts", icon: Layers, visibility: "inline-flex" },
      { id: "DISCUSSION", label: "Discussions", icon: MessageSquare, visibility: "inline-flex" },
      { id: "PROJECT", label: "Projects", icon: Code2, visibility: "inline-flex" },
      { id: "INTERNSHIP", label: "Internships", icon: Briefcase, visibility: "hidden md:inline-flex" },
      { id: "QUESTION", label: "Questions", icon: HelpCircle, visibility: "hidden lg:inline-flex" },
      { id: "RESOURCE", label: "Resources", icon: FileText, visibility: "hidden xl:inline-flex" },
    ],
    []
  );

  const moreCategories = useMemo(
    () => [
      { id: "RESOURCE", label: "Resources", icon: FileText, breakpoint: "xl:hidden" },
      { id: "QUESTION", label: "Questions", icon: HelpCircle, breakpoint: "lg:hidden" },
      { id: "INTERNSHIP", label: "Internships", icon: Briefcase, breakpoint: "md:hidden" },
      { id: "HACKATHON", label: "Hackathons", icon: Rocket, breakpoint: "" },
      { id: "ACHIEVEMENT", label: "Achievements", icon: Award, breakpoint: "" },
      { id: "EVENT", label: "Campus Events", icon: Calendar, breakpoint: "" },
      { id: "POLL", label: "Student Polls", icon: SlidersHorizontal, breakpoint: "" },
    ],
    []
  );

  const allCategories = useMemo(
    () => [
      { id: "ALL", label: "All Posts", icon: Layers },
      { id: "DISCUSSION", label: "Discussions", icon: MessageSquare },
      { id: "PROJECT", label: "Projects", icon: Code2 },
      { id: "INTERNSHIP", label: "Internships", icon: Briefcase },
      { id: "QUESTION", label: "Questions", icon: HelpCircle },
      { id: "RESOURCE", label: "Resources", icon: FileText },
      { id: "HACKATHON", label: "Hackathons", icon: Rocket },
      { id: "ACHIEVEMENT", label: "Achievements", icon: Award },
      { id: "EVENT", label: "Campus Events", icon: Calendar },
      { id: "POLL", label: "Student Polls", icon: SlidersHorizontal },
    ],
    []
  );

  // Check if active selection is in the "More" list or if it's currently hidden from primary bar
  const activeMoreCategory = useMemo(() => {
    if (["HACKATHON", "ACHIEVEMENT", "EVENT", "POLL"].includes(selectedPostType)) {
      return moreCategories.find((c) => c.id === selectedPostType);
    }
    return null;
  }, [selectedPostType, moreCategories]);

  const currentCategoryObj = useMemo(() => {
    return allCategories.find((c) => c.id === selectedPostType) || allCategories[0];
  }, [selectedPostType, allCategories]);

  // UI Interactive State
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState<{ [postId: string]: string }>({});
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // Modals
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isCreateCommunityModalOpen, setIsCreateCommunityModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  // Create Post Form State
  const [newPostCommunityId, setNewPostCommunityId] = useState<string>(
    communities[0]?.id || "comm_stanford_ai"
  );
  const [newPostType, setNewPostType] = useState<PostType>("DISCUSSION");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTags, setNewPostTags] = useState("");
  const [newPostProjectName, setNewPostProjectName] = useState("");
  const [newPostRepoUrl, setNewPostRepoUrl] = useState("");
  const [newPostDemoUrl, setNewPostDemoUrl] = useState("");
  const [newPostCompany, setNewPostCompany] = useState("");
  const [newPostRole, setNewPostRole] = useState("");
  const [newPostStipend, setNewPostStipend] = useState("");
  const [newPostApplyUrl, setNewPostApplyUrl] = useState("");

  // Create Community Form State
  const [newCommName, setNewCommName] = useState("");
  const [newCommCategory, setNewCommCategory] = useState("AI & ML");
  const [newCommInstitution, setNewCommInstitution] = useState("");
  const [newCommDesc, setNewCommDesc] = useState("");

  // Helper: Icon Resolver
  const renderCommunityIcon = (iconName?: string, className: string = "w-5 h-5") => {
    switch (iconName) {
      case "Brain":
        return <Brain className={className} />;
      case "Code2":
        return <Code2 className={className} />;
      case "Terminal":
        return <Terminal className={className} />;
      case "Rocket":
        return <Rocket className={className} />;
      case "Briefcase":
        return <Briefcase className={className} />;
      case "ShieldAlert":
        return <ShieldAlert className={className} />;
      default:
        return <Users2 className={className} />;
    }
  };

  // Helper: Post Type Badges
  const renderPostTypeBadge = (type: PostType) => {
    switch (type) {
      case "PROJECT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <Code2 className="w-3 h-3 text-purple-500" />
            PROJECT SHOWCASE
          </span>
        );
      case "INTERNSHIP":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Briefcase className="w-3 h-3 text-emerald-500" />
            CURATED INTERNSHIP
          </span>
        );
      case "QUESTION":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <HelpCircle className="w-3 h-3 text-amber-500" />
            QUESTION
          </span>
        );
      case "RESOURCE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <FileText className="w-3 h-3 text-blue-500" />
            RESOURCE
          </span>
        );
      case "HACKATHON":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <Rocket className="w-3 h-3 text-rose-500" />
            HACKATHON TEAM
          </span>
        );
      case "ACHIEVEMENT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
            <Award className="w-3 h-3 text-yellow-500" />
            STUDENT WIN
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
            <MessageSquare className="w-3 h-3 text-muted-foreground" />
            DISCUSSION
          </span>
        );
    }
  };

  // --------------------------------------------------------------------------
  // Upvote / Downvote Handler
  // --------------------------------------------------------------------------
  const handleVote = (postId: string, direction: 1 | -1) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const currentVote = post.userVote || 0;
        let nextVote: 1 | -1 | 0 = direction;
        let delta = 0;

        if (currentVote === direction) {
          // Toggle off
          nextVote = 0;
          delta = -direction;
        } else if (currentVote === 0) {
          // New vote
          nextVote = direction;
          delta = direction;
        } else {
          // Flipped from 1 to -1 or -1 to 1
          nextVote = direction;
          delta = direction * 2;
        }

        return {
          ...post,
          userVote: nextVote,
          upvotes: post.upvotes + delta,
        };
      })
    );
  };

  // Comment Upvote
  const handleCommentVote = (postId: string, commentId: string, direction: 1 | -1) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId || !post.comments) return post;

        const updateCommentsRecursive = (comms: CommunityComment[]): CommunityComment[] => {
          return comms.map((c) => {
            if (c.id === commentId) {
              const current = c.userVote || 0;
              let nextVote: 1 | -1 | 0 = direction;
              let delta = 0;
              if (current === direction) {
                nextVote = 0;
                delta = -direction;
              } else if (current === 0) {
                nextVote = direction;
                delta = direction;
              } else {
                nextVote = direction;
                delta = direction * 2;
              }
              return {
                ...c,
                userVote: nextVote,
                score: c.score + delta,
              };
            }
            if (c.replies && c.replies.length > 0) {
              return {
                ...c,
                replies: updateCommentsRecursive(c.replies),
              };
            }
            return c;
          });
        };

        return {
          ...post,
          comments: updateCommentsRecursive(post.comments),
        };
      })
    );
  };

  // Save / Bookmark Toggle
  const handleToggleSave = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const isSaved = !post.isSaved;
        if (isSaved) {
          success("Post saved to your bookmarks");
        } else {
          info("Removed from saved bookmarks");
        }
        return { ...post, isSaved };
      })
    );
  };

  // Share Link
  const handleShare = (postId: string) => {
    navigator.clipboard?.writeText(
      `${window.location.origin}/dashboard/communities?post=${postId}`
    );
    success("Post link copied to clipboard!");
  };

  // Community Join Toggle
  const handleToggleJoinCommunity = (communityId: string) => {
    setCommunities((prev) =>
      prev.map((comm) => {
        if (comm.id !== communityId) return comm;
        const nextJoined = !comm.isJoined;
        if (nextJoined) {
          success(`Joined ${comm.name}!`);
        } else {
          info(`Left ${comm.name}.`);
        }
        return {
          ...comm,
          isJoined: nextJoined,
          membersCount: nextJoined ? comm.membersCount + 1 : comm.membersCount - 1,
        };
      })
    );
  };

  // Add New Comment
  const handleAddComment = (postId: string) => {
    const text = newCommentText[postId]?.trim();
    if (!text) return;

    const newComment: CommunityComment = {
      id: `c_${Date.now()}`,
      postId,
      author: {
        name: user?.name || "Alex Rivera",
        avatar:
          user?.avatar ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        headline: "Verified Student • CS Junior",
        isVerifiedStudent: true,
      },
      content: text,
      timestamp: "Just now",
      score: 1,
      userVote: 1,
    };

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        return {
          ...post,
          commentCount: post.commentCount + 1,
          comments: [...(post.comments || []), newComment],
        };
      })
    );

    setNewCommentText((prev) => ({ ...prev, [postId]: "" }));
    success("Comment posted!");
  };

  // Add Reply to specific comment
  const handleAddReply = (postId: string, parentCommentId: string) => {
    if (!replyText.trim()) return;

    const newReply: CommunityComment = {
      id: `c_reply_${Date.now()}`,
      postId,
      parentId: parentCommentId,
      author: {
        name: user?.name || "Alex Rivera",
        avatar:
          user?.avatar ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        headline: "Verified Student",
        isVerifiedStudent: true,
      },
      content: replyText.trim(),
      timestamp: "Just now",
      score: 1,
      userVote: 1,
    };

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId || !post.comments) return post;

        const addReplyRecursive = (comms: CommunityComment[]): CommunityComment[] => {
          return comms.map((c) => {
            if (c.id === parentCommentId) {
              return {
                ...c,
                replies: [...(c.replies || []), newReply],
              };
            }
            if (c.replies && c.replies.length > 0) {
              return {
                ...c,
                replies: addReplyRecursive(c.replies),
              };
            }
            return c;
          });
        };

        return {
          ...post,
          commentCount: post.commentCount + 1,
          comments: addReplyRecursive(post.comments),
        };
      })
    );

    setReplyText("");
    setReplyingToCommentId(null);
    success("Reply submitted!");
  };

  // Submit New Post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    const comm =
      communities.find((c) => c.id === newPostCommunityId) || communities[0];

    const tagsArray = newPostTags
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter((t) => t.length > 0);

    const createdPost: CommunityPost = {
      id: `post_${Date.now()}`,
      communityId: comm.id,
      communityName: comm.name,
      communitySlug: comm.slug,
      communityIcon: comm.icon,
      author: {
        name: user?.name || "Alex Rivera",
        avatar:
          user?.avatar ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        headline: "CS Junior • Stanford HAI",
        isVerifiedStudent: true,
        university: "Stanford University",
        careerDNASkills: ["Python", "Machine Learning"],
      },
      type: newPostType,
      title: newPostTitle.trim(),
      content: newPostContent.trim(),
      timestamp: "Just now",
      upvotes: 1,
      userVote: 1,
      commentCount: 0,
      tags: tagsArray.length > 0 ? tagsArray : ["General"],
      isVerifiedProject:
        newPostType === "PROJECT" && Boolean(newPostProjectName.trim()),
      projectDetails:
        newPostType === "PROJECT" && newPostProjectName.trim()
          ? {
              name: newPostProjectName.trim(),
              repoUrl: newPostRepoUrl.trim() || "https://github.com",
              demoUrl: newPostDemoUrl.trim() || undefined,
              verifiedBy: "CommandSkill Evidence Engine (GitHub Commit Verified)",
            }
          : undefined,
      isVerifiedOpportunity:
        newPostType === "INTERNSHIP" && Boolean(newPostCompany.trim()),
      opportunityDetails:
        newPostType === "INTERNSHIP" && newPostCompany.trim()
          ? {
              company: newPostCompany.trim(),
              role: newPostRole.trim() || "Intern",
              stipend: newPostStipend.trim() || "Paid Stipend",
              applyUrl: newPostApplyUrl.trim() || "/dashboard/internships",
            }
          : undefined,
      comments: [],
    };

    setPosts([createdPost, ...posts]);
    setIsCreatePostModalOpen(false);

    // Reset fields
    setNewPostTitle("");
    setNewPostContent("");
    setNewPostTags("");
    setNewPostProjectName("");
    setNewPostRepoUrl("");
    setNewPostDemoUrl("");
    setNewPostCompany("");
    setNewPostRole("");
    setNewPostStipend("");
    setNewPostApplyUrl("");

    success("Your post has been published to CommandSkill!");
  };

  // Submit New Community
  const handleCreateCommunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommName.trim()) return;

    const slug = newCommName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const createdCommunity: Community = {
      id: `comm_${Date.now()}`,
      name: newCommName.trim(),
      slug,
      category: newCommCategory,
      type: "Student Society",
      domain: (newCommCategory === "AI & ML" ? "AI / ML" : "Software Development") as CommunityDomain,
      institution: newCommInstitution.trim() || "CommandSkill Campus Network",
      university: newCommInstitution.trim() || "CommandSkill Campus Network",
      status: "ACTIVE",
      isVerified: true,
      membershipType: "OPEN",
      myMembershipStatus: "MEMBER",
      myRole: "LEAD",
      description:
        newCommDesc.trim() ||
        "Student technical hub dedicated to collaboration, code reviews, and career advancement.",
      icon: "Rocket",
      bannerColor: "from-blue-600/30 to-indigo-600/30",
      membersCount: 1,
      activeDiscussions: 1,
      isJoined: true,
      posts: [],
    };

    setCommunities([createdCommunity, ...communities]);
    setSelectedCommunityId(createdCommunity.id);
    setIsCreateCommunityModalOpen(false);
    setNewCommName("");
    setNewCommInstitution("");
    setNewCommDesc("");
    success(`Community "${createdCommunity.name}" created!`);
  };

  // --------------------------------------------------------------------------
  // Active Community (if single community view)
  // --------------------------------------------------------------------------
  const activeCommunity = useMemo(() => {
    if (!selectedCommunityId) return null;
    return communities.find((c) => c.id === selectedCommunityId) || null;
  }, [selectedCommunityId, communities]);

  // --------------------------------------------------------------------------
  // Filtered & Sorted Posts
  // --------------------------------------------------------------------------
  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        // Filter by selected community
        if (selectedCommunityId && post.communityId !== selectedCommunityId) {
          return false;
        }

        // Feed Filter
        if (activeFeed === "saved" && !post.isSaved) return false;
        if (activeFeed === "following") {
          const comm = communities.find((c) => c.id === post.communityId);
          if (!comm?.isJoined) return false;
        }

        // Post Type Filter
        if (selectedPostType !== "ALL" && post.type !== selectedPostType) {
          return false;
        }

        // Tag Filter
        if (
          activeTagFilter &&
          !post.tags.some(
            (t) => t.toLowerCase() === activeTagFilter.toLowerCase()
          )
        ) {
          return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = post.title.toLowerCase().includes(q);
          const matchContent = post.content.toLowerCase().includes(q);
          const matchAuthor = post.author.name.toLowerCase().includes(q);
          const matchComm = (post.communityName || "").toLowerCase().includes(q);
          const matchTag = post.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchContent && !matchAuthor && !matchComm && !matchTag) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "hot") {
          // Hot ranking: high upvotes and comments
          return b.upvotes * 2 + b.commentCount - (a.upvotes * 2 + a.commentCount);
        }
        if (sortBy === "new") {
          return b.id.localeCompare(a.id);
        }
        if (sortBy === "top") {
          return b.upvotes - a.upvotes;
        }
        if (sortBy === "discussed") {
          return b.commentCount - a.commentCount;
        }
        return 0;
      });
  }, [
    posts,
    selectedCommunityId,
    activeFeed,
    selectedPostType,
    activeTagFilter,
    searchQuery,
    sortBy,
    communities,
  ]);

  // Joined communities count
  const myCommunities = useMemo(() => {
    return communities.filter((c) => c.isJoined);
  }, [communities]);

  return (
    <RoleGuard allowedRole="STUDENT">
      <div
        className="min-h-screen bg-background pb-20"
        style={{ "--communities-header-height": "64px" } as React.CSSProperties}
      >
        {/* Sticky Top Header Bar (Native CSS Sticky at top: 0, full width) */}
        <div className="sticky top-0 z-30 w-full bg-card/95 backdrop-blur-md border-b border-border/80 shadow-xs transition-colors">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* Mobile Drawer Trigger */}
              <button
                type="button"
                onClick={openMobileDrawer}
                className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                aria-label="Open navigation drawer"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                <Users2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight truncate">
                    CommandSkill Communities
                  </h1>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold shrink-0">
                    <ShieldCheck className="w-3 h-3 mr-1 text-primary" />
                    Verified Discussions
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground hidden md:block truncate">
                  Reddit-style student discourse, peer code reviews, verified projects & campus opportunities
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateCommunityModalOpen(true)}
                className="text-xs font-semibold border-border text-foreground hover:bg-muted"
              >
                <Plus className="w-3.5 h-3.5 sm:mr-1" />
                <span className="hidden sm:inline">Create Community</span>
                <span className="sm:hidden">Create</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setIsCreatePostModalOpen(true)}
                className="text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm shadow-blue-500/25"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                New Post
              </Button>
            </div>
          </div>
        </div>

        {/* 3-Column Reddit-Style Container (Responsive CSS Grid, Full Width) */}
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_340px] xl:grid-cols-[280px_minmax(0,1fr)_360px] gap-6 items-start w-full">
            
            {/* ---------------------------------------------------------------- */}
            {/* LEFT COLUMN: Feeds, My Communities, Topics (Sticky)              */}
            {/* ---------------------------------------------------------------- */}
            <div className="w-full space-y-4 lg:sticky lg:top-[calc(var(--communities-header-height,64px)+16px)] lg:self-start z-10 max-h-[calc(100vh-96px)] overflow-y-auto no-scrollbar">
              
              {/* Feeds Navigation Card */}
              <div className="bg-card text-card-foreground rounded-2xl border border-border/80 p-3 shadow-xs">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Feeds
                </div>
                <nav className="space-y-0.5 mt-1">
                  <button
                    onClick={() => {
                      setActiveFeed("home");
                      setSelectedCommunityId(null);
                      setActiveTagFilter(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeFeed === "home" && !selectedCommunityId
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Compass className="w-4 h-4 text-primary" />
                      <span>Home Feed</span>
                    </div>
                    <span className="text-[11px] font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                      {posts.length}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveFeed("popular");
                      setSortBy("hot");
                      setSelectedCommunityId(null);
                      setActiveTagFilter(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeFeed === "popular" && !selectedCommunityId
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Flame className="w-4 h-4 text-amber-500" />
                      <span>Popular</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveFeed("latest");
                      setSortBy("new");
                      setSelectedCommunityId(null);
                      setActiveTagFilter(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeFeed === "latest" && !selectedCommunityId
                        ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span>Latest / New</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveFeed("following");
                      setSelectedCommunityId(null);
                      setActiveTagFilter(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeFeed === "following" && !selectedCommunityId
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Users2 className="w-4 h-4 text-emerald-500" />
                      <span>Following Hubs</span>
                    </div>
                    <span className="text-[11px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                      {myCommunities.length}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveFeed("saved");
                      setSelectedCommunityId(null);
                      setActiveTagFilter(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeFeed === "saved" && !selectedCommunityId
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Bookmark className="w-4 h-4 text-primary" />
                      <span>Saved Posts</span>
                    </div>
                    <span className="text-[11px] font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                      {posts.filter((p) => p.isSaved).length}
                    </span>
                  </button>
                </nav>
              </div>

              {/* My Communities List */}
              <div className="bg-card text-card-foreground rounded-2xl border border-border/80 p-3 shadow-xs">
                <div className="flex items-center justify-between px-3 py-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    My Communities
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {myCommunities.length} joined
                  </span>
                </div>
                <div className="space-y-1 mt-1 max-h-64 overflow-y-auto pr-1">
                  {myCommunities.map((comm) => {
                    const isSelected = selectedCommunityId === comm.id;
                    return (
                      <button
                        key={comm.id}
                        onClick={() => {
                          setSelectedCommunityId(comm.id);
                          setActiveTagFilter(null);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all ${
                          isSelected
                            ? "bg-primary/10 text-primary font-semibold shadow-xs"
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {renderCommunityIcon(comm.icon, "w-4 h-4")}
                          </div>
                          <div className="truncate">
                            <div className="text-xs font-semibold truncate text-foreground">
                              c/{comm.slug}
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate">
                              {comm.membersCount.toLocaleString()} members
                            </div>
                          </div>
                        </div>
                        {comm.isVerified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 ml-1" />
                        )}
                      </button>
                    );
                  })}
                  {myCommunities.length === 0 && (
                    <div className="text-center py-4 text-xs text-muted-foreground">
                      You haven&apos;t joined any communities yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Topics / Domains */}
              <div className="bg-card text-card-foreground rounded-2xl border border-border/80 p-3.5 shadow-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-2">
                  Explore Topics
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "AI & ML",
                    "Full-Stack",
                    "Algorithms",
                    "Internships",
                    "Startups",
                    "Cybersecurity",
                    "OpenSource",
                    "InterviewPrep",
                  ].map((topic) => {
                    const isSelected = activeTagFilter?.toLowerCase() === topic.toLowerCase();
                    return (
                      <button
                        key={topic}
                        onClick={() => {
                          if (isSelected) {
                            setActiveTagFilter(null);
                          } else {
                            setActiveTagFilter(topic);
                            setSelectedCommunityId(null);
                          }
                        }}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-xs"
                            : "bg-muted/60 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        #{topic}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Trust Badge Card */}
              <div className="bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-card rounded-2xl border border-blue-500/20 p-3.5 text-xs text-muted-foreground shadow-xs">
                <div className="flex items-center gap-2 font-bold text-foreground mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>CommandSkill Trust Layer</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Every poster carries a <span className="font-semibold text-emerald-600 dark:text-emerald-400">✓ Verified Student</span> badge. Project showcases require verified GitHub evidence to prevent ghost claims.
                </p>
              </div>
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* CENTER COLUMN: Feed, Composer, Posts (minmax(0,1fr) Scrolling)   */}
            {/* ---------------------------------------------------------------- */}
            <div className="min-w-0 w-full space-y-4">
              
              {/* Selected Sub-Community Banner Header (if viewing a community) */}
              {activeCommunity && (
                <div className="bg-card rounded-2xl border border-border/80 overflow-hidden shadow-xs">
                  <div className={`h-24 bg-gradient-to-r ${activeCommunity.bannerColor || "from-blue-600 to-indigo-600"} relative p-4 flex items-end justify-between`}>
                    <button
                      onClick={() => setSelectedCommunityId(null)}
                      className="absolute top-3 left-3 bg-black/40 hover:bg-black/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1 transition-all"
                    >
                      ← Back to All Hubs
                    </button>
                  </div>
                  <div className="p-4 pt-0 -mt-6">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div className="flex items-end gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-card border-2 border-border shadow-md flex items-center justify-center text-blue-600 dark:text-blue-400">
                          {renderCommunityIcon(activeCommunity.icon, "w-8 h-8")}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-foreground">
                              {activeCommunity.name}
                            </h2>
                            {activeCommunity.isVerified && (
                              <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground font-medium">
                            c/{activeCommunity.slug} • {activeCommunity.institution}
                          </p>
                        </div>
                      </div>

                      {/* Join / Leave toggle */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={activeCommunity.isJoined ? "outline" : "primary"}
                          onClick={() => handleToggleJoinCommunity(activeCommunity.id)}
                          className={
                            activeCommunity.isJoined
                              ? "border-border text-foreground hover:bg-muted text-xs"
                              : "bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
                          }
                        >
                          {activeCommunity.isJoined ? "Joined ✓" : "Join Hub"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsRulesModalOpen(true)}
                          className="border-border text-muted-foreground hover:text-foreground hover:bg-muted text-xs px-2.5"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                      {activeCommunity.description}
                    </p>

                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/60 text-xs text-muted-foreground">
                      <div>
                        <span className="font-bold text-foreground">
                          {activeCommunity.membersCount.toLocaleString()}
                        </span>{" "}
                        Members
                      </div>
                      <div>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {activeCommunity.activeDiscussions || 24}
                        </span>{" "}
                        Active Discussions
                      </div>
                      <div>
                        <span className="font-bold text-foreground">
                          {activeCommunity.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Post Composer Card */}
              <div className="bg-card rounded-2xl border border-border/80 p-3.5 shadow-xs">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={
                      user?.avatar ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                    }
                    name={user?.name || "Alex Rivera"}
                    size="sm"
                  />
                  <div
                    onClick={() => setIsCreatePostModalOpen(true)}
                    className="flex-1 bg-muted/70 hover:bg-muted text-muted-foreground text-xs px-4 py-2.5 rounded-full cursor-pointer transition-all border border-border/60 flex items-center justify-between"
                  >
                    <span>Share a project, ask advice, or post an internship...</span>
                    <Plus className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/60 px-1">
                  <button
                    onClick={() => {
                      setNewPostType("PROJECT");
                      setIsCreatePostModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors"
                  >
                    <Code2 className="w-3.5 h-3.5 text-purple-500" />
                    <span>Project Showcase</span>
                  </button>
                  <button
                    onClick={() => {
                      setNewPostType("QUESTION");
                      setIsCreatePostModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Ask Question</span>
                  </button>
                  <button
                    onClick={() => {
                      setNewPostType("INTERNSHIP");
                      setIsCreatePostModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Internship / Referral</span>
                  </button>
                  <button
                    onClick={() => {
                      setNewPostType("RESOURCE");
                      setIsCreatePostModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors hidden sm:flex"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                    <span>Resource</span>
                  </button>
                </div>
              </div>

              {/* Feed Control: Sort Tabs & Filters */}
              <div className="bg-card rounded-2xl border border-border/80 p-2 shadow-xs flex flex-wrap items-center justify-between gap-2">
                {/* Sort tabs */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSortBy("hot")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      sortBy === "hot"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span>Hot</span>
                  </button>
                  <button
                    onClick={() => setSortBy("new")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      sortBy === "new"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                    <span>New</span>
                  </button>
                  <button
                    onClick={() => setSortBy("top")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      sortBy === "top"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                    <span>Top</span>
                  </button>
                  <button
                    onClick={() => setSortBy("discussed")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      sortBy === "discussed"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Most Discussed</span>
                  </button>
                </div>

                {/* Search input */}
                <div className="relative flex-1 min-w-[140px] max-w-[220px]">
                  <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:bg-card focus:border-primary transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Compact Post Type Filter Row (Compact 36px height, 12px padding, 5px icon gap, 6px button gap) */}
              <div className="w-full max-w-full box-border">
                {/* Desktop & Tablet Navigation Row (sm and up) */}
                <div className="hidden sm:flex items-center gap-[6px] w-full max-w-full">
                  {primaryCategories.map((cat) => {
                    const isSelected = selectedPostType === cat.id;
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedPostType(cat.id)}
                        className={`${cat.visibility} items-center justify-center gap-[5px] h-[36px] px-[12px] rounded-xl text-[14px] font-medium transition-all shrink-0 border whitespace-nowrap select-none ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold"
                            : "bg-card text-muted-foreground border-border/80 hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <Icon className="w-[15px] h-[15px] shrink-0" />
                        <span className="leading-none">{cat.label}</span>
                      </button>
                    );
                  })}

                  {/* More Dropdown */}
                  <div className="relative shrink-0 inline-flex items-center" ref={moreDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                      aria-expanded={isMoreMenuOpen}
                      aria-haspopup="menu"
                      className={`inline-flex items-center justify-center gap-[5px] h-[36px] px-[12px] rounded-xl text-[14px] font-medium transition-all shrink-0 border whitespace-nowrap select-none ${
                        activeMoreCategory
                          ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold"
                          : "bg-card text-muted-foreground border-border/80 hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {activeMoreCategory ? (
                        <>
                          <activeMoreCategory.icon className="w-[15px] h-[15px] shrink-0" />
                          <span className="leading-none">{activeMoreCategory.label}</span>
                        </>
                      ) : (
                        <span className="leading-none">More</span>
                      )}
                      <ChevronDown
                        className={`w-3.5 h-3.5 shrink-0 transition-transform duration-150 ${
                          isMoreMenuOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isMoreMenuOpen && (
                      <div
                        role="menu"
                        className="absolute right-0 top-full mt-1.5 w-52 bg-card border border-border/80 rounded-2xl shadow-xl shadow-black/10 z-40 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100"
                      >
                        <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 mb-1">
                          More Post Types
                        </div>
                        {moreCategories.map((item) => {
                          const isSelected = selectedPostType === item.id;
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                setSelectedPostType(item.id);
                                setIsMoreMenuOpen(false);
                              }}
                              className={`w-full inline-flex items-center justify-between gap-[5px] px-3 py-2 rounded-xl text-xs transition-colors ${
                                isSelected
                                  ? "bg-primary/10 text-primary font-semibold"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                              } ${item.breakpoint}`}
                            >
                              <span className="inline-flex items-center gap-[6px]">
                                <Icon className="w-[15px] h-[15px] shrink-0" />
                                <span className="leading-none">{item.label}</span>
                              </span>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile View (< sm): Dual Compact Controls with exact 6px gap and 36px height */}
                <div className="sm:hidden flex items-center gap-[6px] w-full max-w-full box-border">
                  <button
                    type="button"
                    onClick={() => setSelectedPostType("ALL")}
                    className={`flex-1 inline-flex items-center justify-center gap-[5px] h-[36px] px-[12px] rounded-xl text-[14px] font-semibold border transition-all whitespace-nowrap select-none ${
                      selectedPostType === "ALL"
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-card text-muted-foreground border-border/80 hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Layers className="w-[15px] h-[15px] shrink-0" />
                    <span className="leading-none">All Posts</span>
                  </button>

                  <div className="relative flex-1 inline-flex items-center" ref={mobileDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsMobileCategoryOpen(!isMobileCategoryOpen)}
                      aria-expanded={isMobileCategoryOpen}
                      aria-haspopup="menu"
                      className={`w-full inline-flex items-center justify-between gap-[5px] h-[36px] px-[12px] rounded-xl text-[14px] font-semibold border transition-all whitespace-nowrap select-none ${
                        selectedPostType !== "ALL"
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-card text-muted-foreground border-border/80 hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <span className="truncate inline-flex items-center gap-[5px]">
                        <Filter className="w-[15px] h-[15px] shrink-0" />
                        <span className="truncate leading-none">
                          {selectedPostType === "ALL"
                            ? "Filter ▾"
                            : currentCategoryObj.label}
                        </span>
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 shrink-0 transition-transform duration-150 ${
                          isMobileCategoryOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isMobileCategoryOpen && (
                      <div
                        role="menu"
                        className="absolute right-0 top-full mt-1.5 w-full min-w-[200px] bg-card border border-border/80 rounded-2xl shadow-xl shadow-black/10 z-40 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100"
                      >
                        <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 mb-1">
                          Filter by Category
                        </div>
                        {allCategories.map((item) => {
                          const isSelected = selectedPostType === item.id;
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                setSelectedPostType(item.id);
                                setIsMobileCategoryOpen(false);
                              }}
                              className={`w-full flex flex-row items-center justify-between gap-[5px] px-3 py-2 rounded-xl text-xs transition-colors ${
                                isSelected
                                  ? "bg-primary/10 text-primary font-semibold"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                              }`}
                            >
                              <span className="flex flex-row items-center gap-[6px]">
                                <Icon className="w-[15px] h-[15px] shrink-0" />
                                <span className="leading-none">{item.label}</span>
                              </span>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Active tag indicator if tag selected */}
              {activeTagFilter && (
                <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs px-3 py-1.5 rounded-xl">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>
                      Filtering by topic: <strong>#{activeTagFilter}</strong>
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTagFilter(null)}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    Clear Filter ✕
                  </button>
                </div>
              )}

              {/* Post List */}
              <div className="space-y-3">
                {filteredPosts.map((post) => {
                  const isUpvoted = post.userVote === 1;
                  const isDownvoted = post.userVote === -1;
                  const isCommentsOpen = expandedCommentsPostId === post.id;

                  return (
                    <article
                      key={post.id}
                      className="bg-card rounded-2xl border border-border/80 hover:border-border transition-all shadow-xs hover:shadow-sm overflow-hidden"
                    >
                      <div className="flex">
                        {/* Upvote / Downvote Left Rail (Reddit-style) */}
                        <div className="w-11 sm:w-12 bg-muted/40 border-r border-border/60 flex flex-col items-center py-3 px-1 select-none shrink-0">
                          <button
                            onClick={() => handleVote(post.id, 1)}
                            className={`p-1 rounded-md transition-colors ${
                              isUpvoted
                                ? "text-amber-600 bg-amber-100/60 dark:bg-amber-500/20"
                                : "text-muted-foreground hover:text-amber-600 hover:bg-muted"
                            }`}
                            title="Upvote"
                          >
                            <ArrowBigUp className={`w-5 h-5 ${isUpvoted ? "fill-current" : ""}`} />
                          </button>
                          <span
                            className={`text-xs font-bold my-1 ${
                              isUpvoted
                                ? "text-amber-600"
                                : isDownvoted
                                ? "text-indigo-600"
                                : "text-foreground"
                            }`}
                          >
                            {post.upvotes}
                          </span>
                          <button
                            onClick={() => handleVote(post.id, -1)}
                            className={`p-1 rounded-md transition-colors ${
                              isDownvoted
                                ? "text-indigo-600 bg-indigo-100/60 dark:bg-indigo-500/20"
                                : "text-muted-foreground hover:text-indigo-600 hover:bg-muted"
                            }`}
                            title="Downvote"
                          >
                            <ArrowBigDown className={`w-5 h-5 ${isDownvoted ? "fill-current" : ""}`} />
                          </button>
                        </div>

                        {/* Main Post Card Body */}
                        <div className="flex-1 p-3.5 sm:p-4 min-w-0">
                          
                          {/* Post Meta Header */}
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                            {/* Community badge */}
                            <button
                              onClick={() => {
                                setSelectedCommunityId(post.communityId || null);
                                setActiveTagFilter(null);
                              }}
                              className="font-bold text-foreground hover:text-primary flex items-center gap-1 transition-colors"
                            >
                              <span className="text-muted-foreground">c/</span>
                              {post.communitySlug || post.communityName}
                            </button>
                            <span>•</span>

                            {/* Author */}
                            <div className="flex items-center gap-1.5">
                              <Avatar
                                src={post.author.avatar}
                                name={post.author.name}
                                size="xs"
                              />
                              <span className="font-semibold text-foreground/90">
                                {post.author.name}
                              </span>
                            </div>

                            {/* Verified Student Badge */}
                            {post.author.isVerifiedStudent && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                                Verified Student
                              </span>
                            )}

                            {post.author.university && (
                              <>
                                <span className="hidden sm:inline">•</span>
                                <span className="text-muted-foreground hidden sm:inline">
                                  {post.author.university}
                                </span>
                              </>
                            )}

                            <span>•</span>
                            <span className="text-muted-foreground">{post.timestamp}</span>

                            {/* Post Type Pill */}
                            <div className="ml-auto">
                              {renderPostTypeBadge(post.type || "DISCUSSION")}
                            </div>
                          </div>

                          {/* Career DNA Skills of Author */}
                          {post.author.careerDNASkills && post.author.careerDNASkills.length > 0 && (
                            <div className="flex items-center gap-1 mb-2 text-[10px] text-muted-foreground">
                              <span className="text-muted-foreground font-medium">DNA Skills:</span>
                              {post.author.careerDNASkills.map((skill) => (
                                <span
                                  key={skill}
                                  className="px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-mono"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Post Title */}
                          <h3 className="text-base font-bold text-foreground tracking-tight leading-snug mb-2 hover:text-primary transition-colors">
                            {post.title}
                          </h3>

                          {/* Post Content */}
                          <div className="text-xs sm:text-sm text-foreground/80 leading-relaxed space-y-2 whitespace-pre-line mb-3 font-normal">
                            {post.content}
                          </div>

                          {/* Verified Project Showcase Attachment */}
                          {post.isVerifiedProject && post.projectDetails && (
                            <div className="bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-card rounded-xl border border-purple-500/20 p-3 mb-3 shadow-xs">
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                                    <Code2 className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="text-xs font-bold text-foreground">
                                    {post.projectDetails.name}
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                                    GitHub Commit Verified
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  {post.projectDetails.repoUrl && (
                                    <a
                                      href={post.projectDetails.repoUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:text-purple-600 dark:hover:text-purple-400 bg-card border border-border/80 px-2.5 py-1 rounded-lg transition-colors"
                                    >
                                      <Github className="w-3 h-3" />
                                      Repository
                                    </a>
                                  )}
                                  {post.projectDetails.demoUrl && (
                                    <a
                                      href={post.projectDetails.demoUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 px-2.5 py-1 rounded-lg transition-colors"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      Live Demo
                                    </a>
                                  )}
                                </div>
                              </div>
                              <p className="text-[11px] text-muted-foreground">
                                Verified by {post.projectDetails.verifiedBy}
                              </p>
                            </div>
                          )}

                          {/* Verified Opportunity / Internship Attachment */}
                          {post.isVerifiedOpportunity && post.opportunityDetails && (
                            <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-card rounded-xl border border-emerald-500/20 p-3 mb-3 shadow-xs">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-foreground">
                                      {post.opportunityDetails.company} — {post.opportunityDetails.role}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                                      Verified Opportunity
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-muted-foreground flex items-center gap-3">
                                    <span>
                                      Stipend: <strong className="text-foreground">{post.opportunityDetails.stipend}</strong>
                                    </span>
                                    {post.opportunityDetails.deadline && (
                                      <span>
                                        Deadline: <strong className="text-foreground">{post.opportunityDetails.deadline}</strong>
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <a
                                  href={post.opportunityDetails.applyUrl || "/dashboard/internships"}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-xl shadow-xs transition-colors"
                                >
                                  <span>Apply / View Referral</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          )}

                          {/* Tags */}
                          <div className="flex flex-wrap items-center gap-1.5 mb-3">
                            {post.tags.map((tag) => (
                              <button
                                key={tag}
                                onClick={() => setActiveTagFilter(tag)}
                                className="text-[11px] font-medium text-muted-foreground bg-muted/80 hover:bg-muted hover:text-foreground px-2 py-0.5 rounded-md transition-colors"
                              >
                                #{tag}
                              </button>
                            ))}
                          </div>

                          {/* Footer Action Row (Reddit-style) */}
                          <div className="flex items-center gap-2 pt-2 border-t border-border/60 text-xs text-muted-foreground font-medium">
                            <button
                              onClick={() =>
                                setExpandedCommentsPostId(isCommentsOpen ? null : post.id)
                              }
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
                                isCommentsOpen
                                  ? "bg-primary/10 text-primary font-semibold"
                                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>{post.commentCount} Comments</span>
                            </button>

                            <button
                              onClick={() => handleShare(post.id)}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span>Share</span>
                            </button>

                            <button
                              onClick={() => handleToggleSave(post.id)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
                                post.isSaved
                                  ? "text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-500/10"
                                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${post.isSaved ? "fill-current" : ""}`} />
                              <span>{post.isSaved ? "Saved" : "Save"}</span>
                            </button>
                          </div>

                          {/* Expandable Inline Comment Thread */}
                          {isCommentsOpen && (
                            <div className="mt-3 pt-3 border-t border-border/60 space-y-3">
                              
                              {/* New Comment Box */}
                              <div className="flex items-start gap-2.5">
                                <Avatar
                                  src={
                                    user?.avatar ||
                                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                                  }
                                  name={user?.name || "Alex Rivera"}
                                  size="xs"
                                />
                                <div className="flex-1 space-y-2">
                                  <textarea
                                    rows={2}
                                    placeholder="Write a constructive, verified response..."
                                    value={newCommentText[post.id] || ""}
                                    onChange={(e) =>
                                      setNewCommentText({
                                        ...newCommentText,
                                        [post.id]: e.target.value,
                                      })
                                    }
                                    className="w-full text-xs p-2.5 rounded-xl border border-border bg-muted/40 text-foreground placeholder:text-muted-foreground focus:bg-card focus:outline-hidden focus:border-primary transition-colors"
                                  />
                                  <div className="flex justify-end">
                                    <Button
                                      size="sm"
                                      onClick={() => handleAddComment(post.id)}
                                      disabled={!newCommentText[post.id]?.trim()}
                                      className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1"
                                    >
                                      <Send className="w-3 h-3 mr-1" />
                                      Post Comment
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              {/* Comment List */}
                              <div className="space-y-2.5 pt-2">
                                {(!post.comments || post.comments.length === 0) && (
                                  <p className="text-xs text-muted-foreground text-center py-2">
                                    No comments yet. Be the first student to comment!
                                  </p>
                                )}

                                {post.comments?.map((comment) => (
                                  <div
                                    key={comment.id}
                                    className="bg-muted/40 rounded-xl p-3 border border-border/60 space-y-1.5"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Avatar
                                          src={comment.author.avatar}
                                          name={comment.author.name}
                                          size="xs"
                                        />
                                        <span className="text-xs font-bold text-foreground">
                                          {comment.author.name}
                                        </span>
                                        {comment.author.isVerifiedStudent && (
                                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 font-semibold px-1.5 py-0.2 rounded-full">
                                            ✓ Verified
                                          </span>
                                        )}
                                        <span className="text-[11px] text-muted-foreground">
                                          {comment.timestamp}
                                        </span>
                                      </div>

                                      {/* Comment score */}
                                      <div className="flex items-center gap-1 text-xs">
                                        <button
                                          onClick={() =>
                                            handleCommentVote(post.id, comment.id, 1)
                                          }
                                          className={`p-0.5 hover:text-amber-600 ${
                                            comment.userVote === 1
                                              ? "text-amber-600"
                                              : "text-muted-foreground"
                                          }`}
                                        >
                                          <ArrowBigUp className="w-4 h-4" />
                                        </button>
                                        <span className="font-semibold text-foreground text-[11px]">
                                          {comment.score}
                                        </span>
                                        <button
                                          onClick={() =>
                                            handleCommentVote(post.id, comment.id, -1)
                                          }
                                          className={`p-0.5 hover:text-indigo-600 ${
                                            comment.userVote === -1
                                              ? "text-indigo-600"
                                              : "text-muted-foreground"
                                          }`}
                                        >
                                          <ArrowBigDown className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>

                                    <p className="text-xs text-foreground/90 leading-relaxed pl-6">
                                      {comment.content}
                                    </p>

                                    {/* Action row for comment */}
                                    <div className="pl-6 flex items-center gap-3 pt-1 text-[11px] text-muted-foreground">
                                      <button
                                        onClick={() =>
                                          setReplyingToCommentId(
                                            replyingToCommentId === comment.id ? null : comment.id
                                          )
                                        }
                                        className="hover:text-primary font-medium"
                                      >
                                        Reply
                                      </button>
                                    </div>

                                    {/* Inline reply box */}
                                    {replyingToCommentId === comment.id && (
                                      <div className="pl-6 pt-2 space-y-2">
                                        <input
                                          type="text"
                                          placeholder={`Replying to ${comment.author.name}...`}
                                          value={replyText}
                                          onChange={(e) => setReplyText(e.target.value)}
                                          className="w-full text-xs p-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground"
                                        />
                                        <div className="flex justify-end gap-2">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setReplyingToCommentId(null)}
                                            className="text-xs py-0.5 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                                          >
                                            Cancel
                                          </Button>
                                          <Button
                                            size="sm"
                                            onClick={() => handleAddReply(post.id, comment.id)}
                                            disabled={!replyText.trim()}
                                            className="text-xs py-0.5 bg-primary text-primary-foreground hover:bg-primary/90"
                                          >
                                            Submit Reply
                                          </Button>
                                        </div>
                                      </div>
                                    )}

                                    {/* Nested Replies */}
                                    {comment.replies && comment.replies.length > 0 && (
                                      <div className="pl-6 pt-2 space-y-2 border-l-2 border-border ml-3">
                                        {comment.replies.map((reply) => (
                                          <div
                                            key={reply.id}
                                            className="bg-card rounded-lg p-2 border border-border/70 space-y-1"
                                          >
                                            <div className="flex items-center justify-between text-xs">
                                              <div className="flex items-center gap-1.5">
                                                <Avatar
                                                  src={reply.author.avatar}
                                                  name={reply.author.name}
                                                  size="xs"
                                                />
                                                <span className="font-bold text-foreground text-[11px]">
                                                  {reply.author.name}
                                                </span>
                                                {reply.author.isVerifiedStudent && (
                                                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 font-semibold px-1 rounded">
                                                    ✓
                                                  </span>
                                                )}
                                                <span className="text-[10px] text-muted-foreground">
                                                  {reply.timestamp}
                                                </span>
                                              </div>

                                              <div className="flex items-center gap-1 text-[11px]">
                                                <button
                                                  onClick={() =>
                                                    handleCommentVote(post.id, reply.id, 1)
                                                  }
                                                  className="text-muted-foreground hover:text-amber-600"
                                                >
                                                  <ArrowBigUp className="w-3.5 h-3.5" />
                                                </button>
                                                <span className="font-semibold text-foreground">
                                                  {reply.score}
                                                </span>
                                              </div>
                                            </div>
                                            <p className="text-xs text-foreground/90 pl-5">
                                              {reply.content}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}

                {/* Empty State */}
                {filteredPosts.length === 0 && (
                  <div className="bg-card rounded-2xl border border-border/80 p-8 text-center space-y-3 shadow-xs">
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">
                      No discussions found
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      There are no active posts matching your current filters. Clear your search or start the conversation!
                    </p>
                    <div className="pt-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedPostType("ALL");
                          setActiveTagFilter(null);
                          setSelectedCommunityId(null);
                          setActiveFeed("home");
                        }}
                        className="text-xs bg-foreground text-background hover:bg-foreground/90"
                      >
                        Reset All Filters
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* RIGHT COLUMN: Community Info, Trending Topics, Rules (Sticky)    */}
            {/* ---------------------------------------------------------------- */}
            <div className="hidden lg:block w-full space-y-4 lg:sticky lg:top-[calc(var(--communities-header-height,64px)+16px)] lg:self-start z-10 max-h-[calc(100vh-96px)] overflow-y-auto no-scrollbar">
              
              {/* About Community Card (if active) OR CommandSkill Overview Card */}
              {activeCommunity ? (
                <div className="bg-card rounded-2xl border border-border/80 p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      About Community
                    </h3>
                    {activeCommunity.isVerified && (
                      <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                        Official Charter
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {activeCommunity.description}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Institution</span>
                      <strong className="text-foreground font-semibold truncate max-w-[140px]">
                        {activeCommunity.institution}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Category</span>
                      <strong className="text-foreground font-semibold">
                        {activeCommunity.category}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Total Members</span>
                      <strong className="text-foreground font-semibold">
                        {activeCommunity.membersCount.toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsRulesModalOpen(true)}
                    className="w-full text-xs border-border text-foreground hover:bg-muted"
                  >
                    View Community Rules
                  </Button>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700/90 dark:to-indigo-900/90 rounded-2xl p-4 text-white shadow-md shadow-blue-500/10 border border-blue-500/30 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-200" />
                    <h3 className="text-sm font-bold tracking-tight">
                      Campus Career Network
                    </h3>
                  </div>
                  <p className="text-xs text-blue-100 leading-relaxed">
                    A Reddit-style ecosystem powered by verified student identity, peer code reviews, and real GitHub evidence.
                  </p>
                  <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[11px] text-blue-100">
                    <span>{communities.length} Active Hubs</span>
                    <span>{posts.length} Curated Posts</span>
                  </div>
                </div>
              )}

              {/* Trending Topics Today */}
              <div className="bg-card rounded-2xl border border-border/80 p-4 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Trending Discussions
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {trendingTopics.map((topic, idx) => (
                    <button
                      key={topic.id}
                      onClick={() => {
                        setActiveTagFilter(topic.tag.replace("#", ""));
                        setSelectedCommunityId(null);
                      }}
                      className="w-full flex items-center justify-between text-left group p-1.5 rounded-xl hover:bg-muted/60 transition-colors"
                    >
                      <div className="truncate pr-2">
                        <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          {topic.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {topic.tag}
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
                        {topic.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recommended Communities to Discover */}
              <div className="bg-card rounded-2xl border border-border/80 p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Recommended Hubs
                  </h3>
                  <Compass className="w-4 h-4 text-primary" />
                </div>

                <div className="space-y-3">
                  {communities.slice(0, 4).map((comm) => (
                    <div
                      key={comm.id}
                      className="flex items-center justify-between gap-2"
                    >
                      <div
                        onClick={() => setSelectedCommunityId(comm.id)}
                        className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          {renderCommunityIcon(comm.icon, "w-4 h-4")}
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                            c/{comm.slug}
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {comm.membersCount.toLocaleString()} members
                          </div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant={comm.isJoined ? "outline" : "primary"}
                        onClick={() => handleToggleJoinCommunity(comm.id)}
                        className={`text-[11px] h-7 px-2.5 rounded-lg ${
                          comm.isJoined
                            ? "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                        }`}
                      >
                        {comm.isJoined ? "Joined" : "Join"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Community Rules & Guidelines */}
              <div className="bg-card rounded-2xl border border-border/80 p-4 shadow-xs space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>CommandSkill Standards</span>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  {communityRules.map((r, i) => (
                    <div key={r.id} className="flex items-start gap-2">
                      <span className="font-bold text-muted-foreground">{i + 1}.</span>
                      <div>
                        <span className="font-semibold text-foreground">
                          {r.rule}
                        </span>
                        <p className="text-[11px] text-muted-foreground leading-tight">
                          {r.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer mini links */}
              <div className="text-[11px] text-muted-foreground space-y-1 px-1">
                <div className="flex flex-wrap gap-x-2 gap-y-1">
                  <a href="#" className="hover:underline">User Agreement</a>
                  <span>•</span>
                  <a href="#" className="hover:underline">Privacy Policy</a>
                  <span>•</span>
                  <a href="#" className="hover:underline">Honor Code</a>
                </div>
                <div>© 2026 CommandSkill Career Intelligence, Inc.</div>
              </div>

            </div>

          </div>
        </div>

        {/* ================================================================== */}
        {/* MODAL: Create New Post                                             */}
        {/* ================================================================== */}
        <Modal
          isOpen={isCreatePostModalOpen}
          onClose={() => setIsCreatePostModalOpen(false)}
          title="Create a Discussion Post"
        >
          <form onSubmit={handleCreatePost} className="space-y-4">
            {/* Community selector */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Select Community / Subreddit
              </label>
              <select
                value={newPostCommunityId}
                onChange={(e) => setNewPostCommunityId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-border bg-card text-foreground font-medium focus:outline-hidden focus:border-primary"
              >
                {communities.map((comm) => (
                  <option key={comm.id} value={comm.id}>
                    c/{comm.slug} — {comm.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Post Type Buttons */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Post Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { type: "DISCUSSION", label: "💬 Discussion" },
                  { type: "PROJECT", label: "🚀 Project" },
                  { type: "INTERNSHIP", label: "💼 Internship" },
                  { type: "QUESTION", label: "❓ Question" },
                  { type: "RESOURCE", label: "📚 Resource" },
                  { type: "HACKATHON", label: "🏆 Hackathon" },
                  { type: "ACHIEVEMENT", label: "🎉 Student Win" },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.type}
                    onClick={() => setNewPostType(item.type as PostType)}
                    className={`text-xs py-1.5 px-2 rounded-xl border font-medium transition-all ${
                      newPostType === item.type
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Post Title
              </label>
              <input
                type="text"
                placeholder="An interesting, descriptive title..."
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                required
                className="w-full text-xs p-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary font-medium"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Post Body & Details
              </label>
              <textarea
                rows={4}
                placeholder="Share your technical findings, question context, or opportunity breakdown..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                required
                className="w-full text-xs p-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary font-normal leading-relaxed"
              />
            </div>

            {/* Conditional fields for Project Showcase */}
            {newPostType === "PROJECT" && (
              <div className="bg-purple-500/10 rounded-xl p-3 border border-purple-500/20 space-y-2.5">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Verified Project Evidence</span>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Project Name (e.g. CanvasSync)"
                    value={newPostProjectName}
                    onChange={(e) => setNewPostProjectName(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-purple-500/30 bg-card text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="url"
                    placeholder="GitHub Repo URL"
                    value={newPostRepoUrl}
                    onChange={(e) => setNewPostRepoUrl(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-purple-500/30 bg-card text-foreground placeholder:text-muted-foreground"
                  />
                  <input
                    type="url"
                    placeholder="Live Demo URL (optional)"
                    value={newPostDemoUrl}
                    onChange={(e) => setNewPostDemoUrl(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-purple-500/30 bg-card text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            )}

            {/* Conditional fields for Curated Internship / Referral */}
            {newPostType === "INTERNSHIP" && (
              <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20 space-y-2.5">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Opportunity Details</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Company Name (e.g. Linear)"
                    value={newPostCompany}
                    onChange={(e) => setNewPostCompany(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-emerald-500/30 bg-card text-foreground placeholder:text-muted-foreground"
                  />
                  <input
                    type="text"
                    placeholder="Role (e.g. SWE Intern)"
                    value={newPostRole}
                    onChange={(e) => setNewPostRole(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-emerald-500/30 bg-card text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Stipend (e.g. $52 / hr)"
                    value={newPostStipend}
                    onChange={(e) => setNewPostStipend(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-emerald-500/30 bg-card text-foreground placeholder:text-muted-foreground"
                  />
                  <input
                    type="text"
                    placeholder="Apply URL / Link"
                    value={newPostApplyUrl}
                    onChange={(e) => setNewPostApplyUrl(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-emerald-500/30 bg-card text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            )}

            {/* Tags */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Topic Tags (comma-separated)
              </label>
              <input
                type="text"
                placeholder="Python, LeetCode, MachineLearning, Remote"
                value={newPostTags}
                onChange={(e) => setNewPostTags(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreatePostModalOpen(false)}
                className="text-xs border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
              >
                Publish Post
              </Button>
            </div>
          </form>
        </Modal>

        {/* ================================================================== */}
        {/* MODAL: Create New Community                                        */}
        {/* ================================================================== */}
        <Modal
          isOpen={isCreateCommunityModalOpen}
          onClose={() => setIsCreateCommunityModalOpen(false)}
          title="Create a New Campus Community"
        >
          <form onSubmit={handleCreateCommunity} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Community Name
              </label>
              <input
                type="text"
                placeholder="e.g. Stanford Autonomous Systems Guild"
                value={newCommName}
                onChange={(e) => setNewCommName(e.target.value)}
                required
                className="w-full text-xs p-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Category / Domain
                </label>
                <select
                  value={newCommCategory}
                  onChange={(e) => setNewCommCategory(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-card text-foreground font-medium"
                >
                  <option value="AI & ML">AI & Machine Learning</option>
                  <option value="Full-Stack & Systems">Full-Stack & Systems</option>
                  <option value="Competitive Programming">Competitive Programming</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Startups & Venture">Startups & Venture</option>
                  <option value="Career & Referrals">Career & Referrals</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Affiliated Institution / University
                </label>
                <input
                  type="text"
                  placeholder="e.g. Stanford University or Cross-Campus"
                  value={newCommInstitution}
                  onChange={(e) => setNewCommInstitution(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Description & Mission
              </label>
              <textarea
                rows={3}
                placeholder="What topics, projects, and discussions happen in this community?"
                value={newCommDesc}
                onChange={(e) => setNewCommDesc(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateCommunityModalOpen(false)}
                className="text-xs border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
              >
                Create Hub
              </Button>
            </div>
          </form>
        </Modal>

        {/* ================================================================== */}
        {/* MODAL: Community Rules & Trust Guidelines                          */}
        {/* ================================================================== */}
        <Modal
          isOpen={isRulesModalOpen}
          onClose={() => setIsRulesModalOpen(false)}
          title="Community Rules & Trust Guidelines"
        >
          <div className="space-y-4 text-xs text-muted-foreground">
            <p className="text-muted-foreground">
              CommandSkill Communities follow strict proof-of-work standards to maintain high-signal technical and career discourse.
            </p>

            <div className="space-y-3">
              {communityRules.map((r, i) => (
                <div key={r.id} className="p-3 bg-muted/40 rounded-xl border border-border/80">
                  <div className="font-bold text-foreground text-xs mb-0.5">
                    {i + 1}. {r.rule}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {r.description}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                size="sm"
                onClick={() => setIsRulesModalOpen(false)}
                className="text-xs bg-foreground text-background hover:bg-foreground/90"
              >
                Understood
              </Button>
            </div>
          </div>
        </Modal>

      </div>
    </RoleGuard>
  );
}

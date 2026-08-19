"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Internship,
  Application,
  ApplicationStatus,
  Conversation,
  Community,
  NotificationItem,
  Project,
} from "@/types";
import { mockInternships } from "@/data/mock-internships";
import { initialMockApplications } from "@/data/mock-applications";
import { initialMockConversations } from "@/data/mock-messages";
import { initialMockCommunities } from "@/data/mock-communities";
import { initialMockNotifications } from "@/data/mock-notifications";
import { defaultStudentUser } from "@/data/mock-users";
import { useToast } from "./ToastContext";

interface DataContextType {
  internships: Internship[];
  savedInternshipIds: string[];
  toggleSaveInternship: (id: string) => void;
  isInternshipSaved: (id: string) => boolean;

  applications: Application[];
  applyToInternship: (internship: Internship, note?: string) => boolean;
  updateApplicationStatus: (appId: string, status: ApplicationStatus) => void;
  hasAppliedToInternship: (internshipId: string) => boolean;

  conversations: Conversation[];
  activeConversationId: string;
  setActiveConversationId: (id: string) => void;
  sendMessage: (conversationId: string, text: string) => void;

  communities: Community[];
  toggleJoinCommunity: (communityId: string) => void;
  upvotePost: (communityId: string, postId: string) => void;
  createPost: (communityId: string, title: string, content: string, tags: string[]) => void;

  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;

  projects: Project[];
  addProject: (project: Omit<Project, "id">) => void;
  removeProject: (projectId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { success, info } = useToast();

  const [internships] = useState<Internship[]>(mockInternships);
  const [savedInternshipIds, setSavedInternshipIds] = useState<string[]>(["intern_1", "intern_5"]);
  const [applications, setApplications] = useState<Application[]>(initialMockApplications);
  const [conversations, setConversations] = useState<Conversation[]>(initialMockConversations);
  const [activeConversationId, setActiveConversationId] = useState<string>("conv_1");
  const [communities, setCommunities] = useState<Community[]>(initialMockCommunities);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialMockNotifications);
  const [projects, setProjects] = useState<Project[]>(defaultStudentUser.projects);

  // Sync to local storage where helpful
  useEffect(() => {
    try {
      const storedSaved = localStorage.getItem("studenthub_saved_internships");
      if (storedSaved) {
        setSavedInternshipIds(JSON.parse(storedSaved));
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleSaveInternship = (id: string) => {
    setSavedInternshipIds((prev) => {
      const isSaved = prev.includes(id);
      const updated = isSaved ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem("studenthub_saved_internships", JSON.stringify(updated));
      } catch {
        // ignore
      }
      if (isSaved) {
        info("Removed from saved internships");
      } else {
        success("Saved to your bookmarks");
      }
      return updated;
    });
  };

  const isInternshipSaved = (id: string) => savedInternshipIds.includes(id);

  const hasAppliedToInternship = (internshipId: string) => {
    return applications.some((app) => app.internshipId === internshipId);
  };

  const applyToInternship = (internship: Internship, note?: string): boolean => {
    if (hasAppliedToInternship(internship.id)) {
      info("You have already submitted an application for this position");
      return false;
    }

    const newApp: Application = {
      id: `app_${Date.now()}`,
      internshipId: internship.id,
      company: internship.company,
      companyLogo: internship.companyLogo,
      role: internship.title,
      appliedDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status: "Applied",
      location: internship.location,
      workType: internship.workType,
      stipend: internship.stipend,
      nextStep: "Application submitted via StudentHub Fast-Track",
      notes: note || undefined,
    };

    setApplications((prev) => [newApp, ...prev]);

    // Also push a notification
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      type: "application",
      title: `Applied to ${internship.company}`,
      description: `Your application for ${internship.title} has been logged in your tracker.`,
      timestamp: "Just now",
      isRead: false,
      actionUrl: "/dashboard/applications",
    };
    setNotifications((prev) => [newNotif, ...prev]);

    success(`Successfully applied to ${internship.company}!`);
    return true;
  };

  const updateApplicationStatus = (appId: string, status: ApplicationStatus) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status } : app))
    );
    success(`Application updated to ${status}`);
  };

  const sendMessage = (conversationId: string, text: string) => {
    if (!text.trim()) return;

    const newMsg = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId: "student_01",
      senderName: "Alex Rivera",
      senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      content: text.trim(),
      timestamp: "Just now",
      isSelf: true,
    };

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            lastMessage: {
              text: text.trim(),
              timestamp: "Just now",
              isUnread: false,
            },
            messages: [...conv.messages, newMsg],
          };
        }
        return conv;
      })
    );

    // Realistic simulated instant response after 1.5s
    setTimeout(() => {
      const activeConv = conversations.find((c) => c.id === conversationId);
      if (!activeConv) return;

      let replyText = "Thanks for the message! Let's connect soon.";
      if (activeConv.participant.type === "recruiter") {
        replyText = "Thanks for reaching out, Alex! I've flagged your portfolio for our engineering hiring manager. Talk soon!";
      } else if (activeConv.participant.type === "mentor") {
        replyText = "Great point. Keep iterating on your project demos and focus on system architecture trade-offs!";
      } else {
        replyText = "Awesome, let's sync up on Discord later today!";
      }

      const replyMsg = {
        id: `msg_reply_${Date.now()}`,
        conversationId,
        senderId: activeConv.participant.id,
        senderName: activeConv.participant.name,
        senderAvatar: activeConv.participant.avatar,
        content: replyText,
        timestamp: "Just now",
        isSelf: false,
      };

      setConversations((currentConvs) =>
        currentConvs.map((conv) => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              lastMessage: {
                text: replyText,
                timestamp: "Just now",
                isUnread: true,
              },
              messages: [...conv.messages, replyMsg],
            };
          }
          return conv;
        })
      );
    }, 1200);
  };

  const toggleJoinCommunity = (communityId: string) => {
    setCommunities((prev) =>
      prev.map((comm) => {
        if (comm.id === communityId) {
          const nextState = !comm.isJoined;
          if (nextState) {
            success(`Joined ${comm.name}`);
          } else {
            info(`Left ${comm.name}`);
          }
          return {
            ...comm,
            isJoined: nextState,
            membersCount: nextState ? comm.membersCount + 1 : comm.membersCount - 1,
          };
        }
        return comm;
      })
    );
  };

  const upvotePost = (communityId: string, postId: string) => {
    setCommunities((prev) =>
      prev.map((comm) => {
        if (comm.id === communityId) {
          return {
            ...comm,
            posts: comm.posts.map((p) => {
              if (p.id === postId) {
                const nextUpvoted = !p.hasUpvoted;
                return {
                  ...p,
                  hasUpvoted: nextUpvoted,
                  upvotes: nextUpvoted ? p.upvotes + 1 : p.upvotes - 1,
                };
              }
              return p;
            }),
          };
        }
        return comm;
      })
    );
  };

  const createPost = (
    communityId: string,
    title: string,
    content: string,
    tags: string[]
  ) => {
    const newPost = {
      id: `post_${Date.now()}`,
      author: {
        name: "Alex Rivera",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        headline: "CS Junior @ Stanford",
      },
      title,
      content,
      timestamp: "Just now",
      upvotes: 1,
      hasUpvoted: true,
      commentCount: 0,
      tags,
    };

    setCommunities((prev) =>
      prev.map((comm) => {
        if (comm.id === communityId) {
          return {
            ...comm,
            activeDiscussions: comm.activeDiscussions + 1,
            posts: [newPost, ...comm.posts],
          };
        }
        return comm;
      })
    );

    success("Post published to community!");
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    success("All notifications marked as read");
  };

  const clearNotifications = () => {
    setNotifications([]);
    info("Notifications cleared");
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  const addProject = (proj: Omit<Project, "id">) => {
    const newProject: Project = {
      ...proj,
      id: `proj_${Date.now()}`,
    };
    setProjects((prev) => [newProject, ...prev]);
    success("Project added to profile!");
  };

  const removeProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    info("Project removed from profile");
  };

  return (
    <DataContext.Provider
      value={{
        internships,
        savedInternshipIds,
        toggleSaveInternship,
        isInternshipSaved,
        applications,
        applyToInternship,
        updateApplicationStatus,
        hasAppliedToInternship,
        conversations,
        activeConversationId,
        setActiveConversationId,
        sendMessage,
        communities,
        toggleJoinCommunity,
        upvotePost,
        createPost,
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        projects,
        addProject,
        removeProject,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}

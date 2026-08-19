"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  Trash2,
  Briefcase,
  GitPullRequest,
  Send,
  Users2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { useData } from "@/context/DataContext";

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
  } = useData();

  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Notifications", count: notifications.length },
    {
      id: "application",
      label: "Applications",
      count: notifications.filter((n) => n.type === "application").length,
    },
    {
      id: "internship",
      label: "Internships",
      count: notifications.filter((n) => n.type === "internship").length,
    },
    {
      id: "message",
      label: "Messages",
      count: notifications.filter((n) => n.type === "message").length,
    },
    {
      id: "community",
      label: "Communities",
      count: notifications.filter((n) => n.type === "community").length,
    },
  ];

  const filteredNotifications = notifications.filter((n) => {
    if (activeCategory === "all") return true;
    return n.type === activeCategory;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "application":
        return <GitPullRequest className="w-4 h-4 text-blue-500" />;
      case "internship":
        return <Briefcase className="w-4 h-4 text-purple-500" />;
      case "message":
        return <Send className="w-4 h-4 text-emerald-500" />;
      case "community":
        return <Users2 className="w-4 h-4 text-amber-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Notification Center
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Stay updated on application progress, recruiter messages, and community alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadNotificationsCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllNotificationsAsRead}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Mark All Read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearNotifications}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={categories} activeTab={activeCategory} onChange={setActiveCategory} />

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-6 h-6 text-muted-foreground" />}
          title="All caught up!"
          description="You have no notifications in this category. Check back later for new updates."
        />
      ) : (
        <Card className="divide-y divide-border/60 border-border/80 bg-card overflow-hidden">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                markNotificationAsRead(notif.id);
                if (notif.actionUrl) router.push(notif.actionUrl);
              }}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-muted/40 transition-colors cursor-pointer ${
                !notif.isRead
                  ? "bg-purple-500/5 dark:bg-purple-950/20 border-l-4 border-l-purple-600"
                  : ""
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-muted border border-border/60 flex items-center justify-center shrink-0">
                  {getIcon(notif.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-foreground">
                      {notif.title}
                    </h3>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-purple-600 inline-block" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {notif.description}
                  </p>
                  <span className="text-[10px] text-muted-foreground/80 block">
                    {notif.timestamp}
                  </span>
                </div>
              </div>

              {notif.actionUrl && (
                <div className="self-center hidden sm:flex items-center text-xs font-semibold text-purple-600 dark:text-purple-400 gap-1 shrink-0">
                  <span>View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

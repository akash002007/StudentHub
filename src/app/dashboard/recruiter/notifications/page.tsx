"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  Calendar,
  Eye,
  GitPullRequest,
  Sparkles,
  MessageSquare,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { useData } from "@/context/DataContext";

export default function RecruiterNotificationsPage() {
  const router = useRouter();
  const {
    recruiterNotifications,
    markRecruiterNotificationAsRead,
    markAllRecruiterNotificationsAsRead,
    unreadRecruiterNotificationsCount,
  } = useData();

  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredNotifications = recruiterNotifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "application":
        return <GitPullRequest className="w-4 h-4 text-purple-500" />;
      case "interview":
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case "internship":
        return <Eye className="w-4 h-4 text-amber-500" />;
      case "message":
        return <MessageSquare className="w-4 h-4 text-emerald-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <RoleGuard allowedRole="recruiter">
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hiring Activity</span>
            </div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              Recruiter Notifications
            </h1>
            <p className="text-xs text-muted-foreground">
              Candidate updates, interview RSVPs, and internship milestone notifications.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {unreadRecruiterNotificationsCount > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={markAllRecruiterNotificationsAsRead}
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Mark All as Read
              </Button>
            )}
          </div>
        </div>

        {/* Filter Switcher */}
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === "all"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Activity ({recruiterNotifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === "unread"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Unread ({unreadRecruiterNotificationsCount})
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <Card
                key={notif.id}
                hoverEffect
                className={`p-4 sm:p-5 border-border/80 bg-card flex items-start gap-4 transition-all ${
                  !notif.isRead
                    ? "bg-purple-500/5 dark:bg-purple-950/20 border-purple-500/30"
                    : ""
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-muted border border-border flex items-center justify-center shrink-0 mt-0.5">
                  {getNotificationIcon(notif.type)}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-sm text-foreground">
                      {notif.title}
                    </h3>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {notif.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {notif.description}
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    {notif.actionUrl ? (
                      <Link
                        href={notif.actionUrl}
                        onClick={() => markRecruiterNotificationAsRead(notif.id)}
                        className="inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 font-semibold hover:underline"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    ) : (
                      <div />
                    )}

                    {!notif.isRead && (
                      <button
                        type="button"
                        onClick={() => markRecruiterNotificationAsRead(notif.id)}
                        className="text-[11px] text-muted-foreground hover:text-foreground font-medium"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="p-12 text-center text-muted-foreground bg-card rounded-2xl border border-border">
              <Bell className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm font-semibold">No notifications in this filter.</p>
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}

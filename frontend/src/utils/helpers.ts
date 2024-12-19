import Cookies from "js-cookie";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function timeSincePosted(date: Date): string {
    const now = new Date();
    const seconds = Math.ceil((now.getTime() - date.getTime()) / 1000);

    if (seconds < 0) {
        return "in the future";
    }

    const intervals = [
        { label: "year", seconds: 60 * 60 * 24 * 365 },
        { label: "month", seconds: 60 * 60 * 24 * 30 },
        { label: "week", seconds: 60 * 60 * 24 * 7 },
        { label: "day", seconds: 60 * 60 * 24 },
        { label: "hour", seconds: 60 * 60 },
        { label: "minute", seconds: 60 },
        { label: "second", seconds: 1 },
    ];

    for (const interval of intervals) {
        if (seconds >= interval.seconds) {
            const count = Math.floor(seconds / interval.seconds);
            
            return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
        }
    }

    return "just now";
}

export function handleLogout(router: AppRouterInstance, moveToLoginPage: boolean = false): void {
    Cookies.remove("token");
    Cookies.remove("refresh-token");

    if (moveToLoginPage) {
        router.replace("/login");
    } else {
        window.location.reload();
    }
};
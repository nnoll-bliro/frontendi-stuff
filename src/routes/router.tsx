import { createBrowserRouter, Navigate } from "react-router";

import { api } from "@/api/client";
import { FullscreenLoading } from "@/components/Reusable/FullscreenLoading";

import { CalendarEntryPage } from "./CalendarEntryPage";
import { CalendarPage } from "./CalendarPage";
import { DesignSystemPage } from "./DesignSystemPage";
import { ErrorPage } from "./ErrorPage";
import { MeetingDetailPage } from "./MeetingDetailPage";
import { MeetingsPage } from "./MeetingsPage";
import { RootLayout } from "./RootLayout";
import { SettingsAccountPage } from "./SettingsAccountPage";
import type { TeamData } from "./TeamPage";
import { TeamPage } from "./TeamPage";

/**
 * Data comes from route loaders rather than a store: every page has its rows
 * before it first paints, which is what makes the mockups look populated
 * instead of flashing through a loading state.
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    // Shown while the root loader resolves on a cold load. Without it React
    // Router warns on every first paint, and the app flashes an empty document.
    HydrateFallback: FullscreenLoading,
    loader: () => api.session(),
    children: [
      { index: true, element: <Navigate to="/meetings" replace /> },
      {
        path: "meetings",
        element: <MeetingsPage />,
        errorElement: <ErrorPage />,
        loader: ({ request }) => {
          const params = new URL(request.url).searchParams;
          return api.meetings({
            q: params.get("q") ?? undefined,
            status: params.get("status") ?? undefined,
          });
        },
      },
      {
        path: "meetings/:id",
        element: <MeetingDetailPage />,
        errorElement: <ErrorPage />,
        loader: ({ params }) => api.meeting(params.id as string),
      },
      {
        path: "calendar",
        element: <CalendarPage />,
        errorElement: <ErrorPage />,
        loader: ({ request }) => {
          const range = new URL(request.url).searchParams.get("range");
          return api.calendar((range as "upcoming" | "past" | "all") ?? "upcoming");
        },
      },
      {
        path: "calendar/:id",
        element: <CalendarEntryPage />,
        errorElement: <ErrorPage />,
        loader: ({ params }) => api.calendarEntry(params.id as string),
      },
      {
        path: "team",
        element: <TeamPage />,
        errorElement: <ErrorPage />,
        loader: async (): Promise<TeamData> => ({
          session: await api.session(),
          users: await api.users(),
        }),
      },
      // /settings has one page for now; give it a folder so siblings slot in
      // next to it without moving this route.
      { path: "settings", element: <Navigate to="/settings/account" replace /> },
      {
        path: "settings/account",
        element: <SettingsAccountPage />,
        errorElement: <ErrorPage />,
        // Reuses the root loader's session rather than refetching it.
        loader: () => api.session(),
      },
      { path: "design-system", element: <DesignSystemPage /> },
      { path: "*", element: <ErrorPage /> },
    ],
  },
]);

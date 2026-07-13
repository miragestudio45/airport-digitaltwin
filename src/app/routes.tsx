import { createBrowserRouter, Navigate } from "react-router";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/site/gia-binh" replace />,
  },
  {
    path: "/site/gia-binh",
    lazy: async () => {
      const module = await import("./airport/AirportDigitalTwinPage");
      return { Component: module.AirportDigitalTwinPage };
    },
  },
  {
    path: "*",
    element: <Navigate to="/site/gia-binh" replace />,
  },
]);

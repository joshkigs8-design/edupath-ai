import { RouterProvider } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";

import { getRouter } from "./router";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("EduPath root element is missing");
}

createRoot(rootElement).render(<RouterProvider router={getRouter()} />);

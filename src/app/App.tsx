import QueryProvider from "./providers/QueryProvider";
import ThemeProvider from "./providers/ThemeProvider";
import ToasterProvider from "./providers/ToasterProvider";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";

export default function App() {
  return (
    <ThemeProvider>
      <QueryProvider>
        <RouterProvider router={router} />
        <ToasterProvider />
      </QueryProvider>
    </ThemeProvider>
  );
}



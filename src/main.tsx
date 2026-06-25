import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "@fontsource-variable/inter";
import { BrowserRouter as Router } from "react-router-dom";

// React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <Router basename="/prs">
      <App />
    </Router>
    {/* <ReactQueryDevtools initialIsOpen={false} /> */}
  </QueryClientProvider>
);

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { NhostClient, NhostReactProvider } from "@nhost/react";
import { NhostApolloProvider } from "@nhost/react-apollo";

import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import PageNotFound from "./pages/PageNotFound";
import ProtectedDashboard from "./components/ProtectedDashboard";
import Overview from "./pages/Overview";

const App = () => {
  console.log("Using Nhost configuration:", {
    subdomain: process.env.REACT_APP_NHOST_SUBDOMAIN,
    region: process.env.REACT_APP_NHOST_REGION
  });
  
  // IMPORTANT: For Google authentication to work correctly, you need to set up:
  // 1. In Google Cloud Console:
  //   - Add "http://localhost:3000/app" as an authorized redirect URI
  //   - Add "https://ttgygockyojigiwmkjsl.ap-south-1.nhost.run/v1/auth/providers/google/callback" as an authorized redirect URI
  // 2. In Nhost dashboard:
  //   - Add "http://localhost:3000/app" as a redirect URL
  const nhost = new NhostClient({
    subdomain: process.env.REACT_APP_NHOST_SUBDOMAIN,
    region: process.env.REACT_APP_NHOST_REGION,
  });

  return (
    <NhostReactProvider nhost={nhost}>
      <NhostApolloProvider nhost={nhost}>
        <BrowserRouter>
          <Routes>
            <Route path="sign-up" element={<SignUp nhost={nhost} />} />
            <Route path="sign-in" element={<SignIn nhost={nhost} />} />
            <Route path="/" element={<Home />} />

            <Route path="/app" element={<ProtectedDashboard />}>
              <Route index element={<Overview />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </BrowserRouter>

        <Toaster />
      </NhostApolloProvider>
    </NhostReactProvider>
  );
};

export default App;

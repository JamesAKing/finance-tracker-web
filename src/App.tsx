import { Route, Routes } from "react-router";

import "./App.css";
import { RequireAuth } from "./auth/RequireAuth.tsx";
import { LoginPage } from "./pages/LoginPage.tsx";
import { ProfilePage } from "./pages/ProfilePage.tsx";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}

export default App;

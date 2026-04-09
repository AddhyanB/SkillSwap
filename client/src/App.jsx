import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Discover from "./pages/Discover";
import Requests from "./pages/Requests";
import Chat from "./pages/Chat";
import ChatList from "./pages/ChatList";
import Call from "./pages/Call";
import Leaderboard from "./pages/Leaderboard";

// Layout
import Layout from "./components/Layout";

function App() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <Router>
      <Layout>
        <Routes>

          {/* HOME ALWAYS FIRST */}
          <Route path="/" element={<Home />} />

          {/* AUTH */}
          <Route
            path="/login"
            element={user ? <Navigate to="/discover" /> : <Login />}
          />

          <Route
            path="/signup"
            element={user ? <Navigate to="/discover" /> : <Signup />}
          />

          {/* PROTECTED */}
          <Route
            path="/discover"
            element={user ? <Discover /> : <Navigate to="/login" />}
          />

          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/login" />}
          />

          <Route
            path="/requests"
            element={user ? <Requests /> : <Navigate to="/login" />}
          />

          <Route
            path="/leaderboard"
            element={user ? <Leaderboard /> : <Navigate to="/login" />}
          />

          <Route
            path="/chats"
            element={user ? <ChatList /> : <Navigate to="/login" />}
          />

          <Route
            path="/chat/:id"
            element={user ? <Chat /> : <Navigate to="/login" />}
          />

          <Route path="/call/:roomId" element={<Call />} />

        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

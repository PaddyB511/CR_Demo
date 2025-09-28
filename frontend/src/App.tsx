import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import ProgressPage from "./views/ProgressPage";
import LevelBadgeInline, { LevelBadge } from "./components/LevelBadge";
import LevelCard from "./components/LevelCard";
import Dashboard from "./components/Dashboard";
import DailyGoalProgress from "./components/DailyGoalProgress";
import TotalInputCard from "./components/TotalInputCard";
import MiniBar from "./components/MiniBar";
import SegBar from "./components/SegBar";

type User = {
  username: string;
  email: string;
};

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const getUsers = async () => {
      console.log("isAuthenticated:", isAuthenticated);
      if (!isAuthenticated) {
        return;
      }
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: `https://cr/api/`,
          // scope: "read:current_user",
        },
      });

      console.log("Access Token:", accessToken);
      axios
        .get("/api/users/", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((response) => {
          // DRF may return either a list (simple view) or a paginated object { results: [...] }
          const data = Array.isArray(response.data)
            ? response.data
            : response.data && Array.isArray(response.data.results)
            ? response.data.results
            : [];
          setUsers(data);
        })
        .catch((error) => console.error("Error fetching users:", error));
    };
    getUsers();
  }, [isAuthenticated]);

  return (
    <>
      <TotalInputCard />
      <div>
        <h2>User List</h2>
        {/* <LevelCard /> */}
        {/* <TotalInputCard /> */}
        <ProgressPage />
        {/* <div className="grid grid-cols-1 md:grid-cols-[44%_56%]"> */}
        {/* <div>Left (44%)</div>
          <div>Right (56%)</div> */}
        {/* <TotalInputCard /> */}
        {/* <DailyGoalProgress current={500} goal={500} /> */}
        {/* </div> */}
        <ul>
          {users.map((user) => (
            <li key={user.username}>{user.username}</li>
          ))}
        </ul>
      </div>
      <h2>Comprehensible Russian</h2>
    </>
  );
}

export default App;

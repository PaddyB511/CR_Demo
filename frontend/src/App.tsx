import { useEffect } from "react";
import "./App.css";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import BrowsePage from "./views/BrowsePage";
import ProgressPage from "./views/ProgressPage";
// import ProgressPage from "./views/ProgressPage"; // Unused import
// import LevelBadgeInline, { LevelBadge } from "./components/ProgressPageComponents/LevelBadge"; // Unused import
// import LevelCard from "./components/ProgressPageComponents/LevelCard"; // Unused import
// import Dashboard from "./components/ProgressPageComponents/Dashboard"; // Unused import
// import DailyGoalProgress from "./components/ProgressPageComponents/DailyGoalProgress"; // Unused import
// import TotalInputCard from "./components/ProgressPageComponents/TotalInputCard"; // Unused import
// import MiniBar from "./components/ProgressPageComponents/MiniBar"; // Unused import
// import SegBar from "./components/ProgressPageComponents/SegBar"; // Unused import

// type User = {
//   username: string;
//   email: string;
// };

function App() {
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
      {/* Temporary: show Browse page for development */}
      <ProgressPage />
    </>
  );
}

export default App;

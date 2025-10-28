import { useState, useRef } from "react";
import axios from "axios";
import DailyGoalProgress from "../components/ProgressPageComponents/DailyGoalProgress";
import GoalSetter from "../components/ProgressPageComponents/GoalSetter";
import { JournalCard } from "../components/ProgressPageComponents/JournalCard";
import LevelCard from "../components/ProgressPageComponents/LevelCard";
import TotalInputCard from "../components/ProgressPageComponents/TotalInputCard";
import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

type User = {
  username: string;
  email: string;
};

const ProgressPage = () => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    console.log("[ProgressPage] mount");
    return () => {
      mounted.current = false;
      console.log("[ProgressPage] unmount");
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function getUsers() {
      console.log("[ProgressPage] isAuthenticated:", isAuthenticated);
      if (!isAuthenticated) return; // Still render static UI even if not auth.
      setLoading(true);
      setTokenError(null);
      try {
        const accessToken = await getAccessTokenSilently({
          authorizationParams: {
            audience: `https://cr/api/`,
            // Removed scope for now to avoid silent auth failures unless needed.
          },
        });
        console.log("[ProgressPage] acquired token len=", accessToken?.length);
        if (cancelled) return;
        const resp = await axios.get<User[]>("/api/users/", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!cancelled) setUsers(resp.data as any);
      } catch (e) {
        if (!cancelled) {
          console.error("[ProgressPage] token/user fetch error", e);
          setTokenError(e?.message || "Failed to load user list");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    getUsers();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, getAccessTokenSilently]);

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <main className="flex flex-col flex-1 mx-10 pb-10">
        <div className="grid grid-cols-2 grid-rows-[253px_200px] md:grid-cols-[44fr_56fr] gap-x-[35px] gap-y-[35px]">
          <div className="row-start-1 col-start-1">
            <LevelCard />
          </div>
          <div className="row-start-1 col-start-2">
            <DailyGoalProgress
              current={1.5}
              goal={2}
              recordDays={7}
              className="justify-self-start mx-0"
            />
          </div>
          <div className="row-start-2 col-start-1">
            <TotalInputCard />
          </div>
          <div className="row-start-2 col-start-2">
            <JournalCard />
          </div>
        </div>
        <hr className="my-8 border-t border-gray-200" />
        <GoalSetter />
      </main>
    </div>
  );
};

export default ProgressPage;

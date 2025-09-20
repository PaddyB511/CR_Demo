import { useEffect, useState } from 'react'
import './App.css'
import axios from "axios"
import { useAuth0 } from '@auth0/auth0-react';

// Define the expected user shape coming from the API
type User = {
  username: string
  email: string
}

function App() {
  // Explicitly type users as User[]
  const [users, setUsers] = useState<User[]>([])
  const { isAuthenticated,getAccessTokenSilently } = useAuth0();

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
    axios.get('/api/users/', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
      .then((response) => {
        // DRF may return either a list (simple view) or a paginated object { results: [...] }
        const data = Array.isArray(response.data)
          ? response.data
          : (response.data && Array.isArray(response.data.results) ? response.data.results : [])
        setUsers(data)
      })
      .catch((error) => console.error('Error fetching users:', error))
    }
    getUsers();
  }, [isAuthenticated])

  return (
    <>
      <div>
        <h2>User List</h2>
        <ul>
          {users.map((user) => (
            <li key={user.username}>{user.username}</li>
          ))}
        </ul>
      </div>
      <h2>Comprehensible Russian</h2>
    </>
  )
}

export default App

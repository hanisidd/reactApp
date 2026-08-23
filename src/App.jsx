import { useEffect, useState } from "react";
import UserCard from './UserCard.jsx'

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await fetch("https://jsonplaceholder.typicode.com/users");
        const data = await response.json();
        setUsers(data);

      } catch (error) {
        setError("unexpected error accured");
      } finally {
        setLoading(false);
      }

    };
    getUsers();
  }, []);
  if (loading) {
    return <h2>Loadinggg.........</h2>
  }
  if (error) {
    return <h2>{error}</h2>
  }
  return (
    <div>
      <h1>Users</h1>

      {users.map(user => (
        <UserCard key={user.id} user={user} />
               ))}
    </div>
  );
}

export default Users;
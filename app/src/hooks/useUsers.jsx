import React, { useState, useEffect } from "react";
import { authFetch } from "../util/url";

export const useUsers = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const r = await authFetch("/api/users");
      const data = await r.json();
      setUsers(data.users);
      setMeta(data.meta);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, error, meta, refetch: fetchUsers };
};
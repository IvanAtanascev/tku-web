import React, { useEffect, useState } from "react";
import type { User } from "../types/User";

export default function UserListDashboard() {
  const [userList, setUserList] = useState<User[]>([]);
  const [username, setUsername] = useState<string>("");
  const [debouncedUsername, setDebouncedUsername] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [debouncedUserId, setDebouncedUserId] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalUsers, setTotalUsers] = useState<number>(1);
  const [hasPreviousPage, setHasPreviousPage] = useState<boolean>(false);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [userIsTyping, setUserIsTyping] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedUserId(userId);
      setDebouncedUsername(username);
      setPage(1);
      setUserIsTyping(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [username, userId]);

  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger, page, debouncedUserId, debouncedUsername]);

  const fetchUsers = async () => {
    try {
      const url = new URL(`/api/users`, window.location.origin);

      url.searchParams.append("page", String(page));
      url.searchParams.append("limit", "10");

      if (debouncedUserId) url.searchParams.append("userId", debouncedUserId);
      if (debouncedUsername)
        url.searchParams.append("username", debouncedUsername);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("failed to fetch users");
      }

      const { data, meta } = await response.json();

      const users: User[] = data;

      setTotalPages(meta.totalPages);
      setTotalUsers(meta.totalRecords);
      setHasNextPage(meta.hasNextPage);
      setHasPreviousPage(meta.hasPrevPage);

      setUserList(users);
    } catch (error) {
      console.log(error);
    }
  };

  const handleOnInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setterFunction: (querystring: string) => void,
  ) => {
    setterFunction(e.target.value);
    setUserIsTyping(true);
  };

  return (
    <div>
      <div>
        <input
          onChange={(e) => {
            handleOnInputChange(e, setUserId);
          }}
          name="search id"
          placeholder="Search by Id..."
        />
        <input
          onChange={(e) => {
            handleOnInputChange(e, setUsername);
          }}
          name="search username"
          placeholder="Search by Username..."
        />
      </div>
      <div>
        {userList.map((user) => (
          <div>
            <div>{`username: ${user.username}`}</div>
            <div>{`id: ${user.id}`}</div>
            <div>{`role: ${user.role}`}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import type { User } from "../../types/User";
import { useConfirm } from "../../components/ConfirmContext";
import styles from "./UserListDashboard.module.css";
import Pagination from "@/components/Pagination";

interface UserEntryProps {
  user: User;
  promoteCallback: (userId: number) => void;
  deleteCallback: (userId: number) => void;
}

function UserEntry({ user, promoteCallback, deleteCallback }: UserEntryProps) {
  return (
    <tr className={styles.userEntry}>
      <td>{user.id}</td>
      <td>{user.username}</td>
      <td>{user.role}</td>
      <td className={styles.userActions}>
        {user.role === "USER" ? (
          <>
            <div>
              <button
                onClick={() => {
                  promoteCallback(user.id);
                }}
              >
                Promote to ADMIN
              </button>
            </div>
            <div>
              <button
                onClick={() => {
                  deleteCallback(user.id);
                }}
              >
                Delete user
              </button>
            </div>
          </>
        ) : null}
      </td>
    </tr>
  );
}

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
  const confirm = useConfirm();

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

  const handlePromoteUserToAdmin = async (id: number) => {
    const isConfirmed = await confirm(
      `Are you sure you to make user with id: ${id} an ADMIN?`,
    );

    if (!isConfirmed) return;

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: "ADMIN" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "update failed");
      }

      setUserList((prev) => prev.map((user) => (user.id === id ? data : user)));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteUser = async (id: number) => {
    const isConfirmed = await confirm(
      `Are you sure you want to delete user with id: ${id}`,
    );

    if (!isConfirmed) return;

    try {
      await fetch(`/api/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="pageContainer">
        <div className="pillow">
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
        <table className={styles.userTable}>
          <thead>
            <tr>
              <th>Id</th>
              <th>Username</th>
              <th>Role</th>
              <th>actions</th>
            </tr>
          </thead>
          <tbody>
            {userList.map((user) => (
              <UserEntry
                key={user.id}
                user={user}
                promoteCallback={() => {
                  handlePromoteUserToAdmin(user.id);
                }}
                deleteCallback={() => {
                  handleDeleteUser(user.id);
                }}
              />
            ))}
          </tbody>
        </table>
      <Pagination
        totalPages={totalPages}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        page={page}
        pageSetter={setPage}
      />
    </div>
  );
}

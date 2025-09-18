import { useEffect, useState } from "react";
import { showError } from "../helpers/alert";
import http from "../helpers/http";


export const CMSUserPage = () => {
    const [users, setUsers] = useState([]);
  
    const handleDelete = async (id) => {
      try {
        await http({
          method: "DELETE",
          url: `/user/${id}`,
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
      } catch (error) {
        showError(error)
      }
    }

    const fetchUsers = async () => {
      try {
        const response = await http({
          method: "GET",
          url: "/users",
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
          
        });
        setUsers(response.data);
      } catch (error) {
        showError(error);
      }
    }

    useEffect(() => {
      fetchUsers()
    }, [])

  return (
    <>
     <div className="p-6 space-y-8">
      {/* Users Table */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-center mb-6">
            <h2 className="card-title text-2xl">User Management</h2>
            <button className="btn btn-primary">
              Add New User
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th className="text-base font-semibold">ID</th>
                  <th className="text-base font-semibold">Email</th>
                  <th className="text-base font-semibold">Full Name</th>
                  <th className="text-base font-semibold">Status</th>
                  <th className="text-base font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-base-200">
                    <td className="font-medium">{user.id}</td>
                    <td>{user.email}</td>
                    <td>{user.fullName}</td>
                    <td>
                      <div className="badge badge-sm">
                        {user.isPremium ? (
                          <span className="badge badge-success">Premium</span>
                        ) : (
                          <span className="badge badge-ghost">Free</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-ghost btn-xs">
                          Edit
                        </button>
                        <button onClick={() => {
                          handleDelete(user.id)
                        }} className="btn btn-ghost btn-xs text-error">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <div className="text-base-content/60">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <p className="text-lg font-medium mb-2">No users found</p>
                <p className="text-sm">Get started by adding your first user</p>
              </div>
              <button className="btn btn-primary mt-4">
                Add First User
              </button>
            </div>
          )}
        </div>
      </div>

    



    </div>
  
    
    </>
  )
}

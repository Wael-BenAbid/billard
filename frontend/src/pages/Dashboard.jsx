import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="dashboard-container">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="welcome-message">Welcome back, {user?.email || 'User'}!</p>
      </header>

      <main className="dashboard-content">
        <div className="card">
          <h2>Your Profile</h2>
          <div className="profile-info">
            {user && (
              <>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Full Name:</strong> {user.full_name || 'Not set'}</p>
                <p><strong>Joined:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
              </>
            )}
          </div>
        </div>

        <div className="card">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <button className="btn btn-secondary">Edit Profile</button>
            <button className="btn btn-secondary">Change Password</button>
            <button className="btn btn-secondary">Settings</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

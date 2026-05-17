import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Skeleton } from '@mui/material';
import { Users, UserCheck, Mail, FileText, CheckCircle, UserPlus, LogOut, LayoutGrid } from 'lucide-react';
import api from '../api/client';
import '../styles/theme.css';

interface Stats {
  users: {
    total: number;
    active: number;
    pending: number;
  };
  projects: {
    total: number;
    published: number;
  };
}

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  createdAt: string;
  _count: { projects: number };
}

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('ARTIST');
  const [isInviting, setIsInviting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/users/stats'),
        api.get('/admin/users'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      enqueueSnackbar('Error loading data', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      await api.post('/admin/users/invite', { email: inviteEmail, role: inviteRole });
      enqueueSnackbar(`Invitation sent to ${inviteEmail}`, { variant: 'success' });
      setInviteEmail('');
      fetchData();
    } catch (err: any) {
      enqueueSnackbar(err.response?.data?.error || 'Invitation failed', { variant: 'error' });
    } finally {
      setIsInviting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sessionToken');
    navigate('/login');
  };

  const statCards = [
    { label: 'Total Artists', value: stats?.users.total ?? 0, icon: <Users size={20} color="var(--accent)" /> },
    { label: 'Active Artists', value: stats?.users.active ?? 0, icon: <UserCheck size={20} color="#10b981" /> },
    { label: 'Pending Invites', value: stats?.users.pending ?? 0, icon: <Mail size={20} color="#f59e0b" /> },
    { label: 'Total Projects', value: stats?.projects.total ?? 0, icon: <FileText size={20} color="var(--accent)" /> },
    { label: 'Published', value: stats?.projects.published ?? 0, icon: <CheckCircle size={20} color="#10b981" /> },
  ];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <LayoutGrid size={20} color="var(--accent)" />
          <h1>Super Admin</h1>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <main style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
          {isLoading ? (
            [1, 2, 3, 4, 5].map(i => <Skeleton key={i} variant="rectangular" height={90} style={{ borderRadius: '1rem' }} />)
          ) : (
            statCards.map(card => (
              <div key={card.label} className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {card.icon}
                  <span style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>{card.value}</span>
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{card.label}</span>
              </div>
            ))
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
          {/* User Table */}
          <section className="glass-card" style={{ padding: '1.5rem', overflow: 'hidden' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} /> User Management
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    {['Email', 'Role', 'Status', 'Projects'].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    [1, 2, 3].map(i => <tr key={i}><td colSpan={4}><Skeleton height={48} /></td></tr>)
                  ) : users.length === 0 ? (
                    <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No users found</td></tr>
                  ) : (
                    users.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '0.75rem 1rem' }}>{u.email}</td>
                        <td style={{ padding: '0.75rem 1rem' }}><span className="badge">{u.role}</span></td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: u.status === 'ACTIVE' ? '#10b981' : '#f59e0b' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                            {u.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>{u._count?.projects ?? 0}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Invite Form */}
          <section className="glass-card" style={{ padding: '1.5rem', height: 'fit-content' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserPlus size={18} /> Invite User
            </h2>
            <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="artist@example.com"
                  required
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '0.5rem', padding: '0.7rem', color: 'white', outline: 'none', fontSize: '0.9rem' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Role</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value)}
                  style={{ background: 'rgba(30,30,45,0.9)', border: '1px solid var(--border-glass)', borderRadius: '0.5rem', padding: '0.7rem', color: 'white', outline: 'none', fontSize: '0.9rem' }}
                >
                  <option value="ARTIST">Artist</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
              <button type="submit" className="btn-primary" disabled={isInviting || !inviteEmail} style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}>
                {isInviting ? 'Sending...' : 'Send Invitation'}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;

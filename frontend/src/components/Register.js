import React, { useState } from 'react';
import { Auth } from 'aws-amplify';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await Auth.signUp({
        username,
        password,
        attributes: { email }
      });
      navigate("/confirm", { state: { username } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
        <div className="auth-image">
            <img src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1000&auto=format&fit=crop&q=80" alt="Lumina Editorial" />
        </div>
        <div className="auth-form-container">
            <div className="auth-form-inner">
                <h2>Create Account</h2>
                <p>Join LUMINA for exclusive access to new collections.</p>

                {error && <div className="error" style={{marginBottom: 24}}>{error}</div>}

                <form onSubmit={submit}>
                    <div className="auth-form-group">
                        <label>Username</label>
                        <input
                            className="input"
                            value={username}
                            onChange={(e)=>setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="auth-form-group">
                        <label>Email</label>
                        <input
                            className="input"
                            type="email"
                            value={email}
                            onChange={(e)=>setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="auth-form-group">
                        <label>Password</label>
                        <input
                            className="input"
                            type="password"
                            value={password}
                            onChange={(e)=>setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button className="btn-full" disabled={loading}>
                        {loading ? "CREATING..." : "REGISTER"}
                    </button>
                </form>

                <p style={{fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center'}}>
                    Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
                </p>
            </div>
        </div>
    </div>
  );
}
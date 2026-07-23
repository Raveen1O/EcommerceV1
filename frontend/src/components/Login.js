import React, { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import { useNavigate, Link } from 'react-router-dom';
import { isLoggedIn } from '../services/auth';

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn()) {
            navigate("/");
        }
    }, [navigate]);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await Auth.signIn(username, password);
            const session = await Auth.currentSession();
            localStorage.setItem("accessToken", session.getAccessToken().getJwtToken());
            localStorage.setItem("idToken", session.getIdToken().getJwtToken());
            navigate("/");
        } catch(err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return(
        <div className="auth-page">
            <div className="auth-image">
                <img src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1000&auto=format&fit=crop&q=80" alt="Lumina Editorial" />
            </div>
            <div className="auth-form-container">
                <div className="auth-form-inner">
                    <h2>Welcome Back</h2>
                    <p>Enter your details to access your LUMINA account.</p>

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
                            {loading ? "LOGGING IN..." : "SIGN IN"}
                        </button>
                    </form>

                    <p style={{fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center'}}>
                        Don't have an account? <Link to="/register" className="auth-link">Create one</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
import React, { useState } from "react";
import { Auth } from "aws-amplify";
import { useNavigate, useLocation } from "react-router-dom";

export default function ConfirmRegistration() {

    const location = useLocation();

    const navigate = useNavigate();

    const [username, setUsername] = useState(location.state?.username || "");

    const [code, setCode] = useState("");

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const submit = async (e) => {

        e.preventDefault();

        setLoading(true);

        setError("");

        try {

            await Auth.confirmSignUp(username, code);

            alert("Account verified successfully!");

            navigate("/login");

        }

        catch (err) {

            setError(err.message);

        }

        finally {

            setLoading(false);

        }

    };

    const resendCode = async () => {

        try {

            await Auth.resendSignUp(username);

            alert("Verification code sent again.");

        }

        catch (err) {

            alert(err.message);

        }

    };

    return (
        <div className="auth-page">
            <div className="auth-image">
                <img src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1000&auto=format&fit=crop&q=80" alt="Lumina Editorial" />
            </div>
            <div className="auth-form-container">
                <div className="auth-form-inner">
                    <h2>Verify Email</h2>
                    <p>Enter the verification code sent to your email.</p>

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
                            <label>Verification Code</label>
                            <input
                                className="input"
                                value={code}
                                onChange={(e)=>setCode(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            className="btn-full"
                            disabled={loading}
                        >
                            {loading ? "Verifying..." : "Verify"}
                        </button>
                    </form>

                    <button
                        className="btn-secondary"
                        onClick={resendCode}
                        style={{
                            marginTop: 15,
                            width: "100%"
                        }}
                    >
                        Resend Code
                    </button>
                </div>
            </div>
        </div>
    );

}
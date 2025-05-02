import React from 'react';
import '../style/LandingPage.css';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-wrapper">
            {/* Navbar */}
            <nav className="landing-navbar">
                <div className="navbar-logo">
                    <div className="logo-icon">📦</div>
                    <span>ProductFlow</span>
                </div>
                <div className="navbar-buttons">
                    <button onClick={() => navigate('/login')}>Login</button>
                    <button onClick={() => navigate('/register')} className="register-btn">Register</button>
                </div>
            </nav>

            {/* Hero */}
            <section className="landing-hero">
                <div className="hero-text">
                    <h1>
                        Simplify Your <span className="highlight">Product Management</span>
                    </h1>
                    <p>
                        Collaborate, plan, and measure success — in one seamless platform.
                    </p>
                    <div className="hero-buttons">
                        <button onClick={() => navigate('/login')} className="btn-primary">Get Started</button>
                        <button onClick={() => navigate('/register')} className="btn-outline">Create Account</button>
                    </div>
                </div>
                <div className="hero-image">
                    <img src="https://img.freepik.com/free-vector/product-manager-concept-illustration_114360-21574.jpg?semt=ais_hybrid&w=740" alt="Illustration" />
                </div>
            </section>

            {/* Features */}
            <section className="landing-features">
                <h2>Empower Your Team</h2>
                <div className="feature-cards">
                    {[
                        { icon: "🧩", title: "Case Study Management", desc: "Track and organize case studies effortlessly." },
                        { icon: "🛣️", title: "Roadmap Planning", desc: "Align product vision with team execution." },
                        { icon: "📊", title: "Analytics Dashboard", desc: "Measure success with actionable insights." }
                    ].map((item, i) => (
                        <div className="feature-card" key={i}>
                            <div className="icon">{item.icon}</div>
                            <h3>{item.title}</h3>
                            <p>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div>© {new Date().getFullYear()} Company. All rights reserved.</div>
            </footer>
        </div>
    );
};

export default LandingPage;

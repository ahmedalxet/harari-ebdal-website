import React, { useEffect } from "react";

const Admin = () => {
  useEffect(() => {
    // Redirect to the admin.html file in the public directory
    window.location.replace("/admin.html");
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "18px",
        color: "#666",
        flexDirection: "column",
      }}
    >
      <div style={{ marginBottom: "20px" }}>🏛️ Loading Admin Dashboard...</div>
      <div style={{ fontSize: "14px", color: "#999" }}>
        If you're not redirected automatically,
        <a
          href="/admin.html"
          style={{ color: "#f59e0b", textDecoration: "none" }}
        >
          click here
        </a>
      </div>
    </div>
  );
};

export default Admin;

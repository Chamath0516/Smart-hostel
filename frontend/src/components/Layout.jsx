import Navbar from "./Navbar";

export default function Layout({ children, narrow = false }) {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <div className={`app-container${narrow ? " app-container-narrow" : ""}`}>{children}</div>
      </main>
    </div>
  );
}

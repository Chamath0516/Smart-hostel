export default function Card({ children, className = "" }) {
  const cardClassName = className ? `app-card ${className}` : "app-card";
  return <section className={cardClassName}>{children}</section>;
}

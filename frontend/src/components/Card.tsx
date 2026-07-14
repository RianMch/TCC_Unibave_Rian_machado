interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export default function Card({ children, style }: CardProps) {
  return (
    <div style={{
      background: "white",
      border: "1px solid #e5e7eb",
      borderRadius: 14,
      padding: 24,
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      ...style,
    }}>
      {children}
    </div>
  );
}
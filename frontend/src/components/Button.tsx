interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "outline" | "whatsapp";
  fullWidth?: boolean;
  disabled?: boolean;
}

const estilos = {
  primary: { background: "#0F6E56", color: "white" },
  secondary: { background: "#085041", color: "white" },
  outline: { background: "white", color: "#0F6E56", border: "1.5px solid #0F6E56" },
  whatsapp: { background: "#25D366", color: "white" },
};

export default function Button({ children, onClick, type = "button", variant = "primary", fullWidth = false, disabled = false }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...estilos[variant],
        padding: "11px 20px",
        width: fullWidth ? "100%" : "auto",
        borderRadius: "10px",
        fontSize: "14px",
        fontWeight: 500,
      }}
    >
      {children}
    </button>
  );
}
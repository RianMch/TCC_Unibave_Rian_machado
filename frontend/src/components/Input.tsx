interface InputProps {
  label: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  max?: number;
  min?: number;
  step?: number;
}

export default function Input({ label, type = "text", value, onChange, placeholder, max, min, step }: InputProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        max={max}
        min={min}
        step={step}
      />
    </div>
  );
}
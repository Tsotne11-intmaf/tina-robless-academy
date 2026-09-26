"use client";

function Eye({ shown }: { shown: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1.8 12S5.7 5.2 12 5.2 22.2 12 22.2 12 18.3 18.8 12 18.8 1.8 12 1.8 12Z" />
      <circle cx="12" cy="12" r="3.1" />
      {shown ? <path d="M3.5 3.5l17 17" /> : null}
    </svg>
  );
}

/* Shared by the login panel and the recovery page so the eye toggle behaves the same
   in both, and so its tooltip can be translated from one place. */
export default function PasswordField({
  id,
  name = "password",
  label,
  autoComplete,
  placeholder,
  minLength,
  shown,
  onToggle,
  showLabel,
  hideLabel,
}: {
  id: string;
  name?: string;
  label: string;
  autoComplete: string;
  placeholder: string;
  minLength?: number;
  shown: boolean;
  onToggle: () => void;
  showLabel: string;
  hideLabel: string;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="pass-wrap">
        <input
          id={id}
          name={name}
          type={shown ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          minLength={minLength}
          required
        />
        <button
          type="button"
          className="pass-eye"
          onClick={onToggle}
          aria-label={shown ? hideLabel : showLabel}
          title={shown ? hideLabel : showLabel}
        >
          <Eye shown={shown} />
        </button>
      </div>
    </div>
  );
}

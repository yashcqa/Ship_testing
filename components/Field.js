export default function Field({ id, label, error, hint, children }) {
  return (
    <div className={`field${error ? " field--error" : ""}`} data-testid={`field-${id}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <p className="field__hint">{hint}</p>}
      {error && (
        <p className="field__error" id={`${id}-error`} role="alert" data-testid={`error-${id}`}>
          {error}
        </p>
      )}
    </div>
  );
}

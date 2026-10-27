import { cn } from "@/lib/utils";

type FieldProps = {
  label: string;
  name: string;
  errors?: string[];
  hint?: string;
  className?: string;
} & (
  | ({ as?: "input" } & React.InputHTMLAttributes<HTMLInputElement>)
  | ({ as: "textarea" } & React.TextareaHTMLAttributes<HTMLTextAreaElement>)
);

/** Label + input/textarea + validation error, wired up for accessibility. */
export function Field({ label, name, errors, hint, className, ...props }: FieldProps) {
  const id = `field-${name}`;
  const errorId = errors?.length ? `${id}-error` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {props.as === "textarea" ? (
        <textarea
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          id={id}
          name={name}
          aria-invalid={Boolean(errorId)}
          aria-describedby={errorId}
          className={cn("input min-h-[96px]", errorId && "border-red-400")}
        />
      ) : (
        <input
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          id={id}
          name={name}
          aria-invalid={Boolean(errorId)}
          aria-describedby={errorId}
          className={cn("input", errorId && "border-red-400")}
        />
      )}
      {hint && !errorId && <p className="mt-1 text-xs text-stone-500">{hint}</p>}
      {errorId && (
        <p id={errorId} className="field-error">
          {errors![0]}
        </p>
      )}
    </div>
  );
}

export function SelectField({
  label,
  name,
  errors,
  children,
  className,
  ...props
}: {
  label: string;
  name: string;
  errors?: string[];
  className?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const id = `field-${name}`;
  const errorId = errors?.length ? `${id}-error` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <select
        {...props}
        id={id}
        name={name}
        aria-invalid={Boolean(errorId)}
        aria-describedby={errorId}
        className={cn("input", errorId && "border-red-400")}
      >
        {children}
      </select>
      {errorId && (
        <p id={errorId} className="field-error">
          {errors![0]}
        </p>
      )}
    </div>
  );
}

export function CheckboxField({
  label,
  name,
  defaultChecked,
  description,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-orange-100 bg-white p-3">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 rounded border-orange-300 text-brand-600 focus:ring-brand-500"
      />
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description && <span className="block text-xs text-stone-500">{description}</span>}
      </span>
    </label>
  );
}

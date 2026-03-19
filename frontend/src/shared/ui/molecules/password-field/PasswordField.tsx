import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { FormField } from "../form-field/FormField";
import { Button } from "../../atoms";

interface PasswordFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    helperText?: string;
    errorText?: string;
    containerClassName?: string;
}

export function PasswordField({
    label = "Password",
    id = "password",
    helperText,
    errorText,
    containerClassName,
    ...props
}: PasswordFieldProps) {
    const [visible, setVisible] = useState(false);

    return (
        <FormField
            id={id}
            type={visible ? "text" : "password"}
            label={label}
            helperText={helperText}
            errorText={errorText}
            containerClassName={containerClassName}
            leftIcon={<Lock className="h-4 w-4" />}
            rightSlot={
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                    onClick={() => setVisible((prev) => !prev)}
                    aria-label={visible ? "Hide password" : "Show password"}
                >
                    {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
            }
            {...props}
        />
    );
}

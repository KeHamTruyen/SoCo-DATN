import { useRef } from "react";
import { cn } from "../../../lib/cn";

interface OtpInputProps {
    length?: number;
    className?: string;
    namePrefix?: string;
}

export function OtpInput({
    length = 6,
    className,
    namePrefix = "otp_",
}: OtpInputProps) {
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

    const focusAt = (index: number) => {
        inputRefs.current[index]?.focus();
        inputRefs.current[index]?.select();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value.replace(/\D/g, "").slice(-1);
        e.target.value = value;
        if (value && index < length - 1) {
            focusAt(index + 1);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace") {
            const input = inputRefs.current[index];
            if (input && input.value === "" && index > 0) {
                focusAt(index - 1);
                const prev = inputRefs.current[index - 1];
                if (prev) prev.value = "";
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            focusAt(index - 1);
        } else if (e.key === "ArrowRight" && index < length - 1) {
            focusAt(index + 1);
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
        e.preventDefault();
        const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length - index);
        digits.split("").forEach((digit, i) => {
            const input = inputRefs.current[index + i];
            if (input) input.value = digit;
        });
        const nextFocus = Math.min(index + digits.length, length - 1);
        focusAt(nextFocus);
    };

    return (
        <div className={cn("flex items-center justify-center gap-2 sm:gap-3", className)}>
            {Array.from({ length }).map((_, index) => (
                <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    name={`${namePrefix}${index + 1}`}
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    autoFocus={index === 0}
                    className="h-12 w-10 rounded-lg border-2 border-neutral-200 bg-white text-center text-xl font-bold outline-none transition-all focus:border-primary dark:border-neutral-700 dark:bg-neutral-900 sm:h-14 sm:w-12"
                    aria-label={`OTP digit ${index + 1}`}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={(e) => handlePaste(e, index)}
                    onFocus={(e) => e.target.select()}
                />
            ))}
        </div>
    );
}

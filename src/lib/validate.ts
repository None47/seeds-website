// Server-side validation and sanitization utilities

// ─── GST Validation ───────────────────────────────────────────────────────────
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export function isValidGST(gst: string): boolean {
    return GST_REGEX.test(gst.toUpperCase().trim());
}

// ─── PAN Validation ───────────────────────────────────────────────────────────
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export function isValidPAN(pan: string): boolean {
    return PAN_REGEX.test(pan.toUpperCase().trim());
}

// ─── Pincode Validation ───────────────────────────────────────────────────────
export function isValidPincode(pin: string): boolean {
    return /^[1-9][0-9]{5}$/.test(pin.trim());
}

// ─── Phone Validation ─────────────────────────────────────────────────────────
export function isValidPhone(phone: string): boolean {
    return /^[6-9][0-9]{9}$/.test(phone.trim());
}

// ─── Email Validation ─────────────────────────────────────────────────────────
export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ─── Password Strength ────────────────────────────────────────────────────────
export function isStrongPassword(password: string): boolean {
    return password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password);
}

// ─── String Sanitizer ─────────────────────────────────────────────────────────
export function sanitize(value: unknown): string {
    if (typeof value !== "string") return "";
    return value.trim().replace(/<[^>]*>/g, "").slice(0, 2000);
}

export function sanitizeNumber(value: unknown, fallback = 0): number {
    const n = Number(value);
    return isNaN(n) || !isFinite(n) ? fallback : n;
}

// ─── Validation Error Collector ───────────────────────────────────────────────
export interface ValidationResult {
    valid: boolean;
    errors: Record<string, string>;
}

export function validate(rules: Record<string, string | null>): ValidationResult {
    const errors: Record<string, string> = {};
    for (const [field, error] of Object.entries(rules)) {
        if (error) errors[field] = error;
    }
    return { valid: Object.keys(errors).length === 0, errors };
}

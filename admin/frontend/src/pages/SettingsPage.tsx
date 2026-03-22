import { useAuth } from "@/auth/AuthContext";
import {
    useThemePreference,
    type ThemePreference,
} from "@/theme/ThemePreferenceProvider";

export default function SettingsPage() {
    const { user } = useAuth();
    const { preference, setPreference } = useThemePreference();

    return (
        <div>
            <header className="mb-8">
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                    Settings
                </h2>
                <p className="mt-1 text-muted-foreground">
                    Admin session and environment
                </p>
            </header>

            <div className="max-w-lg space-y-6">
                <div className="rounded-xl border border-border bg-card p-6 text-card-foreground">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        Appearance
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Matches the main SoCo app (light / dark / system).
                    </p>
                    <label className="mt-4 block text-xs font-semibold text-muted-foreground">
                        Theme
                    </label>
                    <select
                        value={preference}
                        onChange={(e) =>
                            setPreference(e.target.value as ThemePreference)
                        }
                        className="mt-1 w-full rounded-lg border border-border bg-input-background px-3 py-2 text-sm text-foreground"
                    >
                        <option value="system">System</option>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 text-card-foreground">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        Signed in as
                    </h3>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                        {user?.fullName || user?.username}
                    </p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    <p className="mt-4 text-xs text-muted-foreground">
                        API:{" "}
                        {import.meta.env.VITE_ADMIN_API_BASE_URL ||
                            "http://localhost:5001/api"}
                    </p>
                </div>
            </div>
        </div>
    );
}

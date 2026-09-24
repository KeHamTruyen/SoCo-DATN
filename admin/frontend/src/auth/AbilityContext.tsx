import { useMemo, type ReactNode } from "react";
import {
    AbilityProvider as CaslAbilityProvider,
    Can,
    useAbility,
} from "@casl/react";
import {
    createAdminAbility,
    resolveAdminProfile,
} from "@admin-shared/ability.js";
import { useAuth } from "@/auth/AuthContext";

export { Can, useAbility };

/** Bridge Auth user → CASL AbilityProvider (@casl/react). */
export function AbilityProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const ability = useMemo(() => {
        const profile =
            user?.profile ??
            resolveAdminProfile(user?.permissions ?? null);
        return createAdminAbility(profile);
    }, [user]);

    return (
        <CaslAbilityProvider value={ability}>{children}</CaslAbilityProvider>
    );
}

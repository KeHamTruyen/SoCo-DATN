import { Outlet } from "react-router-dom";
import { Footer } from "../../shared/ui";

const shellClassName =
    "flex min-h-screen flex-col bg-background-light text-neutral-900 dark:bg-background-dark dark:text-neutral-100";

function AppShellInner({ showFooter }: { showFooter: boolean }) {
    return (
        <div className={shellClassName}>
            <div className="flex min-h-0 flex-1 flex-col">
                <Outlet />
            </div>
            {showFooter ? <Footer /> : null}
        </div>
    );
}

/** Full chrome: sticky footer at viewport bottom when content is short. */
export function AppShellWithFooterLayout() {
    return <AppShellInner showFooter />;
}

/** Header + scrollable main only (e.g. feed, marketplace, infinite scroll). */
export function AppShellHeaderOnlyLayout() {
    return <AppShellInner showFooter={false} />;
}

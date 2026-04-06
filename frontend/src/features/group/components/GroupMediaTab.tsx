import { useGroupContext } from "../context/GroupContext";

export function GroupMediaTab() {
    const { mediaRows, tabLoading } = useGroupContext();

    return (
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            {tabLoading ? (
                <p className="text-sm text-neutral-500">Loading media...</p>
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {mediaRows.flatMap((row) =>
                        row.mediaUrls.map((url) => (
                            <img
                                key={`${row.id}-${url}`}
                                src={url}
                                alt="group media"
                                className="h-32 w-full rounded-lg object-cover"
                            />
                        ))
                    )}
                    {!mediaRows.length && (
                        <p className="col-span-full text-sm text-neutral-500">No media yet.</p>
                    )}
                </div>
            )}
        </div>
    );
}

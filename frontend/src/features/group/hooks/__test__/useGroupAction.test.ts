import { renderHook, act, waitFor } from "@testing-library/react";
import { useState } from "react";
import { useGroupAction } from "../useGroupAction";
import type { Group } from "../../types/group.types";
import { HttpError } from "../../../../shared/api/httpClient";
import { groupApi } from "../../api/groupApi";

vi.mock("../../api/groupApi", () => ({
    groupApi: {
        joinGroup: vi.fn(),
        leaveGroup: vi.fn(),
    },
}));

function makeGroup(overrides: Partial<Group> = {}): Group {
    return {
        id: "g1",
        name: "G",
        privacy: "public",
        membersCount: 5,
        isMember: false,
        ...overrides,
    };
}

function renderWithGroup(initial: Group | null) {
    return renderHook(
        ({ group }: { group: Group | null }) => {
            const [g, setG] = useState<Group | null>(group);
            const actions = useGroupAction("g1", g, setG, {
                isAuthenticated: true,
                onAuthRequired: vi.fn(),
            });
            return { ...actions, group: g, setGroup: setG };
        },
        { initialProps: { group: initial } },
    );
}

describe("useGroupAction", () => {
    beforeEach(() => {
        vi.mocked(groupApi.joinGroup).mockReset();
        vi.mocked(groupApi.leaveGroup).mockReset();
    });

    it("handleJoinGroup updates group when join succeeds", async () => {
        vi.mocked(groupApi.joinGroup).mockResolvedValue({ requested: false } as never);
        const { result } = renderWithGroup(makeGroup({ isMember: false, membersCount: 5 }));

        await act(async () => {
            await result.current.handleJoinGroup();
        });

        await waitFor(() => {
            expect(result.current.group?.isMember).toBe(true);
            expect(result.current.group?.membersCount).toBe(6);
        });
    });

    it("handleJoinGroup calls onAuthRequired when not authenticated", async () => {
        const onAuthRequired = vi.fn();
        const { result } = renderHook(() => {
            const [g, setG] = useState<Group | null>(makeGroup({ isMember: false }));
            return useGroupAction("g1", g, setG, { isAuthenticated: false, onAuthRequired });
        });

        await act(async () => {
            await result.current.handleJoinGroup();
        });

        expect(onAuthRequired).toHaveBeenCalled();
        expect(groupApi.joinGroup).not.toHaveBeenCalled();
    });

    it("handleJoinGroup does nothing when already member", async () => {
        const { result } = renderWithGroup(makeGroup({ isMember: true }));

        await act(async () => {
            await result.current.handleJoinGroup();
        });

        expect(groupApi.joinGroup).not.toHaveBeenCalled();
    });

    it("handleLeaveGroup updates group on success", async () => {
        vi.mocked(groupApi.leaveGroup).mockResolvedValue(undefined as never);
        const { result } = renderWithGroup(makeGroup({ isMember: true, membersCount: 3 }));

        await act(async () => {
            await result.current.handleLeaveGroup();
        });

        await waitFor(() => {
            expect(result.current.group?.isMember).toBe(false);
            expect(result.current.group?.membersCount).toBe(2);
        });
    });

    it("handleLeaveGroup sets HttpError message on failure", async () => {
        vi.mocked(groupApi.leaveGroup).mockRejectedValue(new HttpError("Forbidden", 403));
        const { result } = renderWithGroup(makeGroup({ isMember: true }));

        let ok: boolean | undefined;
        await act(async () => {
            ok = await result.current.handleLeaveGroup();
        });

        expect(ok).toBe(false);
        expect(result.current.leaveError).toBe("Forbidden");
    });

    it("handleLeaveGroup sets generic message on unknown error", async () => {
        vi.mocked(groupApi.leaveGroup).mockRejectedValue(new Error("boom"));
        const { result } = renderWithGroup(makeGroup({ isMember: true }));

        await act(async () => {
            await result.current.handleLeaveGroup();
        });

        expect(result.current.leaveError).toContain("Unable to leave");
    });
});

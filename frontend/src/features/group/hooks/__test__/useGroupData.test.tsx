import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { renderHook, waitFor } from "@testing-library/react";
import { useGroupData } from "../useGroupData";
import type { Group } from "../../types/group.types";

vi.mock("../../api/groupApi", () => ({
    groupApi: {
        getGroup: vi.fn(),
        joinByInvite: vi.fn(),
    },
}));

import { groupApi } from "../../api/groupApi";

let testQueryClient: QueryClient;

function createHarness(initialPath: string) {
    testQueryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    return function Wrapper({ children }: { children: ReactNode }) {
        return createElement(
            QueryClientProvider,
            { client: testQueryClient },
            createElement(MemoryRouter, { initialEntries: [initialPath] }, children),
        );
    };
}

function makeGroup(overrides: Partial<Group> = {}): Group {
    return {
        id: "g1",
        name: "G",
        privacy: "public",
        membersCount: 1,
        isMember: false,
        ...overrides,
    };
}

describe("useGroupData", () => {
    beforeEach(() => {
        vi.mocked(groupApi.getGroup).mockReset();
        vi.mocked(groupApi.joinByInvite).mockReset();
    });

    it("loads group when id is defined", async () => {
        vi.mocked(groupApi.getGroup).mockResolvedValue(makeGroup());
        const { result } = renderHook(() => useGroupData("g1"), {
            wrapper: createHarness("/groups/g1"),
        });

        await waitFor(() => {
            expect(result.current.group?.id).toBe("g1");
            expect(result.current.isLoading).toBe(false);
        });
        expect(groupApi.getGroup).toHaveBeenCalledWith("g1");
    });

    it("setGroup updates query cache", async () => {
        vi.mocked(groupApi.getGroup).mockResolvedValue(makeGroup({ membersCount: 1 }));
        const { result } = renderHook(() => useGroupData("g1"), {
            wrapper: createHarness("/groups/g1"),
        });

        await waitFor(() => expect(result.current.group).not.toBeNull());

        result.current.setGroup((g) => (g ? { ...g, membersCount: 99 } : g));

        await waitFor(() => {
            expect(result.current.group?.membersCount).toBe(99);
        });
    });

    it("joins by invite when invite param present and not member", async () => {
        vi.mocked(groupApi.getGroup).mockResolvedValue(makeGroup({ isMember: false }));
        vi.mocked(groupApi.joinByInvite).mockResolvedValue(undefined as never);

        const { result } = renderHook(() => useGroupData("g1"), {
            wrapper: createHarness("/groups/g1?invite=CODE"),
        });

        await waitFor(() => expect(groupApi.joinByInvite).toHaveBeenCalledWith("CODE"));
        expect(result.current.group).not.toBeNull();
    });

    it("does not call joinByInvite when invite query param is absent", async () => {
        vi.mocked(groupApi.getGroup).mockResolvedValue(makeGroup({ isMember: false }));

        renderHook(() => useGroupData("g1"), {
            wrapper: createHarness("/groups/g1"),
        });

        await waitFor(() => expect(groupApi.getGroup).toHaveBeenCalled());
        expect(groupApi.joinByInvite).not.toHaveBeenCalled();
    });
});

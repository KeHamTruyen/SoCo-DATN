import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useGroupMembers } from "../useGroupMembers";
import type { Group, GroupMemberBrief, GroupJoinRequest, GroupInvite } from "../../types/group.types";

vi.mock("../../api/groupApi", () => ({
    groupApi: {
        getGroupMembers: vi.fn(),
        listJoinRequests: vi.fn(),
        listInvites: vi.fn(),
        getGroupMedia: vi.fn(),
        getGroupProducts: vi.fn(),
        updateMemberRole: vi.fn(),
        removeMember: vi.fn(),
        approveJoinRequest: vi.fn(),
        rejectJoinRequest: vi.fn(),
        createInvite: vi.fn(),
    },
}));

import { groupApi } from "../../api/groupApi";

let testQueryClient: QueryClient;

function createWrapper() {
    testQueryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });
    return function Wrapper({ children }: { children: ReactNode }) {
        return createElement(QueryClientProvider, { client: testQueryClient }, children);
    };
}

const memberA: GroupMemberBrief = {
    id: "m1",
    userId: "u1",
    role: "MEMBER",
    user: { id: "u1", fullName: "A" },
};

function makeGroup(overrides: Partial<Group> = {}): Group {
    return {
        id: "g1",
        name: "G",
        privacy: "public",
        membersCount: 2,
        memberRole: "ADMIN",
        ...overrides,
    };
}

describe("useGroupMembers", () => {
    beforeEach(() => {
        vi.mocked(groupApi.getGroupMembers).mockReset();
        vi.mocked(groupApi.listJoinRequests).mockReset();
        vi.mocked(groupApi.listInvites).mockReset();
        vi.mocked(groupApi.getGroupMedia).mockReset();
        vi.mocked(groupApi.getGroupProducts).mockReset();
        vi.mocked(groupApi.updateMemberRole).mockReset();
        vi.mocked(groupApi.removeMember).mockReset();
        vi.mocked(groupApi.approveJoinRequest).mockReset();
        vi.mocked(groupApi.rejectJoinRequest).mockReset();
        vi.mocked(groupApi.createInvite).mockReset();

        vi.mocked(groupApi.getGroupMembers).mockResolvedValue({ success: true, data: [memberA] });
        vi.mocked(groupApi.listJoinRequests).mockResolvedValue({ success: true, data: [] });
        vi.mocked(groupApi.listInvites).mockResolvedValue([]);
        vi.mocked(groupApi.getGroupMedia).mockResolvedValue({ success: true, data: [] });
        vi.mocked(groupApi.getGroupProducts).mockResolvedValue({ success: true, data: [] });
    });

    it("fetches members when members tab active", async () => {
        const { result } = renderHook(
            () => useGroupMembers("g1", "members", makeGroup({ memberRole: "MEMBER" })),
            { wrapper: createWrapper() },
        );

        await waitFor(() => expect(result.current.members.length).toBeGreaterThan(0));
        expect(groupApi.getGroupMembers).toHaveBeenCalledWith("g1");
    });

    it("handlePromoteDemote calls API and updates cache", async () => {
        vi.mocked(groupApi.updateMemberRole).mockResolvedValue(undefined as never);
        const { result } = renderHook(
            () => useGroupMembers("g1", "members", makeGroup({ memberRole: "ADMIN" })),
            { wrapper: createWrapper() },
        );

        await waitFor(() => expect(result.current.members[0].role).toBe("MEMBER"));

        await act(async () => {
            await result.current.handlePromoteDemote(memberA, "MODERATOR");
        });

        expect(groupApi.updateMemberRole).toHaveBeenCalledWith("g1", "u1", "MODERATOR");
        await waitFor(() => expect(result.current.members.find((m) => m.userId === "u1")?.role).toBe("MODERATOR"));
    });

    it("handleRemoveMember updates cache", async () => {
        vi.mocked(groupApi.removeMember).mockResolvedValue(undefined as never);
        const { result } = renderHook(
            () => useGroupMembers("g1", "members", makeGroup({ memberRole: "ADMIN" })),
            { wrapper: createWrapper() },
        );

        await waitFor(() => expect(result.current.members).toHaveLength(1));

        await act(async () => {
            await result.current.handleRemoveMember(memberA);
        });

        await waitFor(() => expect(result.current.members).toHaveLength(0));
    });

    it("handleReviewRequest removes request from cache on approve", async () => {
        const req: GroupJoinRequest = {
            id: "jr1",
            groupId: "g1",
            userId: "ux",
            status: "PENDING",
            createdAt: "",
            user: { id: "ux", fullName: "X" },
        };
        vi.mocked(groupApi.listJoinRequests).mockResolvedValue({ success: true, data: [req] });
        vi.mocked(groupApi.approveJoinRequest).mockResolvedValue(undefined as never);

        const { result } = renderHook(
            () => useGroupMembers("g1", "members", makeGroup({ memberRole: "ADMIN" })),
            { wrapper: createWrapper() },
        );

        await waitFor(() => expect(result.current.joinRequests).toHaveLength(1));

        await act(async () => {
            await result.current.handleReviewRequest("jr1", "approve");
        });

        await waitFor(() => expect(result.current.joinRequests).toHaveLength(0));
    });

    it("handleCreateInvite prepends invite", async () => {
        const inv: GroupInvite = {
            id: "i1",
            groupId: "g1",
            code: "abc",
            expiresAt: "",
            maxUses: 1,
            usedCount: 0,
            isActive: true,
        };
        vi.mocked(groupApi.createInvite).mockResolvedValue(inv);

        const { result } = renderHook(
            () => useGroupMembers("g1", "members", makeGroup({ memberRole: "ADMIN" })),
            { wrapper: createWrapper() },
        );

        await waitFor(() => expect(groupApi.getGroupMembers).toHaveBeenCalled());

        await act(async () => {
            await result.current.handleCreateInvite();
        });

        await waitFor(() => expect(result.current.invites[0]?.id).toBe("i1"));
    });
});

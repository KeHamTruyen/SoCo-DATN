import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useProfileFollow } from "./useProfileFollow";
import { profileApi } from "../api/profileApi";
import type { PublicUserProfile } from "../types/profile.types";

vi.mock("../api/profileApi", () => ({
    profileApi: {
        followUser: vi.fn(),
        unfollowUser: vi.fn(),
    },
}));

describe("useProfileFollow", () => {
    it("should handle follow properly", async () => {
        vi.mocked(profileApi.followUser).mockResolvedValueOnce({ followed: true });
        let profileState: PublicUserProfile | null = { id: "123", role: "buyer", isFollowing: false, followersCount: 10 } as any;
        const setProfile = vi.fn().mockImplementation((fn) => {
            if (typeof fn === "function") {
                profileState = fn(profileState);
            } else {
                profileState = fn;
            }
        });

        const { result } = renderHook(() => useProfileFollow(profileState, setProfile));

        await act(async () => {
            await result.current.handleFollow();
        });

        expect(profileApi.followUser).toHaveBeenCalledWith("123");
        expect(profileState?.isFollowing).toBe(true);
        expect(profileState?.followersCount).toBe(11); // increments followers
    });

    it("should handle unfollow properly", async () => {
        vi.mocked(profileApi.unfollowUser).mockResolvedValueOnce({ followed: false });
        let profileState: PublicUserProfile | null = { id: "123", role: "buyer", isFollowing: true, followersCount: 10 } as any;
        const setProfile = vi.fn().mockImplementation((fn) => {
            if (typeof fn === "function") {
                profileState = fn(profileState);
            } else {
                profileState = fn;
            }
        });

        const { result } = renderHook(() => useProfileFollow(profileState, setProfile));

        await act(async () => {
            await result.current.handleUnfollow();
        });

        expect(profileApi.unfollowUser).toHaveBeenCalledWith("123");
        expect(profileState?.isFollowing).toBe(false);
        expect(profileState?.followersCount).toBe(9); // decrements followers
    });
});

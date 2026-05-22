import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PostMediaCarousel } from "../PostMediaCarousel";

describe("PostMediaCarousel", () => {
    it("lets users navigate through multiple post images", () => {
        render(
            <PostMediaCarousel
                mediaUrls={["/first.jpg", "/second.jpg", "/third.jpg"]}
                mediaType="IMAGE"
            />,
        );

        expect(screen.getByAltText("Post attachment 1").getAttribute("src")).toBe("/first.jpg");
        expect(screen.getByText("1/3")).toBeTruthy();

        fireEvent.click(screen.getByRole("button", { name: /next media/i }));

        expect(screen.getByAltText("Post attachment 2").getAttribute("src")).toBe("/second.jpg");
        expect(screen.getByText("2/3")).toBeTruthy();

        fireEvent.click(screen.getByRole("button", { name: /previous media/i }));

        expect(screen.getByAltText("Post attachment 1").getAttribute("src")).toBe("/first.jpg");
    });
});

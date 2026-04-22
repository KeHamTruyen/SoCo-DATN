import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface UiSlice {
    guestAuthModal: Record<string, boolean>;
    setGuestAuthModal: (scope: string, open: boolean) => void;
}

interface MessagingSlice {
    dockExpanded: boolean;
    setDockExpanded: (value: boolean) => void;
}

interface ProfileUiSlice {
    profilePostDetailModalId: string | null;
    profileCreatePostModalOpen: boolean;
    setProfilePostDetailModalId: (value: string | null) => void;
    setProfileCreatePostModalOpen: (value: boolean) => void;
}

interface GroupUiSlice {
    groupUpdateModalOpen: boolean;
    groupPostModalOpen: boolean;
    setGroupUpdateModalOpen: (value: boolean) => void;
    setGroupPostModalOpen: (value: boolean) => void;
}

type AppStore = UiSlice & MessagingSlice & ProfileUiSlice & GroupUiSlice;

export const useAppStore = create<AppStore>()(
    devtools(
        persist(
            immer((set) => ({
                guestAuthModal: {},
                setGuestAuthModal(scope, open) {
                    set((state) => {
                        state.guestAuthModal[scope] = open;
                    });
                },
                dockExpanded: false,
                setDockExpanded(value) {
                    set((state) => {
                        state.dockExpanded = value;
                    });
                },
                profilePostDetailModalId: null,
                profileCreatePostModalOpen: false,
                setProfilePostDetailModalId(value) {
                    set((state) => {
                        state.profilePostDetailModalId = value;
                    });
                },
                setProfileCreatePostModalOpen(value) {
                    set((state) => {
                        state.profileCreatePostModalOpen = value;
                    });
                },
                groupUpdateModalOpen: false,
                groupPostModalOpen: false,
                setGroupUpdateModalOpen(value) {
                    set((state) => {
                        state.groupUpdateModalOpen = value;
                    });
                },
                setGroupPostModalOpen(value) {
                    set((state) => {
                        state.groupPostModalOpen = value;
                    });
                },
            })),
            {
                name: "soco-app-store",
                partialize: (state) => ({
                    guestAuthModal: state.guestAuthModal,
                    dockExpanded: state.dockExpanded,
                    profileCreatePostModalOpen: state.profileCreatePostModalOpen,
                    groupUpdateModalOpen: state.groupUpdateModalOpen,
                    groupPostModalOpen: state.groupPostModalOpen,
                }),
            },
        ),
    ),
);

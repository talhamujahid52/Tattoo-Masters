import Button from "@/components/Button";
import BlockUserBottomSheet from "@/components/BottomSheets/BlockUserBottomSheet";
import ImageActionsBottomSheet from "@/components/BottomSheets/ImageActionsBottomSheet";
import RadioButton from "@/components/RadioButton";
import Text from "@/components/Text";
import useSafety from "@/hooks/useSafety";
import BlockedUsers from "@/app/artist/BlockedUsers";
import firestore from "@react-native-firebase/firestore";
import React from "react";
import { Alert, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import renderer, { act } from "react-test-renderer";

jest.mock("@/hooks/useSafety", () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock("react-redux", () => ({ useSelector: jest.fn() }));
jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@/components/Button", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const React = jest.requireActual("react");
    return React.createElement("MockButton", props);
  },
}));
jest.mock("react-native-gradients", () => ({ RadialGradient: () => null }));
jest.mock("@expo/vector-icons", () => ({
  MaterialCommunityIcons: () => null,
}));
jest.mock("@react-native-firebase/firestore", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockedUseSafety = useSafety as jest.Mock;
const mockedUseSelector = useSelector as unknown as jest.Mock;
const mockedFirestore = firestore as unknown as jest.Mock;

describe("safety actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseSelector.mockReturnValue({ uid: "viewer-id" });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("keeps reporting but removes blocking from another user's tattoo", () => {
    const hideImageActionsSheet = jest.fn();
    const showReportSheet = jest.fn();
    let component!: ReturnType<typeof renderer.create>;

    act(() => {
      component = renderer.create(
        <ImageActionsBottomSheet
          hideImageActionsSheet={hideImageActionsSheet}
          showReportSheet={showReportSheet}
          showLoggingInBottomSheet={jest.fn()}
          publicationId="tattoo-id"
        />,
      );
    });

    const serialized = JSON.stringify(component.toJSON());
    expect(serialized).toContain("Report");
    expect(serialized).not.toContain("Block user");

    const reportAction = component.root
      .findAllByType(TouchableOpacity)
      .find((action) =>
        action
          .findAllByType(Text)
          .some((label) => label.props.children === "Report"),
      );
    expect(reportAction).toBeDefined();

    act(() => {
      reportAction?.props.onPress();
    });
    expect(hideImageActionsSheet).toHaveBeenCalledTimes(1);
    expect(showReportSheet).toHaveBeenCalledTimes(1);
    act(() => component.unmount());
  });

  it("shows the updated success copy after blocking", async () => {
    const blockUser = jest.fn().mockResolvedValue({ status: "blocked" });
    const hideBlockSheet = jest.fn();
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
    mockedUseSafety.mockReturnValue({
      blockUser,
      isUserBlocked: jest.fn().mockReturnValue(false),
    });
    let component!: ReturnType<typeof renderer.create>;

    act(() => {
      component = renderer.create(
        <BlockUserBottomSheet
          hideBlockSheet={hideBlockSheet}
          blockedUserId="artist-id"
          blockedUserName="Bimoseg Gusronk"
          sourceType="profile"
          sourceId="artist-id"
        />,
      );
    });

    act(() => {
      component.root.findByType(RadioButton).props.onSelect("harassment");
    });
    await act(async () => {
      await component.root.findByType(Button).props.onPress();
    });

    expect(blockUser).toHaveBeenCalledWith(
      expect.objectContaining({
        blockedUserId: "artist-id",
        reason: "harassment",
      }),
    );
    expect(alertSpy).toHaveBeenCalledWith(
      "User Blocked",
      "This user’s content has been hidden. You can unblock users in your settings.",
      [expect.objectContaining({ text: "OK", onPress: hideBlockSheet })],
    );
    act(() => component.unmount());
  });

  it("shows the user's name and Unblock before Cancel", async () => {
    mockedUseSafety.mockReturnValue({
      blockedUsersById: {
        "artist-id": {
          id: "viewer-id__artist-id",
          blockerId: "viewer-id",
          blockedUserId: "artist-id",
          active: true,
          reason: "harassment",
          sourceType: "profile",
          sourceId: "artist-id",
          blockedUserSnapshot: {
            name: "Bimoseg Gusronk",
            profilePicture: "",
          },
          moderationStatus: "pending",
          developerNotificationStatus: "pending",
        },
      },
      hydrated: true,
      unblockUser: jest.fn(),
    });
    mockedFirestore.mockReturnValue({
      collection: () => ({
        doc: () => ({
          get: jest.fn().mockResolvedValue({
            data: () => ({ name: "Bimoseg Gusronk" }),
          }),
        }),
      }),
    });
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
    let component!: ReturnType<typeof renderer.create>;

    await act(async () => {
      component = renderer.create(<BlockedUsers />);
      await Promise.resolve();
    });

    const unblockAction = component.root
      .findAllByType(TouchableOpacity)
      .find(
        (action) =>
          action.props.accessibilityLabel === "Unblock Bimoseg Gusronk",
      );
    expect(unblockAction).toBeDefined();

    act(() => {
      unblockAction?.props.onPress();
    });

    expect(alertSpy).toHaveBeenCalledTimes(1);
    const [title, body, buttons] = alertSpy.mock.calls[0];
    expect(title).toBe("Unblock User");
    expect(body).toBe(
      "Bimoseg Gusronk’s content will become visible. You will become able to contact this user again.",
    );
    expect(buttons?.map((button) => button.text)).toEqual([
      "Unblock",
      "Cancel",
    ]);
    act(() => component.unmount());
  });
});

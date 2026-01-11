// apps/v2/src/components/Skeleton/Skeleton.spec.tsx

import { render } from "@testing-library/react-native";
import {
  Skeleton,
  SkeletonGroup,
  SkeletonAvatar,
  SkeletonText,
  SkeletonCard,
  SkeletonList,
} from "./Skeleton";

//#region Skeleton Base Tests

describe("<Skeleton />", () => {
  describe("rendering", () => {
    it("renders with default props", () => {
      const { getByTestId } = render(<Skeleton testID="skeleton" />);
      expect(getByTestId("skeleton")).toBeTruthy();
    });

    it("renders with custom width and height", () => {
      const { getByTestId } = render(
        <Skeleton width={100} height={20} testID="skeleton" />,
      );
      const skeleton = getByTestId("skeleton");
      expect(skeleton).toBeTruthy();
    });

    it("renders with percentage width", () => {
      const { getByTestId } = render(
        <Skeleton width="50%" height={16} testID="skeleton" />,
      );
      expect(getByTestId("skeleton")).toBeTruthy();
    });

    it("renders with custom radius", () => {
      const { getByTestId } = render(<Skeleton radius={8} testID="skeleton" />);
      expect(getByTestId("skeleton")).toBeTruthy();
    });
  });

  describe("shapes", () => {
    it("renders text shape", () => {
      const { getByTestId } = render(
        <Skeleton shape="text" testID="skeleton" />,
      );
      expect(getByTestId("skeleton")).toBeTruthy();
    });

    it("renders circle shape", () => {
      const { getByTestId } = render(
        <Skeleton shape="circle" width={40} height={40} testID="skeleton" />,
      );
      expect(getByTestId("skeleton")).toBeTruthy();
    });

    it("renders rect shape", () => {
      const { getByTestId } = render(
        <Skeleton shape="rect" testID="skeleton" />,
      );
      expect(getByTestId("skeleton")).toBeTruthy();
    });
  });

  describe("animation", () => {
    it("renders with animation enabled by default", () => {
      const { getByTestId } = render(<Skeleton testID="skeleton" />);
      expect(getByTestId("skeleton")).toBeTruthy();
    });

    it("renders with animation disabled", () => {
      const { getByTestId } = render(
        <Skeleton disableAnimation testID="skeleton" />,
      );
      expect(getByTestId("skeleton")).toBeTruthy();
    });
  });

  describe("accessibility", () => {
    it("has loading accessibility label", () => {
      const { getByLabelText } = render(<Skeleton testID="skeleton" />);
      expect(getByLabelText("Loading")).toBeTruthy();
    });
  });
});

//#endregion Skeleton Base Tests

//#region SkeletonGroup Tests

describe("<SkeletonGroup />", () => {
  it("renders specified count of skeletons", () => {
    const { getByTestId } = render(<SkeletonGroup count={3} testID="group" />);
    expect(getByTestId("group")).toBeTruthy();
    expect(getByTestId("group-item-0")).toBeTruthy();
    expect(getByTestId("group-item-1")).toBeTruthy();
    expect(getByTestId("group-item-2")).toBeTruthy();
  });

  it("renders with row direction", () => {
    const { getByTestId } = render(
      <SkeletonGroup count={2} direction="row" testID="group" />,
    );
    expect(getByTestId("group")).toBeTruthy();
  });

  it("passes itemProps to children", () => {
    const { getByTestId } = render(
      <SkeletonGroup
        count={1}
        itemProps={{ shape: "circle", width: 32, height: 32 }}
        testID="group"
      />,
    );
    expect(getByTestId("group-item-0")).toBeTruthy();
  });
});

//#endregion SkeletonGroup Tests

//#region SkeletonAvatar Tests

describe("<SkeletonAvatar />", () => {
  it("renders with default size", () => {
    const { getByTestId } = render(<SkeletonAvatar testID="avatar" />);
    expect(getByTestId("avatar")).toBeTruthy();
  });

  it("renders with custom size", () => {
    const { getByTestId } = render(
      <SkeletonAvatar size={64} testID="avatar" />,
    );
    expect(getByTestId("avatar")).toBeTruthy();
  });

  it("renders with animation disabled", () => {
    const { getByTestId } = render(
      <SkeletonAvatar disableAnimation testID="avatar" />,
    );
    expect(getByTestId("avatar")).toBeTruthy();
  });
});

//#endregion SkeletonAvatar Tests

//#region SkeletonText Tests

describe("<SkeletonText />", () => {
  it("renders single line by default", () => {
    const { getByTestId } = render(<SkeletonText testID="text" />);
    expect(getByTestId("text")).toBeTruthy();
    expect(getByTestId("text-line-0")).toBeTruthy();
  });

  it("renders multiple lines", () => {
    const { getByTestId } = render(<SkeletonText lines={3} testID="text" />);
    expect(getByTestId("text-line-0")).toBeTruthy();
    expect(getByTestId("text-line-1")).toBeTruthy();
    expect(getByTestId("text-line-2")).toBeTruthy();
  });

  it("renders with custom line height", () => {
    const { getByTestId } = render(
      <SkeletonText lines={2} lineHeight={20} testID="text" />,
    );
    expect(getByTestId("text")).toBeTruthy();
  });

  it("renders with custom last line width", () => {
    const { getByTestId } = render(
      <SkeletonText lines={2} lastLineWidth={50} testID="text" />,
    );
    expect(getByTestId("text")).toBeTruthy();
  });
});

//#endregion SkeletonText Tests

//#region SkeletonCard Tests

describe("<SkeletonCard />", () => {
  it("renders with avatar and text", () => {
    const { getByTestId } = render(<SkeletonCard testID="card" />);
    expect(getByTestId("card")).toBeTruthy();
    expect(getByTestId("card-avatar")).toBeTruthy();
    expect(getByTestId("card-title")).toBeTruthy();
    expect(getByTestId("card-text")).toBeTruthy();
  });

  it("renders without avatar", () => {
    const { getByTestId, queryByTestId } = render(
      <SkeletonCard showAvatar={false} testID="card" />,
    );
    expect(getByTestId("card")).toBeTruthy();
    expect(queryByTestId("card-avatar")).toBeNull();
  });

  it("renders with custom text lines", () => {
    const { getByTestId } = render(
      <SkeletonCard textLines={3} testID="card" />,
    );
    expect(getByTestId("card-text-line-0")).toBeTruthy();
    expect(getByTestId("card-text-line-1")).toBeTruthy();
    expect(getByTestId("card-text-line-2")).toBeTruthy();
  });
});

//#endregion SkeletonCard Tests

//#region SkeletonList Tests

describe("<SkeletonList />", () => {
  it("renders specified count of cards", () => {
    const { getByTestId } = render(<SkeletonList count={3} testID="list" />);
    expect(getByTestId("list")).toBeTruthy();
    expect(getByTestId("list-item-0")).toBeTruthy();
    expect(getByTestId("list-item-1")).toBeTruthy();
    expect(getByTestId("list-item-2")).toBeTruthy();
  });

  it("renders without avatars", () => {
    const { queryByTestId } = render(
      <SkeletonList count={1} showAvatar={false} testID="list" />,
    );
    expect(queryByTestId("list-item-0-avatar")).toBeNull();
  });

  it("renders with custom gap", () => {
    const { getByTestId } = render(
      <SkeletonList count={2} gap={24} testID="list" />,
    );
    expect(getByTestId("list")).toBeTruthy();
  });
});

//#endregion SkeletonList Tests

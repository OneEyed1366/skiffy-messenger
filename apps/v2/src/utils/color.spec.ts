import {
  getComponents,
  changeOpacity,
  blendColors,
  toRgbValues,
  getContrastingSimpleColor,
} from "./color";

describe("getComponents", () => {
  describe("hex colors", () => {
    it("should parse 6-digit hex color", () => {
      const result = getComponents("#ffffff");
      expect(result).toEqual({ red: 255, green: 255, blue: 255, alpha: 1 });
    });

    it("should parse 6-digit hex without hash", () => {
      const result = getComponents("ff0000");
      expect(result).toEqual({ red: 255, green: 0, blue: 0, alpha: 1 });
    });

    it("should parse 3-digit hex color", () => {
      const result = getComponents("#fff");
      expect(result).toEqual({ red: 255, green: 255, blue: 255, alpha: 1 });
    });

    it("should parse 3-digit hex without hash", () => {
      const result = getComponents("f00");
      expect(result).toEqual({ red: 255, green: 0, blue: 0, alpha: 1 });
    });

    it("should parse mixed case hex", () => {
      const result = getComponents("#AbCdEf");
      expect(result).toEqual({ red: 171, green: 205, blue: 239, alpha: 1 });
    });
  });

  describe("rgb colors", () => {
    it("should parse rgb color", () => {
      const result = getComponents("rgb(255,128,64)");
      expect(result).toEqual({ red: 255, green: 128, blue: 64, alpha: 1 });
    });

    it("should parse rgb with spaces", () => {
      const result = getComponents("rgb(255, 128, 64)");
      expect(result).toEqual({ red: 255, green: 128, blue: 64, alpha: 1 });
    });
  });

  describe("rgba colors", () => {
    it("should parse rgba color", () => {
      const result = getComponents("rgba(255,128,64,0.5)");
      expect(result).toEqual({ red: 255, green: 128, blue: 64, alpha: 0.5 });
    });

    it("should parse rgba with spaces", () => {
      const result = getComponents("rgba(255, 128, 64, 0.5)");
      expect(result).toEqual({ red: 255, green: 128, blue: 64, alpha: 0.5 });
    });
  });
});

describe("changeOpacity", () => {
  it("should change opacity of hex color", () => {
    const result = changeOpacity("#ffffff", 0.5);
    expect(result).toBe("rgba(255,255,255,0.5)");
  });

  it("should multiply existing alpha", () => {
    const result = changeOpacity("rgba(255,255,255,0.8)", 0.5);
    expect(result).toBe("rgba(255,255,255,0.4)");
  });

  it("should handle opacity of 1", () => {
    const result = changeOpacity("#ff0000", 1);
    expect(result).toBe("rgba(255,0,0,1)");
  });

  it("should handle opacity of 0", () => {
    const result = changeOpacity("#ff0000", 0);
    expect(result).toBe("rgba(255,0,0,0)");
  });
});

describe("blendColors", () => {
  it("should blend white and black at 50%", () => {
    const result = blendColors("#ffffff", "#000000", 0.5);
    expect(result).toBe("rgba(127,127,127,1)");
  });

  it("should return foreground at 100% opacity", () => {
    const result = blendColors("#ffffff", "#000000", 1);
    expect(result).toBe("rgba(0,0,0,1)");
  });

  it("should return background at 0% opacity", () => {
    const result = blendColors("#ffffff", "#000000", 0);
    expect(result).toBe("rgba(255,255,255,1)");
  });

  it("should return hex when hex option is true", () => {
    const result = blendColors("#ffffff", "#000000", 0.5, true);
    expect(result).toBe("#7f7f7f");
  });

  it("should blend colors correctly", () => {
    const result = blendColors("#ff0000", "#0000ff", 0.5);
    expect(result).toBe("rgba(127,0,127,1)");
  });
});

describe("toRgbValues", () => {
  it("should convert hex to RGB values string", () => {
    expect(toRgbValues("#ffffff")).toBe("255, 255, 255");
  });

  it("should convert black", () => {
    expect(toRgbValues("#000000")).toBe("0, 0, 0");
  });

  it("should convert red", () => {
    expect(toRgbValues("#ff0000")).toBe("255, 0, 0");
  });

  it("should handle lowercase hex", () => {
    expect(toRgbValues("#abcdef")).toBe("171, 205, 239");
  });
});

describe("getContrastingSimpleColor", () => {
  it("should return black for white background", () => {
    expect(getContrastingSimpleColor("#ffffff")).toBe("#000000");
  });

  it("should return white for black background", () => {
    expect(getContrastingSimpleColor("#000000")).toBe("#FFFFFF");
  });

  it("should return black for light gray", () => {
    expect(getContrastingSimpleColor("#cccccc")).toBe("#000000");
  });

  it("should return white for dark gray", () => {
    expect(getContrastingSimpleColor("#333333")).toBe("#FFFFFF");
  });

  it("should return empty string for invalid hex", () => {
    expect(getContrastingSimpleColor("#fff")).toBe("");
    expect(getContrastingSimpleColor("invalid")).toBe("");
  });

  it("should handle hex without hash", () => {
    expect(getContrastingSimpleColor("ffffff")).toBe("#000000");
  });
});

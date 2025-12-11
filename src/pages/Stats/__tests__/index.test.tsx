import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Stats from "../index";

// Mock the store hooks
vi.mock("../../../store", () => ({
  useUnlockedCharacters: vi.fn(() => ["destined_one", "erlang_shen"]),
  useTotalGold: vi.fn(() => 1000),
  useTotalKills: vi.fn(() => 500),
  useBestSurvivalTime: vi.fn(() => 125),
  useTotalPlayTime: vi.fn(() => 3665),
  useCompletedChapters: vi.fn(() => ["chapter1"]),
}));

describe("Stats Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display correct gold amount", () => {
    render(<Stats onBack={() => {}} />);

    expect(screen.getByText("1000")).toBeInTheDocument();
  });

  it("should display correct total kills", () => {
    render(<Stats onBack={() => {}} />);

    expect(screen.getByText("500")).toBeInTheDocument();
  });

  it("should format survival time correctly (2:05 for 125 seconds)", () => {
    render(<Stats onBack={() => {}} />);

    expect(screen.getByText("02:05")).toBeInTheDocument();
  });

  it("should format total play time correctly (61:05 for 3665 seconds)", () => {
    render(<Stats onBack={() => {}} />);

    expect(screen.getByText("61:05")).toBeInTheDocument();
  });

  it("should display unlocked characters count", () => {
    render(<Stats onBack={() => {}} />);

    // Should show "2/X" where X is total characters
    const unlockedText = screen.getByText(/^2\//);
    expect(unlockedText).toBeInTheDocument();
  });

  it("should display completed chapters count", () => {
    render(<Stats onBack={() => {}} />);

    // Should show "1/X" where X is total maps
    const completedText = screen.getByText(/^1\//);
    expect(completedText).toBeInTheDocument();
  });
});

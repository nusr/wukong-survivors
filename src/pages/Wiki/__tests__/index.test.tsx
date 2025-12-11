import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import Wiki from "../index";

describe("Wiki Component", () => {
  it("should render Wiki page with title", () => {
    render(<Wiki onBack={() => {}} />);

    expect(screen.getByTestId("page-title")).toBeInTheDocument();
    expect(screen.getByTestId("page-title")).toHaveTextContent("Wiki");
  });

  it("should render all Wiki sections", () => {
    render(<Wiki onBack={() => {}} />);

    expect(screen.getByTestId("wiki-maps-section")).toBeInTheDocument();
    expect(screen.getByTestId("wiki-characters-section")).toBeInTheDocument();
    expect(screen.getByTestId("wiki-weapons-section")).toBeInTheDocument();
    expect(screen.getByTestId("wiki-elixirs-section")).toBeInTheDocument();
    expect(screen.getByTestId("wiki-enemies-section")).toBeInTheDocument();
  });

  it("should call onBack when back button is clicked", () => {
    const mockOnBack = vi.fn();
    render(<Wiki onBack={mockOnBack} />);

    const backButton = screen.getByTestId("back-to-home-button");
    backButton.click();

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it("should display content in each section", () => {
    render(<Wiki onBack={() => {}} />);

    expect(
      screen.getByText("Chapter 1 - Lair of Wolves and Tigers"),
    ).toBeInTheDocument();
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CharacterSelect from "../index";
import { CHARACTERS_DATA } from "../../../constant/characters";

const selectCharacterMock = vi.fn();

const mockGetState = vi.fn(() => ({
  selectedCharacterId: "destined_one",
  selectedMapId: "chapter1",
  unlockedCharacterIds: ["destined_one", "erlang_shen"],
  unlockedMapIds: ["chapter1"],
  ownedWeapons: [],
  getSelectCharacter: vi.fn(() => CHARACTERS_DATA["destined_one"]),
  selectCharacter: selectCharacterMock,
  selectMap: vi.fn(),
  getSelectMap: vi.fn(),
  checkUnlocks: vi.fn(),
  addWeapon: vi.fn(),
}));

// Mock the store hooks
vi.mock("../../../store", () => ({
  useUnlockedCharacters: vi.fn(() => ["destined_one", "erlang_shen"]),
  useSelectedCharacter: vi.fn(() => "destined_one"),
  useAppStore: {
    getState: () => mockGetState(),
  },
}));

describe("CharacterSelect Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the character select title", () => {
    render(<CharacterSelect onConfirm={() => {}} onBack={() => {}} />);

    expect(screen.getByTestId("page-title")).toBeInTheDocument();
    expect(screen.getByTestId("page-title")).toHaveTextContent(
      "Select Character",
    );
  });

  it("should render all character cards", () => {
    render(<CharacterSelect onConfirm={() => {}} onBack={() => {}} />);

    Object.keys(CHARACTERS_DATA).forEach((id) => {
      expect(screen.getByTestId(`character-card-${id}`)).toBeInTheDocument();
    });
  });

  it("should render unlocked characters with correct class", () => {
    render(<CharacterSelect onConfirm={() => {}} onBack={() => {}} />);

    const destinedOneCard = screen.getByTestId("character-card-destined_one");
    const erlangShenCard = screen.getByTestId("character-card-erlang_shen");
    const lingxuziCard = screen.getByTestId("character-card-lingxuzi");

    expect(destinedOneCard.className).toContain("unlocked");
    expect(erlangShenCard.className).toContain("unlocked");
    expect(lingxuziCard.className).toContain("locked");
  });

  it("should call selectCharacter when an unlocked character is clicked", async () => {
    render(<CharacterSelect onConfirm={() => {}} onBack={() => {}} />);

    const characterCard = screen.getByTestId("character-card-erlang_shen");
    fireEvent.click(characterCard);

    expect(selectCharacterMock).toHaveBeenCalledWith("erlang_shen");
  });

  it("should not call selectCharacter when a locked character is clicked", async () => {
    render(<CharacterSelect onConfirm={() => {}} onBack={() => {}} />);

    const characterCard = screen.getByTestId("character-card-lingxuzi");
    fireEvent.click(characterCard);

    expect(selectCharacterMock).not.toHaveBeenCalled();
  });

  it("should call onConfirm when confirm button is clicked", async () => {
    const onConfirmMock = vi.fn();
    render(<CharacterSelect onConfirm={onConfirmMock} onBack={() => {}} />);

    const confirmButton = screen.getByTestId("start-button");
    fireEvent.click(confirmButton);

    expect(selectCharacterMock).toHaveBeenCalledWith("destined_one");
    expect(onConfirmMock).toHaveBeenCalled();
  });

  it("should call onBack when back button is clicked", () => {
    const onBackMock = vi.fn();
    render(<CharacterSelect onConfirm={() => {}} onBack={onBackMock} />);

    const backButton = screen.getByTestId("back-to-home-button");
    fireEvent.click(backButton);

    expect(onBackMock).toHaveBeenCalled();
  });

  it("should display character details for selected character", () => {
    render(<CharacterSelect onConfirm={() => {}} onBack={() => {}} />);

    // Check if character details container exists and contains text
    const detailsContainer = screen.getByTestId("character-details");
    expect(detailsContainer).toBeInTheDocument();
    expect(detailsContainer.textContent).not.toBe("");
  });

  it("should apply selected class to currently selected character", () => {
    render(<CharacterSelect onConfirm={() => {}} onBack={() => {}} />);

    const selectedCard = screen.getByTestId("character-card-destined_one");
    expect(selectedCard.className).toContain("selected");
  });
});

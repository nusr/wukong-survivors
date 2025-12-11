import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LanguageSelect from "../index";
import i18n from "../../../i18n";

describe("LanguageSelect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render language selector", () => {
    render(<LanguageSelect />);

    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
  });

  it("should display all supported languages as options", () => {
    render(<LanguageSelect />);

    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("中文")).toBeInTheDocument();
    expect(screen.getByText("日本語")).toBeInTheDocument();
    expect(screen.getByText("Deutsch")).toBeInTheDocument();
    expect(screen.getByText("Español")).toBeInTheDocument();
    expect(screen.getByText("Français")).toBeInTheDocument();
    expect(screen.getByText("繁體中文")).toBeInTheDocument();
  });

  it("should have current language selected", async () => {
    i18n.changeLanguage("zh-CN");

    render(<LanguageSelect />);

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("zh-CN");
  });

  it("should call changeLanguage when selection changes", () => {
    render(<LanguageSelect />);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "ja-JP" } });

    expect(i18n.language).toBe("ja-JP");
  });

  it("should handle language change to different languages", () => {
    render(<LanguageSelect />);

    const select = screen.getByRole("combobox");

    fireEvent.change(select, { target: { value: "de-DE" } });
    expect(i18n.language).toBe("de-DE");

    fireEvent.change(select, { target: { value: "fr-FR" } });
    expect(i18n.language).toBe("fr-FR");

    fireEvent.change(select, { target: { value: "ko-KR" } });
    expect(i18n.language).toBe("ko-KR");
  });

  it("should have correct number of language options", () => {
    render(<LanguageSelect />);

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(10);
  });

  it("should render options with correct values", () => {
    render(<LanguageSelect />);

    const select = screen.getByRole("combobox");
    const options = select.querySelectorAll("option");

    const values = Array.from(options).map((opt) => opt.value);

    expect(values).toContain("en-US");
    expect(values).toContain("zh-CN");
    expect(values).toContain("ja-JP");
    expect(values).toContain("de-DE");
    expect(values).toContain("es-ES");
    expect(values).toContain("fr-FR");
    expect(values).toContain("ko-KR");
    expect(values).toContain("pt-BR");
    expect(values).toContain("ru-RU");
    expect(values).toContain("zh-TW");
  });
});

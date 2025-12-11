import { describe, it, expect, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Toast, toast } from "../index";

describe("Toast Component", () => {
  describe("Toast", () => {
    it("should render with message and type", () => {
      render(<Toast message="Test message" type="info" testId="test-toast" />);

      const toastElement = screen.getByTestId("test-toast");
      expect(toastElement).toBeInTheDocument();
      expect(toastElement).toHaveTextContent("Test message");
    });

    it("should render with error type", () => {
      render(
        <Toast message="Error message" type="error" testId="error-toast" />,
      );

      const toastElement = screen.getByTestId("error-toast");
      expect(toastElement).toBeInTheDocument();
      expect(toastElement).toHaveTextContent("Error message");
    });

    it("should render with success type", () => {
      render(
        <Toast
          message="Success message"
          type="success"
          testId="success-toast"
        />,
      );

      const toastElement = screen.getByTestId("success-toast");
      expect(toastElement).toBeInTheDocument();
      expect(toastElement).toHaveTextContent("Success message");
    });

    it("should render with warning type", () => {
      render(
        <Toast
          message="Warning message"
          type="warning"
          testId="warning-toast"
        />,
      );

      const toastElement = screen.getByTestId("warning-toast");
      expect(toastElement).toBeInTheDocument();
      expect(toastElement).toHaveTextContent("Warning message");
    });
  });

  describe("toast function", () => {
    afterEach(() => {
      // Clean up any remaining toast containers
      document
        .querySelectorAll('[class*="container"]')
        .forEach((el) => el.remove());
    });

    it("should create a close function", () => {
      const close = toast({
        message: "Test toast",
        type: "info",
        testId: "dom-toast",
      });

      expect(typeof close).toBe("function");
    });

    it("should call close without error", () => {
      const close = toast({
        message: "Temporary toast",
        type: "info",
        duration: 2,
        testId: "temp-toast",
      });

      expect(() => close()).not.toThrow();
    });

    it("should handle calling close multiple times", () => {
      const close = toast({
        message: "Double close",
        type: "info",
        testId: "double-close-toast",
      });

      close();
      // Should not throw when calling close again
      expect(() => close()).not.toThrow();
    });

    it("toast.error should return a close function", () => {
      const close = toast.error("Error message");
      expect(typeof close).toBe("function");
      close();
    });

    it("toast.info should return a close function", () => {
      const close = toast.info("Info message");
      expect(typeof close).toBe("function");
      close();
    });

    it("toast.warning should return a close function", () => {
      const close = toast.warning("Warning message");
      expect(typeof close).toBe("function");
      close();
    });

    it("toast.success should return a close function", () => {
      const close = toast.success("Success message");
      expect(typeof close).toBe("function");
      close();
    });

    it("toast.error should accept custom testId", () => {
      const close = toast.error("Error message", "custom-error");
      expect(typeof close).toBe("function");
      close();
    });

    it("should use default duration when not specified", () => {
      const close = toast({
        message: "Default duration",
        type: "info",
        testId: "default-duration-toast",
      });

      expect(typeof close).toBe("function");
      close();
    });
  });
});

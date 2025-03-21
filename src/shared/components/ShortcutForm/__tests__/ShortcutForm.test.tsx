import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ShortcutForm, ShortcutFormValues } from "../ShortcutForm";
import { ActionType } from "@/services/shortcuts/shortcut.model";

const alertMock = vi.fn();
window.alert = alertMock;

const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
const mockOnCancel = vi.fn();
const mockInitialValues: Partial<ShortcutFormValues> = {
  shortcut: "CTRL+ALT+S",
  name: "Test Shortcut",
  description: "Test Description",
  actionType: ActionType.OpenFolder,
  actionParams: {
    path: "/test/path",
    app_name: "",
    script: "",
  },
};

describe("ShortcutForm Component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders with initial values correctly", () => {
    // Given
    render(
      <ShortcutForm
        initialValues={mockInitialValues}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Then
    expect(screen.getByDisplayValue("Test Shortcut")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Description")).toBeInTheDocument();
    expect(screen.getByText("CTRL")).toBeInTheDocument();
    expect(screen.getByText("ALT")).toBeInTheDocument();
    expect(screen.getByText("S")).toBeInTheDocument();
  });

  it("validates empty form on submit", async () => {
    // Given
    render(<ShortcutForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    // When
    const submitButton = screen.getByRole("button", { name: /save shortcut/i });
    fireEvent.click(submitButton);

    // Then
    expect(alertMock).toHaveBeenCalledWith(
      "Please set a shortcut and enter a name"
    );
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("validates required action parameters", async () => {
    // Given
    render(
      <ShortcutForm
        initialValues={{
          shortcut: "CTRL+S",
          name: "Test Shortcut",
          actionType: ActionType.OpenFolder,
          actionParams: {
            path: "", // Empty path should trigger validation error
          },
        }}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // When
    const submitButton = screen.getByRole("button", { name: /save shortcut/i });
    fireEvent.click(submitButton);

    // Then
    expect(alertMock).toHaveBeenCalled();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("clears shortcut when clear button is clicked", () => {
    // Given
    render(
      <ShortcutForm
        initialValues={mockInitialValues}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // When
    const clearButtons = screen.getAllByRole("button", { name: /clear/i });
    const shortcutClearButton = clearButtons[0]; // The first Clear button
    fireEvent.click(shortcutClearButton);

    // Then
    expect(
      screen.getByText(/click here and press keys to set shortcut/i)
    ).toBeInTheDocument();
  });

  it("calls onSubmit with form values when valid", async () => {
    // Given
    render(
      <ShortcutForm
        initialValues={mockInitialValues}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // When
    const submitButton = screen.getByRole("button", { name: /save shortcut/i });
    fireEvent.click(submitButton);

    // Then
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        shortcut: "CTRL+ALT+S",
        name: "Test Shortcut",
        description: "Test Description",
        actionType: ActionType.OpenFolder,
        actionParams: {
          path: "/test/path",
          app_name: "",
          script: "",
        },
      });
    });
  });

  it("calls onCancel when cancel button is clicked", () => {
    // Given
    render(
      <ShortcutForm
        initialValues={mockInitialValues}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // When
    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);

    // Then
    expect(mockOnCancel).toHaveBeenCalled();
  });
});

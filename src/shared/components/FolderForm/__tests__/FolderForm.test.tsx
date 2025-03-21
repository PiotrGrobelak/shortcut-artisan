import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FolderForm } from "../FolderForm";

// Mock the color picker component with a more controlled event that doesn't trigger form submission
vi.mock("react-color", () => ({
  CirclePicker: ({
    onChange,
  }: {
    onChange: (color: { hex: string }) => void;
  }) => (
    <div data-testid="color-picker">
      <button
        type="button" // Explicitly set type="button" to prevent form submission
        onClick={(e) => {
          e.preventDefault(); // Prevent any default behavior
          onChange({ hex: "#ff0000" });
        }}
        data-testid="mock-color-button"
      >
        Change Color
      </button>
    </div>
  ),
}));

describe("FolderForm", () => {
  const defaultProps = {
    initialValues: {
      name: "",
      icon: "",
      color: "#2563eb",
    },
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    isSubmitting: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with default values", () => {
    // Given
    render(<FolderForm {...defaultProps} />);

    // Then
    expect(screen.getByLabelText(/folder name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/icon/i)).toBeInTheDocument();
    expect(screen.getByTestId("color-picker")).toBeInTheDocument();

    const saveButton = screen.getByRole("button", { name: /save folder/i });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).not.toBeDisabled();

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    expect(cancelButton).toBeInTheDocument();
  });

  it("shows initial values when provided", () => {
    // Given
    const initialValues = {
      name: "Test Folder",
      icon: "folder-icon",
      color: "#ff0000",
    };

    // When
    render(<FolderForm {...defaultProps} initialValues={initialValues} />);

    // Then
    expect(screen.getByLabelText(/folder name/i)).toHaveValue("Test Folder");
    expect(screen.getByLabelText(/icon/i)).toHaveValue("folder-icon");
  });

  it("updates form values when user types", () => {
    // Given
    render(<FolderForm {...defaultProps} />);

    // When
    const nameInput = screen.getByLabelText(/folder name/i);
    fireEvent.change(nameInput, { target: { value: "New Folder Name" } });

    const iconInput = screen.getByLabelText(/icon/i);
    fireEvent.change(iconInput, { target: { value: "new-icon" } });

    // Then
    expect(nameInput).toHaveValue("New Folder Name");
    expect(iconInput).toHaveValue("new-icon");
  });

  it("calls onSubmit with form values when submitted", async () => {
    defaultProps.onSubmit.mockClear();

    // Given
    render(<FolderForm {...defaultProps} />);

    // When
    fireEvent.change(screen.getByLabelText(/folder name/i), {
      target: { value: "New Folder" },
    });

    fireEvent.change(screen.getByLabelText(/icon/i), {
      target: { value: "custom-icon" },
    });

    // When
    fireEvent.click(screen.getByTestId("mock-color-button"));

    // Then
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();

    // When
    fireEvent.click(screen.getByRole("button", { name: /save folder/i }));

    // Then
    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        name: "New Folder",
        icon: "custom-icon",
        color: "#ff0000",
      });
    });
  });

  it("calls onCancel when cancel button is clicked", () => {
    // Given
    render(<FolderForm {...defaultProps} />);

    // When
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    // Then
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it("disables submit button when isSubmitting is true", () => {
    // Given
    render(<FolderForm {...defaultProps} isSubmitting={true} />);

    // Then
    const saveButton = screen.getByRole("button", { name: /saving/i });
    expect(saveButton).toBeDisabled();
    expect(saveButton).toHaveTextContent("Saving...");
  });
});

import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateFolderModal } from "../CreateFolderModal";
import { FolderService } from "@/services/shortcuts/folder.service";
import { toast } from "sonner";
import { FolderPayload } from "@/services/shortcuts/folder.model";

// Set up the mock to return a resolved promise with a folder object
const mockFolderResponse = { id: "test-folder-id" };

vi.mock("@/services/shortcuts/folder.service", () => ({
  FolderService: {
    create: vi
      .fn()
      .mockImplementation(() => Promise.resolve(mockFolderResponse)),
  },
}));

vi.mock("@/shared/components/FolderForm/FolderForm", () => ({
  FolderForm: ({
    onSubmit,
    onCancel,
  }: {
    onSubmit: (values: FolderPayload) => void;
    onCancel: () => void;
    initialValues: FolderPayload;
    isSubmitting: boolean;
  }) => (
    <div data-testid="folder-form">
      <button
        onClick={() =>
          onSubmit({
            name: "Test Folder",
            icon: "folder-icon",
            color: "#ff0000",
          })
        }
        data-testid="submit-form"
      >
        Submit Form
      </button>
      <button onClick={onCancel} data-testid="cancel-form">
        Cancel Form
      </button>
    </div>
  ),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("CreateFolderModal", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onFolderCreated: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    // Reset the mock implementation for each test
    (FolderService.create as Mock).mockImplementation(() =>
      Promise.resolve(mockFolderResponse)
    );
  });

  it("renders when open is true", () => {
    // Given
    // Modal is configured to be open

    // When
    render(<CreateFolderModal {...defaultProps} />);

    // Then
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Create New Folder")).toBeInTheDocument();
    expect(screen.getByTestId("folder-form")).toBeInTheDocument();
  });

  it("does not render when open is false", () => {
    // Given
    // Modal is configured to be closed

    // When
    render(<CreateFolderModal {...defaultProps} open={false} />);

    // Then
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls FolderService.create and shows success toast when form is submitted", async () => {
    // Given
    render(<CreateFolderModal {...defaultProps} />);

    // When
    fireEvent.click(screen.getByTestId("submit-form"));

    // Then
    await waitFor(() => {
      // Check that service was called with correct params
      expect(FolderService.create).toHaveBeenCalledWith({
        name: "Test Folder",
        icon: "folder-icon",
        color: "#ff0000",
      });

      // Check toast was called
      expect(toast.success).toHaveBeenCalledWith(
        "Folder created",
        expect.anything()
      );

      // Check that onFolderCreated was called with the new folder id
      expect(defaultProps.onFolderCreated).toHaveBeenCalledWith(
        "test-folder-id"
      );

      // Check that modal was closed
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("shows error toast when folder creation fails", async () => {
    // Given
    (FolderService.create as Mock).mockRejectedValueOnce(
      new Error("Test error")
    );

    render(<CreateFolderModal {...defaultProps} />);

    // When
    fireEvent.click(screen.getByTestId("submit-form"));

    // Then
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Error", expect.anything());
      expect(defaultProps.onFolderCreated).not.toHaveBeenCalled();
      expect(defaultProps.onOpenChange).not.toHaveBeenCalledWith(false);
    });
  });

  it("closes modal when cancel is clicked", () => {
    // Given
    render(<CreateFolderModal {...defaultProps} />);

    // When
    fireEvent.click(screen.getByTestId("cancel-form"));

    // Then
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });
});

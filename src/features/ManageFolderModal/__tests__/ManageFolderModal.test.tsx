import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ManageFolderModal } from "../ManageFolderModal";
import { FolderPayload } from "@/services/shortcuts/folder.model";
import { FolderService } from "@/services/shortcuts/folder.service";

const mockFolderResponse = {
  id: "test-folder-id",
  name: "Test Folder",
  color: "#FF5722",
  icon: "folder",
  shortcut_ids: [],
};

vi.mock("@/services/shortcuts/folder.service", () => {
  return {
    FolderService: {
      create: vi.fn(),
      update: vi.fn(),
    },
  };
});

vi.mock("@/shared/components/FolderForm/FolderForm", () => ({
  FolderForm: ({
    onSubmit,
    onCancel,
  }: {
    onSubmit: (values: FolderPayload) => void;
    onCancel: () => void;
  }) => (
    <div data-testid="folder-form">
      <button
        onClick={() =>
          onSubmit({
            name: "Test Folder",
            icon: "folder",
            color: "#FF5722",
          })
        }
        data-testid="submit-form"
      >
        Submit Form
      </button>
      <button onClick={onCancel} data-testid="cancel-form">
        Cancel
      </button>
    </div>
  ),
}));

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("ManageFolderModal", () => {
  const mockOnFolderCreated = vi.fn();
  const mockOnFolderUpdated = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(FolderService.create).mockResolvedValue(mockFolderResponse);
    vi.mocked(FolderService.update).mockResolvedValue({
      ...mockFolderResponse,
      name: "Updated Folder",
    });
  });

  describe("CREATE variant", () => {
    it("renders dialog content when open", () => {
      // Given
      render(
        <ManageFolderModal
          open={true}
          onOpenChange={mockOnOpenChange}
          variant="CREATE"
          onFolderCreated={mockOnFolderCreated}
        />
      );

      // Then
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Create New Folder")).toBeInTheDocument();
      expect(screen.getByTestId("folder-form")).toBeInTheDocument();
    });

    it("doesn't render dialog when closed", () => {
      // Given
      render(
        <ManageFolderModal
          open={false}
          onOpenChange={mockOnOpenChange}
          variant="CREATE"
          onFolderCreated={mockOnFolderCreated}
        />
      );

      // Then
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("calls onFolderCreated and closes modal after successful creation", async () => {
      // Given
      render(
        <ManageFolderModal
          open={true}
          onOpenChange={mockOnOpenChange}
          variant="CREATE"
          onFolderCreated={mockOnFolderCreated}
        />
      );

      // When
      fireEvent.click(screen.getByTestId("submit-form"));

      // Then
      await waitFor(() => {
        expect(FolderService.create).toHaveBeenCalled();
        expect(mockOnFolderCreated).toHaveBeenCalledWith(mockFolderResponse);
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it("handles form cancellation", () => {
      // Given
      render(
        <ManageFolderModal
          open={true}
          onOpenChange={mockOnOpenChange}
          variant="CREATE"
          onFolderCreated={mockOnFolderCreated}
        />
      );

      // When
      fireEvent.click(screen.getByTestId("cancel-form"));

      // Then
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it("handles errors during folder creation", async () => {
      // Given
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      // Override the default mock to reject for this test
      vi.mocked(FolderService.create).mockRejectedValueOnce(
        new Error("Test error")
      );

      render(
        <ManageFolderModal
          open={true}
          onOpenChange={mockOnOpenChange}
          variant="CREATE"
          onFolderCreated={mockOnFolderCreated}
        />
      );

      // When
      fireEvent.click(screen.getByTestId("submit-form"));

      // Then
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Failed to create folder:",
          expect.any(Error)
        );
        expect(mockOnFolderCreated).not.toHaveBeenCalled();
        expect(mockOnOpenChange).not.toHaveBeenCalledWith(false);
      });

      consoleSpy.mockRestore();
    });
  });

  describe("UPDATE variant", () => {
    const mockFolder = {
      id: "test-folder-id",
      name: "Test Folder",
      color: "#FF5722",
      icon: "folder",
      shortcut_ids: [],
    };

    it("renders dialog content when open with folder data", () => {
      // Given
      render(
        <ManageFolderModal
          open={true}
          onOpenChange={mockOnOpenChange}
          variant="UPDATE"
          folder={mockFolder}
          onFolderUpdated={mockOnFolderUpdated}
        />
      );

      // Then
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Edit Folder")).toBeInTheDocument();
      expect(screen.getByTestId("folder-form")).toBeInTheDocument();
    });

    it("doesn't render when no folder is provided", () => {
      // Given
      const { container } = render(
        <ManageFolderModal
          open={true}
          onOpenChange={mockOnOpenChange}
          variant="UPDATE"
          folder={null}
          onFolderUpdated={mockOnFolderUpdated}
        />
      );

      // Then
      expect(container).toBeEmptyDOMElement();
    });

    it("calls onFolderUpdated and closes modal after successful update", async () => {
      // Given
      render(
        <ManageFolderModal
          open={true}
          onOpenChange={mockOnOpenChange}
          variant="UPDATE"
          folder={mockFolder}
          onFolderUpdated={mockOnFolderUpdated}
        />
      );

      // When
      fireEvent.click(screen.getByTestId("submit-form"));

      // Then
      await waitFor(() => {
        expect(FolderService.update).toHaveBeenCalled();
        expect(mockOnFolderUpdated).toHaveBeenCalledWith({
          ...mockFolderResponse,
          name: "Updated Folder",
        });
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it("handles errors during folder update", async () => {
      // Given
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      // Override the default mock to reject for this test
      vi.mocked(FolderService.update).mockRejectedValueOnce(
        new Error("Test error")
      );

      render(
        <ManageFolderModal
          open={true}
          onOpenChange={mockOnOpenChange}
          variant="UPDATE"
          folder={mockFolder}
          onFolderUpdated={mockOnFolderUpdated}
        />
      );

      // When
      fireEvent.click(screen.getByTestId("submit-form"));

      // Then
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Failed to update folder:",
          expect.any(Error)
        );
        expect(mockOnFolderUpdated).not.toHaveBeenCalled();
        expect(mockOnOpenChange).not.toHaveBeenCalledWith(false);
      });

      consoleSpy.mockRestore();
    });
  });
});

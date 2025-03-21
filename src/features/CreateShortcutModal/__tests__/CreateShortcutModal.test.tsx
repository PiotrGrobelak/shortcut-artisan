import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateNewShortcutModal from "../CreateShortcutModal";
import { ShortcutFormValues } from "@/shared/components/ShortcutForm/ShortcutForm";
import { ActionType } from "@/services/shortcuts/shortcut.model";

// Create a mockResponse with ID that will be returned from the unwrap call
const mockShortcutResponse = { id: "test-id" };

const mockDispatch = vi.fn();
vi.mock("react-redux", async () => {
  const actual = await vi.importActual("react-redux");
  return {
    ...actual,
    useDispatch: () => mockDispatch,
    useSelector: vi.fn().mockImplementation((selector) => {
      // Return whatever state you want to mock here
      const mockState = {
        shortcuts: {
          createLoading: false,
        },
      };
      return selector(mockState);
    }),
  };
});

vi.mock("@/shared/store/slices/shortcutsSlice", () => ({
  createShortcut: (payload: unknown) => ({
    type: "createShortcut",
    payload,
  }),
}));

vi.mock("@/shared/components/ShortcutForm/ShortcutForm", () => ({
  ShortcutForm: ({
    onSubmit,
  }: {
    onSubmit: (values: ShortcutFormValues) => void;
  }) => (
    <div data-testid="shortcut-form">
      <button
        onClick={() =>
          onSubmit({
            shortcut: "CTRL+S",
            name: "Test Shortcut",
            description: "Test Description",
            actionType: ActionType.OpenFolder,
            actionParams: { path: "/test/path" },
          })
        }
        data-testid="submit-form"
      >
        Submit Form
      </button>
    </div>
  ),
}));

describe("CreateNewShortcutModal", () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    // Set up the mock dispatch to return a promise with unwrap method
    mockDispatch.mockReturnValue({
      unwrap: () => Promise.resolve(mockShortcutResponse),
    });
  });

  it("renders with a trigger button", () => {
    // Given
    // A CreateNewShortcutModal component with default trigger

    // When
    render(
      <CreateNewShortcutModal
        folderId="test-folder-id"
        onSuccess={mockOnSuccess}
      />
    );

    // Then
    expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
  });

  it("renders with a custom trigger", () => {
    // Given
    // A CreateNewShortcutModal component with custom trigger

    // When
    render(
      <CreateNewShortcutModal
        folderId="test-folder-id"
        onSuccess={mockOnSuccess}
        trigger={<button>Custom Trigger</button>}
      />
    );

    // Then
    expect(
      screen.getByRole("button", { name: /custom trigger/i })
    ).toBeInTheDocument();
  });

  it("opens the modal when trigger is clicked", () => {
    // Given
    render(
      <CreateNewShortcutModal
        folderId="test-folder-id"
        onSuccess={mockOnSuccess}
      />
    );

    // When
    fireEvent.click(screen.getByRole("button", { name: /create/i }));

    // Then
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Create New Shortcut")).toBeInTheDocument();
  });

  it("submits the form and creates a shortcut", async () => {
    // Given
    render(
      <CreateNewShortcutModal
        folderId="test-folder-id"
        onSuccess={mockOnSuccess}
      />
    );

    // When
    fireEvent.click(screen.getByRole("button", { name: /create/i }));
    fireEvent.click(screen.getByText("Submit Form"));

    // Then
    await waitFor(() => {
      // Check that dispatch was called
      expect(mockDispatch).toHaveBeenCalled();

      // Check that onSuccess was called with the shortcut ID
      expect(mockOnSuccess).toHaveBeenCalledWith("test-id");
    });
  });

  it("handles errors during shortcut creation", async () => {
    // Given
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Set up the mock to reject
    mockDispatch.mockReturnValue({
      unwrap: () => Promise.reject(new Error("Test error")),
    });

    render(
      <CreateNewShortcutModal
        folderId="test-folder-id"
        onSuccess={mockOnSuccess}
      />
    );

    // When
    fireEvent.click(screen.getByRole("button", { name: /create/i }));
    fireEvent.click(screen.getByText("Submit Form"));

    // Then
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to create shortcut:",
        expect.any(Error)
      );
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });
});

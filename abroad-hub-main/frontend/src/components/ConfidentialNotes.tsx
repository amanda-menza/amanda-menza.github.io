import { useState, useEffect } from "react";
import { Tiptap } from "./Tiptap";
import api from "../api";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import logger from "./Logger";
import { AppUser } from "../types/models";
import { getStoredUserData } from "../lib/utils";
import { AlertDialogButton, AlertDialogProps } from "./AlertDialogButton";
import { PencilIcon, Trash2Icon, TrashIcon } from "lucide-react";

interface Note {
  id: number;
  author: AppUser;
  timestamp: string;
  content: string;
}

interface ConfidentialNotesProps {
  applicationId: string;
}

export function ConfidentialNotes({ applicationId }: ConfidentialNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  // Default number of notes to show initially
  const DEFAULT_NOTES_COUNT = 3;

  // Fetch the current user when component mounts
  useEffect(() => {
    const userData = getStoredUserData();
    setCurrentUser(userData);
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await api.get(
        `/api/applications/${applicationId}/notes/`
      );
      setNotes(response.data);
    } catch (error) {
      logger.error("Error fetching notes:", error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [applicationId]);

  const handleSubmitNote = async () => {
    if (!newNote.trim()) return;

    try {
      await api.post(`/api/applications/${applicationId}/notes/`, {
        content: newNote,
      });
      setNewNote("");
      setIsAddingNote(false);
      fetchNotes();
    } catch (error) {
      logger.error("Error submitting note:", error);
    }
  };

  const handleEditNote = async (noteId: number, content: string) => {
    try {
      await api.put(`/api/applications/${applicationId}/notes/${noteId}/`, {
        content,
      });
      setEditingNoteId(null);
      fetchNotes();
    } catch (error) {
      logger.error("Error editing note:", error);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      await api.delete(`/api/applications/${applicationId}/notes/${noteId}/`);
      fetchNotes();
    } catch (error) {
      logger.error("Error deleting note:", error);
    }
  };

  // Function to check if the current user is the author of a note
  const isNoteAuthor = (note: Note) => {
    return currentUser && note.author && currentUser.id === note.author.id;
  };

  // Function to check if the current user is the admin with username "admin"
  const isPrimaryAdmin = () => {
    // The user with username "admin" is the system admin with special permissions
    return currentUser && currentUser.username === "admin";
  };

  // Check if user can delete a note (either the author or primary admin)
  const canDeleteNote = (note: Note) => {
    return isNoteAuthor(note) || isPrimaryAdmin();
  };

  // Get either all notes or just the first 5 depending on state
  const displayedNotes = showAllNotes
    ? notes
    : notes.slice(0, DEFAULT_NOTES_COUNT);
  const hasMoreNotes = notes.length > DEFAULT_NOTES_COUNT;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Confidential Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Existing Notes */}
          {displayedNotes.map((note) => (
            <div
              key={note.id}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">
                  {note.author
                    ? `${note.author.display_name} (${note.author.username})`
                    : "Deleted User"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500" title="Last updated">
                    Updated: {new Date(note.timestamp).toLocaleString()}
                  </span>
                  {isNoteAuthor(note) && (
                    <button
                      onClick={() => setEditingNoteId(note.id)}
                      className="hover:text-blue-600 cursor-pointer"
                      title="Edit"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  )}
                  {canDeleteNote(note) && (
                    <AlertDialogButton
                      alertDialogProps={{
                        triggerElement: (
                          <button className="hover:text-red-600 cursor-pointer">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        ),
                        warningDescription:
                          "This action will delete the confidential note.",
                        clickAction: async () => handleDeleteNote(note.id),
                      }}
                    />
                  )}
                </div>
              </div>
              {editingNoteId === note.id ? (
                <div className="space-y-4">
                  <Tiptap
                    editorContent={note.content}
                    onChange={(content) => setNewNote(content)}
                    isEditing={true}
                  />
                  <div className="flex space-x-2">
                    <Button onClick={() => handleEditNote(note.id, newNote)}>
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingNoteId(null);
                        setNewNote("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="prose max-w-none whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: note.content }}
                />
              )}
            </div>
          ))}

          {/* Show more/less notes button */}
          {hasMoreNotes && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setShowAllNotes(!showAllNotes)}
              >
                {showAllNotes
                  ? "Show Less"
                  : `View All Notes (${notes.length})`}
              </Button>
            </div>
          )}

          {/* Add New Note */}
          {isAddingNote ? (
            <div className="space-y-4">
              <Tiptap
                editorContent={newNote}
                onChange={setNewNote}
                isEditing={true}
              />
              <div className="flex space-x-2">
                <Button onClick={handleSubmitNote}>Save Note</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingNote(false);
                    setNewNote("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setIsAddingNote(true)}>Add Note</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

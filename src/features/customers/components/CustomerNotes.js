"use client";

import { useState } from "react";
import { MessageSquarePlus, Pencil, Save, StickyNote, Trash2, X } from "lucide-react";

import { Alert, Button, Card, CardBody, CardHeader, EmptyState, Modal, Textarea, useToast } from "@/components/ui";

import { useCustomerNotes } from "../hooks/useCustomerNotes";
import { validateNoteContent } from "../services/validators";
import { formatDateTime } from "../utils/format";

/**
 * Notas internas del cliente.
 *
 * Consume:
 *   GET    /customers/{id}/notes
 *   POST   /customers/{id}/notes
 *   PATCH  /customers/{id}/notes/{note_id}
 *   DELETE /customers/{id}/notes/{note_id}
 */
export default function CustomerNotes({ customerId, onChanged }) {
  const toast = useToast();
  const { notes, error, isLoading, isMutating, addNote, updateNote, removeNote } =
    useCustomerNotes(customerId);

  const [content, setContent] = useState("");
  const [formError, setFormError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAdd = async () => {
    const validationError = validateNoteContent(content);

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError(null);

    try {
      const note = await addNote(content.trim());
      setContent("");
      toast.success("Nota agregada.");
      onChanged?.(note);
    } catch (requestError) {
      setFormError(requestError?.message ?? "No pudimos guardar la nota.");
    }
  };

  const handleStartEdit = (note) => {
    setEditingId(note.id);
    setEditingContent(note.content ?? "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingContent("");
  };

  const handleSaveEdit = async () => {
    const validationError = validateNoteContent(editingContent);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      await updateNote(editingId, editingContent.trim());
      handleCancelEdit();
      toast.success("Nota actualizada.");
    } catch (requestError) {
      toast.error(requestError?.message ?? "No pudimos actualizar la nota.");
    }
  };

  const handleDelete = async () => {
    if (!noteToDelete) return;

    setIsDeleting(true);

    try {
      await removeNote(noteToDelete.id);
      setNoteToDelete(null);
      toast.success("Nota eliminada.");
    } catch (requestError) {
      toast.error(requestError?.message ?? "No pudimos eliminar la nota.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader
          title="Notas internas"
          description="Solo visibles para tu equipo. Úsalas para dejar contexto del cliente."
          action={
            <span className="rounded-full bg-[#EDF1F7] px-2.5 py-1 text-[11.5px] font-semibold text-[#475569]">
              {notes.length} {notes.length === 1 ? "nota" : "notas"}
            </span>
          }
        />

        <CardBody className="space-y-5">
          {error ? <Alert variant="error">{error}</Alert> : null}

          {/* Nueva nota */}
          <div className="rounded-2xl border border-[#E6EBF3] bg-[#FBFCFE] p-4">
            <Textarea
              id="customer-note-new"
              name="note"
              label="Añadir nota"
              placeholder="Escribe el contexto que debe recordar el equipo…"
              value={content}
              onChange={(event) => {
                setContent(event.target.value);
                setFormError(null);
              }}
              rows={3}
              maxLength={1000}
              disabled={isMutating}
            />

            {formError ? <Alert variant="error" className="mt-3">{formError}</Alert> : null}

            <div className="mt-3 flex justify-end">
              <Button size="sm" loading={isMutating} onClick={handleAdd}>
                <MessageSquarePlus className="h-3.5 w-3.5" aria-hidden="true" />
                Agregar nota
              </Button>
            </div>
          </div>

          {/* Listado */}
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-[#F1F4F9] p-4">
                  <div className="h-3 w-32 rounded bg-[#EDF1F7]" />
                  <div className="mt-3 h-3 w-full rounded bg-[#EDF1F7]" />
                  <div className="mt-2 h-3 w-2/3 rounded bg-[#EDF1F7]" />
                </div>
              ))}
            </div>
          ) : notes.length === 0 ? (
            <EmptyState
              icon={StickyNote}
              title="Todavía no hay notas"
              description="Añade la primera nota interna para dejar contexto sobre este cliente."
              className="border-none bg-transparent py-8"
            />
          ) : (
            <ul className="space-y-3">
              {notes.map((note) => (
                <li
                  key={note.id}
                  className="rounded-2xl border border-[#F1F4F9] bg-white p-4 transition hover:border-[#E6EBF3]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-semibold text-[#0B1220]">
                        {note.author ?? "Equipo"}
                      </p>
                      <p className="text-[11.5px] text-[#94A3B8]">
                        {formatDateTime(note.created_at)}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(note)}
                        disabled={isMutating}
                        aria-label="Editar nota"
                        className="grid h-8 w-8 place-items-center rounded-lg text-[#94A3B8] transition hover:bg-[#F1F5F9] hover:text-[#475569] disabled:opacity-50"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setNoteToDelete(note)}
                        disabled={isMutating}
                        aria-label="Eliminar nota"
                        className="grid h-8 w-8 place-items-center rounded-lg text-[#94A3B8] transition hover:bg-[#FEF4F4] hover:text-[#B42318] disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {editingId === note.id ? (
                    <div className="mt-3">
                      <Textarea
                        id={`customer-note-${note.id}`}
                        name="content"
                        value={editingContent}
                        onChange={(event) => setEditingContent(event.target.value)}
                        rows={3}
                        maxLength={1000}
                        disabled={isMutating}
                      />

                      <div className="mt-2.5 flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                          <X className="h-3.5 w-3.5" aria-hidden="true" />
                          Cancelar
                        </Button>

                        <Button size="sm" loading={isMutating} onClick={handleSaveEdit}>
                          <Save className="h-3.5 w-3.5" aria-hidden="true" />
                          Guardar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2.5 whitespace-pre-line text-[13px] leading-6 text-[#475569]">
                      {note.content}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Modal
        open={Boolean(noteToDelete)}
        onClose={() => setNoteToDelete(null)}
        title="Eliminar nota"
        description="Esta acción no se puede deshacer."
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setNoteToDelete(null)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="danger" loading={isDeleting} onClick={handleDelete}>
              Eliminar nota
            </Button>
          </>
        }
      >
        <p className="text-[13.5px] leading-6 text-[#475569]">
          ¿Seguro que quieres eliminar esta nota interna del cliente?
        </p>
      </Modal>
    </>
  );
}

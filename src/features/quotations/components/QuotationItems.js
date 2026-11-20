"use client";

import { useState } from "react";
import { Check, ListPlus, Pencil, Plus, Save, Trash2, X } from "lucide-react";

import { Alert, Button, Card, CardBody, CardHeader, Modal, useToast } from "@/components/ui";

import { QUOTATION_TAX_RATES, calculateLineTotal } from "../constants";
import { useQuotationItems } from "../hooks/useQuotationItems";
import { formatAmount } from "../utils/format";

const EMPTY_DRAFT = {
  description: "",
  quantity: 1,
  unit_price: 0,
  discount: 0,
  tax_rate: 18,
};

const inputClass =
  "h-9 w-full rounded-lg border border-[#E2E8F0] bg-white px-2.5 text-[12.5px] text-[#0B1220] outline-none transition focus:border-[#2E6BFF] focus:ring-4 focus:ring-[#2E6BFF]/10 disabled:cursor-not-allowed disabled:bg-[#F3F5F9]";

/** Conversión segura a número (evita NaN en los campos del formulario). */
function safeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Líneas de una cotización existente (lectura + alta/edición/borrado).
 *
 * Consume:
 *   POST   /quotations/{id}/items
 *   PATCH  /quotations/{id}/items/{item_id}
 *   DELETE /quotations/{id}/items/{item_id}
 */
export default function QuotationItems({ quotationId, currency = "USD", onQuotationChange }) {
  const toast = useToast();
  const { items, error, isLoading, isMutating, addItem, updateItem, removeItem } =
    useQuotationItems(quotationId, { onQuotationChange });

  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState(null);
  const [editingDraft, setEditingDraft] = useState(EMPTY_DRAFT);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const updateDraft = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const updateEditingDraft = (field, value) => {
    setEditingDraft((current) => ({ ...current, [field]: value }));
  };

  const handleAdd = async () => {
    if (!draft.description.trim()) {
      toast.error("Describe el concepto de la línea.");
      return;
    }

    const item = await addItem({
      ...draft,
      quantity: safeNumber(draft.quantity),
      unit_price: safeNumber(draft.unit_price),
      discount: safeNumber(draft.discount),
      tax_rate: safeNumber(draft.tax_rate),
    });

    if (item) {
      setDraft(EMPTY_DRAFT);
      setIsAdding(false);
      toast.success("Línea agregada.");
    }
  };

  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditingDraft({
      description: item.description ?? "",
      quantity: item.quantity ?? 1,
      unit_price: item.unit_price ?? 0,
      discount: item.discount ?? 0,
      tax_rate: item.tax_rate ?? 0,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingDraft.description.trim()) {
      toast.error("Describe el concepto de la línea.");
      return;
    }

    const item = await updateItem(editingId, {
      ...editingDraft,
      quantity: safeNumber(editingDraft.quantity),
      unit_price: safeNumber(editingDraft.unit_price),
      discount: safeNumber(editingDraft.discount),
      tax_rate: safeNumber(editingDraft.tax_rate),
    });

    if (item) {
      setEditingId(null);
      toast.success("Línea actualizada.");
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);

    const removed = await removeItem(itemToDelete.id);

    if (removed) {
      setItemToDelete(null);
      toast.success("Línea eliminada.");
    }

    setIsDeleting(false);
  };

  return (
    <>
      <Card>
        <CardHeader
          title="Detalle de la cotización"
          description="Líneas incluidas en la propuesta y sus importes."
          action={
            <Button variant="outline" size="sm" onClick={() => setIsAdding((current) => !current)}>
              {isAdding ? (
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {isAdding ? "Cancelar" : "Añadir línea"}
            </Button>
          }
        />

        <CardBody className="space-y-4">
          {error ? <Alert variant="error">{error}</Alert> : null}

          {isAdding ? (
            <div className="rounded-2xl border border-[#DCE3ED] bg-[#FBFCFE] p-4">
              <p className="text-[12.5px] font-semibold text-[#334155]">Nueva línea</p>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <input
                  type="text"
                  value={draft.description}
                  onChange={(event) => updateDraft("description", event.target.value)}
                  placeholder="Concepto"
                  aria-label="Concepto"
                  disabled={isMutating}
                  className={`${inputClass} sm:col-span-2 lg:col-span-2`}
                />

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={draft.quantity}
                  onChange={(event) => updateDraft("quantity", event.target.value)}
                  aria-label="Cantidad"
                  disabled={isMutating}
                  className={`${inputClass} tabular-nums`}
                />

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={draft.unit_price}
                  onChange={(event) => updateDraft("unit_price", event.target.value)}
                  aria-label="Precio unitario"
                  disabled={isMutating}
                  className={`${inputClass} tabular-nums`}
                />

                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={draft.discount}
                    onChange={(event) => updateDraft("discount", event.target.value)}
                    aria-label="Descuento"
                    disabled={isMutating}
                    className={`${inputClass} tabular-nums`}
                  />

                  <select
                    value={String(draft.tax_rate)}
                    onChange={(event) => updateDraft("tax_rate", event.target.value)}
                    aria-label="Impuesto"
                    disabled={isMutating}
                    className={`${inputClass} appearance-none`}
                  >
                    {QUOTATION_TAX_RATES.map((rate) => (
                      <option key={rate.value} value={rate.value}>
                        {rate.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-3 flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
                  Cancelar
                </Button>

                <Button size="sm" loading={isMutating} onClick={handleAdd}>
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  Agregar línea
                </Button>
              </div>
            </div>
          ) : null}

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-12 rounded-xl bg-[#F7F9FC]" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#DCE3ED] px-6 py-12 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#EFF4FF] text-[#2E6BFF]">
                <ListPlus className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mt-3 text-[14px] font-semibold text-[#0B1220]">Sin líneas</p>
              <p className="mt-1 max-w-sm text-[12.5px] text-[#64748B]">
                Añade los conceptos que quieres cotizar. Los totales se recalculan automáticamente.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[#E6EBF3] bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse">
                  <thead>
                    <tr className="bg-[#FAFBFD] text-left">
                      <th className="px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                        Concepto
                      </th>
                      <th className="px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                        Cant.
                      </th>
                      <th className="px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                        P. unitario
                      </th>
                      <th className="px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                        Desc.
                      </th>
                      <th className="px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                        Imp.
                      </th>
                      <th className="px-4 py-2.5 text-right text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                        Total
                      </th>
                      <th className="w-[76px] px-2 py-2.5" />
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((item) => {
                      const isEditing = editingId === item.id;
                      const line = calculateLineTotal(item);

                      return (
                        <tr key={item.id} className="border-t border-[#F1F4F9] align-middle">
                          <td className="px-4 py-2.5">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editingDraft.description}
                                onChange={(event) =>
                                  updateEditingDraft("description", event.target.value)
                                }
                                aria-label="Concepto"
                                disabled={isMutating}
                                className={inputClass}
                              />
                            ) : (
                              <span className="block max-w-[320px] truncate text-[13px] text-[#0B1220]">
                                {item.description}
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-2.5">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={editingDraft.quantity}
                                onChange={(event) =>
                                  updateEditingDraft("quantity", event.target.value)
                                }
                                aria-label="Cantidad"
                                disabled={isMutating}
                                className={`${inputClass} w-20 tabular-nums`}
                              />
                            ) : (
                              <span className="text-[12.5px] tabular-nums text-[#475569]">
                                {item.quantity}
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-2.5">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={editingDraft.unit_price}
                                onChange={(event) =>
                                  updateEditingDraft("unit_price", event.target.value)
                                }
                                aria-label="Precio unitario"
                                disabled={isMutating}
                                className={`${inputClass} w-28 tabular-nums`}
                              />
                            ) : (
                              <span className="text-[12.5px] tabular-nums text-[#475569]">
                                {formatAmount(item.unit_price)}
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-2.5">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                value={editingDraft.discount}
                                onChange={(event) =>
                                  updateEditingDraft("discount", event.target.value)
                                }
                                aria-label="Descuento"
                                disabled={isMutating}
                                className={`${inputClass} w-20 tabular-nums`}
                              />
                            ) : (
                              <span className="text-[12.5px] tabular-nums text-[#475569]">
                                {item.discount ?? 0}%
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-2.5">
                            {isEditing ? (
                              <select
                                value={String(editingDraft.tax_rate)}
                                onChange={(event) =>
                                  updateEditingDraft("tax_rate", event.target.value)
                                }
                                aria-label="Impuesto"
                                disabled={isMutating}
                                className={`${inputClass} w-28 appearance-none`}
                              >
                                {QUOTATION_TAX_RATES.map((rate) => (
                                  <option key={rate.value} value={rate.value}>
                                    {rate.label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-[12.5px] tabular-nums text-[#475569]">
                                {item.tax_rate ?? 0}%
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-2.5 text-right">
                            <span className="text-[13px] font-semibold tabular-nums text-[#0B1220]">
                              {formatAmount(line.total)} {currency}
                            </span>
                          </td>

                          <td className="px-2 py-2.5">
                            <div className="flex items-center justify-end gap-1">
                              {isEditing ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={handleSaveEdit}
                                    disabled={isMutating}
                                    aria-label="Guardar línea"
                                    className="grid h-8 w-8 place-items-center rounded-lg text-[#2E6BFF] transition hover:bg-[#EFF4FF] disabled:opacity-50"
                                  >
                                    <Save className="h-3.5 w-3.5" aria-hidden="true" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingId(null)}
                                    disabled={isMutating}
                                    aria-label="Cancelar edición"
                                    className="grid h-8 w-8 place-items-center rounded-lg text-[#94A3B8] transition hover:bg-[#F1F5F9] disabled:opacity-50"
                                  >
                                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleStartEdit(item)}
                                    disabled={isMutating}
                                    aria-label="Editar línea"
                                    className="grid h-8 w-8 place-items-center rounded-lg text-[#94A3B8] transition hover:bg-[#F1F5F9] hover:text-[#475569] disabled:opacity-50"
                                  >
                                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setItemToDelete(item)}
                                    disabled={isMutating}
                                    aria-label="Eliminar línea"
                                    className="grid h-8 w-8 place-items-center rounded-lg text-[#94A3B8] transition hover:bg-[#FEF4F4] hover:text-[#B42318] disabled:opacity-50"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <Modal
        open={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        title="Eliminar línea"
        description="Esta acción no se puede deshacer."
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setItemToDelete(null)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="danger" loading={isDeleting} onClick={handleDelete}>
              Eliminar línea
            </Button>
          </>
        }
      >
        <p className="text-[13.5px] leading-6 text-[#475569]">
          ¿Seguro que quieres eliminar{" "}
          <span className="font-semibold text-[#0B1220]">“{itemToDelete?.description}”</span>?
        </p>
      </Modal>
    </>
  );
}

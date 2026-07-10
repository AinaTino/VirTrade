export default function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-panel border border-border-hairline bg-bg-surface p-6">
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        <p className="mt-2 text-sm text-text-secondary">{message}</p>
        <div className="mt-4 flex justify-end gap-3">
          <button className="rounded-panel border px-3 py-1 text-sm text-text-secondary" onClick={onCancel}>Annuler</button>
          <button className="rounded-panel border px-3 py-1 text-sm text-white bg-accent hover:opacity-90" onClick={onConfirm}>Confirmer</button>
        </div>
      </div>
    </div>
  );
}

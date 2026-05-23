interface Props {
  total: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({ total, onConfirm, onCancel }: Props) {
  return (
    <div className="modal show">
      <div className="modal-content">
        <h3>Conferma Ordine</h3>
        <p>Sei sicuro di voler inviare questo ordine? Totale: €{total.toFixed(2)}</p>
        <div className="modal-buttons">
          <button className="btn btn-primary" onClick={onConfirm}>Conferma</button>
          <button className="btn btn-secondary" onClick={onCancel}>Annulla</button>
        </div>
      </div>
    </div>
  );
}
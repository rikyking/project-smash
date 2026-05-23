interface Props {
  title: string;
  text: string;
  onClose: () => void;
}

export default function MessageModal({ title, text, onClose }: Props) {
  return (
    <div className="modal show">
      <div className="modal-content">
        <h3>{title}</h3>
        <p>{text}</p>
        <button className="btn btn-primary" onClick={onClose}>OK</button>
      </div>
    </div>
  );
}
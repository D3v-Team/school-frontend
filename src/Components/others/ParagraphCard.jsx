export default function ParagraphCard({ h1, isActive, onClick }) {
    return (
      <div
        className={`card_parag ${isActive ? "active" : ""}`}
        onClick={onClick}
      >
        <h1>{h1}</h1>
      </div>
    );
  }
  
import EmployeeCard from './EmployeeCard.jsx';

export default function Dashboard({ cards, onSelectEmployee }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 24, perspective: 1200 }}>
      {cards.map(card => (
        <EmployeeCard key={card.id} card={card} onClick={onSelectEmployee ? () => onSelectEmployee(card.id) : undefined} />
      ))}
    </div>
  );
}

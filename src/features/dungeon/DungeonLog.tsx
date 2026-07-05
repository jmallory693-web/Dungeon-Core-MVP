type DungeonLogProps = {
  entries: string[];
};

export function DungeonLog({ entries }: DungeonLogProps) {
  return (
    <section className="dungeon-log">
      <h2>Dungeon Log</h2>
      <ul>
        {entries.length === 0 ? (
          <li className="log-empty">No events yet.</li>
        ) : (
          entries.map((entry, index) => (
            <li key={`${entry}-${index}`}>{entry}</li>
          ))
        )}
      </ul>
    </section>
  );
}

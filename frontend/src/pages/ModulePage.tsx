interface ModulePageProps {
  title: string;
  description: string;
}

export default function ModulePage({
  title,
  description,
}: ModulePageProps) {
  return (
    <div className="content-card">
      <h2>{title}</h2>
      <p style={{ color: "#8490a1", marginTop: 10 }}>
        {description}
      </p>
      <p style={{ marginTop: 25, fontSize: 13 }}>
        This module is ready for development.
      </p>
    </div>
  );
}
import type { ReactNode } from 'react';

interface Props {
  title: string;
  desc?: string;
  source?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, desc, source, actions }: Props) {
  return (
    <div className="pagehead">
      <div>
        <h1>{title}</h1>
        {desc && <p className="desc">{desc}</p>}
        {source && (
          <div className="src-badge">
            <b>Kaynak:</b> {source}
          </div>
        )}
      </div>
      {actions && <div className="actions">{actions}</div>}
    </div>
  );
}

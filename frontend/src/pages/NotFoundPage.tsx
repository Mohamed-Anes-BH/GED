import { ArrowRight } from 'lucide-react';

export function NotFoundPage({ onGoHome }: { onGoHome: () => void }) {
  return (
    <div className="auth-page not-found-page">
      <div className="not-found-card">
        <div className="not-found-code">404</div>
        <h1>Cette page n'existe pas.</h1>
        <p>La page que vous recherchez a peut-être été déplacée ou supprimée.</p>
        <button type="button" className="primary-button" onClick={onGoHome}>
          Retour au tableau de bord <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
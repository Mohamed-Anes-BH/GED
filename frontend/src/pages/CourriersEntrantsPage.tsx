import { useState } from 'react';
import {
  Mail, MailOpen, Clock, CheckCircle, AlertTriangle, Archive,
  Search, SlidersHorizontal, List, LayoutGrid, ChevronDown,
  Eye, Send, FolderOpen, MoreVertical, Plus, X, Paperclip,
  FileText, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Download
} from 'lucide-react';

/* ─── MOCK DATA ──────────────────────────────────────────── */
const kpis = [
  { label: 'Tous les courriers', value: '320', delta: '+5% ce mois', color: '#FACC15', icon: Mail },
  { label: 'Non lus', value: '74', delta: '+12% ce mois', color: '#FF6B00', icon: MailOpen },
  { label: 'En attente', value: '46', delta: '+8% ce mois', color: '#3B82F6', icon: Clock },
  { label: 'Traités', value: '186', delta: '+3% ce mois', color: '#22C55E', icon: CheckCircle },
  { label: 'Archivés', value: '14', delta: '-2% ce mois', color: '#8B5CF6', icon: Archive, trendDown: true },
];

interface Courrier {
  id: string;
  numero: string;
  expediteur: string;
  objet: string;
  dateReception: string;
  priorite: 'Haute' | 'Moyenne' | 'Basse';
  statut: 'Non lu' | 'En attente' | 'Traité';
  pieces: { name: string; type: string; size: string }[];
}

const courriers: Courrier[] = [
  { id: '1', numero: 'CE-2024-0320', expediteur: 'Ministère de l\'Agriculture', objet: 'Demande de rapport annuel sur la production céréalière', dateReception: '15/05/2024 10:45', priorite: 'Haute', statut: 'Non lu', pieces: [{ name: 'Lettre_officielle.pdf', type: 'PDF', size: '2.4 Mo' }, { name: 'Modele_rapport.xlsx', type: 'XLS', size: '1.1 Mo' }] },
  { id: '2', numero: 'CE-2024-0319', expediteur: 'Direction des Finances', objet: 'Budget prévisionnel exercice 2025', dateReception: '14/05/2024 16:22', priorite: 'Moyenne', statut: 'En attente', pieces: [] },
  { id: '3', numero: 'CE-2024-0318', expediteur: 'Office National des Statistiques', objet: 'Données statistiques trimestrielles T1 2024', dateReception: '14/05/2024 09:15', priorite: 'Basse', statut: 'Traité', pieces: [] },
  { id: '4', numero: 'CE-2024-0317', expediteur: 'Chambre d\'Agriculture', objet: 'Invitation réunion comité technique', dateReception: '13/05/2024 14:30', priorite: 'Haute', statut: 'Non lu', pieces: [] },
  { id: '5', numero: 'CE-2024-0316', expediteur: 'Banque Nationale d\'Algérie', objet: 'Relevé de compte Avril 2024', dateReception: '12/05/2024 11:05', priorite: 'Moyenne', statut: 'En attente', pieces: [] },
  { id: '6', numero: 'CE-2024-0315', expediteur: 'Fournisseur AgroTech', objet: 'Proposition commerciale matériel agricole', dateReception: '12/05/2024 08:50', priorite: 'Basse', statut: 'Traité', pieces: [] },
  { id: '7', numero: 'CE-2024-0314', expediteur: 'Ministère du Commerce', objet: 'Réglementation importation des semences', dateReception: '11/05/2024 17:20', priorite: 'Moyenne', statut: 'En attente', pieces: [] },
  { id: '8', numero: 'CE-2024-0313', expediteur: 'Assurance El Amel', objet: 'Attestation d\'assurance année 2024', dateReception: '11/05/2024 10:10', priorite: 'Basse', statut: 'Traité', pieces: [] },
  { id: '9', numero: 'CE-2024-0312', expediteur: 'Inspection Générale', objet: 'Rapport d\'audit interne', dateReception: '10/05/2024 15:40', priorite: 'Haute', statut: 'Non lu', pieces: [] },
  { id: '10', numero: 'CE-2024-0311', expediteur: 'Société Nationale de Transport', objet: 'Contrat de transport marchandises', dateReception: '10/05/2024 09:30', priorite: 'Moyenne', statut: 'En attente', pieces: [] },
];

const prioriteStyles = {
  Haute:   { bg: '#FEF2F2', color: '#EF4444', border: '#FECACA' },
  Moyenne: { bg: '#FFF7ED', color: '#F59E0B', border: '#FED7AA' },
  Basse:   { bg: '#F0FDF4', color: '#22C55E', border: '#BBF7D0' },
};

const statutStyles = {
  'Non lu':     { bg: '#FEF2F2', color: '#EF4444', dot: '#EF4444' },
  'En attente': { bg: '#FFF7ED', color: '#F59E0B', dot: '#F59E0B' },
  'Traité':     { bg: '#F0FDF4', color: '#22C55E', dot: '#22C55E' },
};

/* ─── COMPONENT ──────────────────────────────────────────── */
export function CourriersEntrantsPage({ variant = 1 }: { variant?: 1 | 2 }) {
  const [selectedId, setSelectedId] = useState<string | null>('1');
  const selected = courriers.find(c => c.id === selectedId) ?? null;

  return (
    <div className="ce-page">
      {/* Page Title */}
      <h2 className="ce-page-title">Courriers entrants</h2>

      {/* KPI Row */}
      <div className="ce-kpi-row">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="ce-kpi-card">
              <div className="ce-kpi-icon" style={{ background: `${kpi.color}1A`, color: kpi.color }}>
                <Icon size={22} />
              </div>
              <div className="ce-kpi-info">
                <span className="ce-kpi-label">{kpi.label}</span>
                <strong className="ce-kpi-value">{kpi.value}</strong>
                <span className="ce-kpi-delta" style={{ color: kpi.trendDown ? '#EF4444' : '#22C55E' }}>
                  ↗ {kpi.delta}
                </span>
              </div>
              {/* Mini sparkline */}
              <div className="ce-mini-chart">
                <svg viewBox="0 0 80 24" preserveAspectRatio="none">
                  <path d={kpi.trendDown
                    ? 'M0,4 Q20,20 40,12 T80,20'
                    : 'M0,20 Q20,8 40,14 T80,4'}
                    fill="none" stroke={kpi.color} strokeWidth="2" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters Row */}
      <div className="ce-filters-row">
        <FilterDropdown label="Statut" value="Tous" />
        <FilterDropdown label="Priorité" value="Toutes" />
        <FilterDropdown label="Expéditeur" value="Tous" />
        <FilterDropdown label="Date" value="Choisir une période" />
        <button className="ce-filter-btn"><SlidersHorizontal size={14} /> + Filtres</button>

        <div className="ce-filters-right">
          <button className="ce-view-btn active"><List size={16} /></button>
          <button className="ce-view-btn"><LayoutGrid size={16} /></button>
          <button className="ce-new-courrier-btn">
            <Plus size={16} /> Nouveau courrier <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* Main Content: Table + Detail Panel */}
      <div className="ce-main-content">
        {/* Table */}
        <div className="ce-table-card">
          <table className="ce-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}><input type="checkbox" /></th>
                <th>N° de courrier</th>
                <th>Expéditeur</th>
                <th>Objet</th>
                <th>Date de réception</th>
                <th>Priorité</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courriers.map(c => {
                const ps = prioriteStyles[c.priorite];
                const ss = statutStyles[c.statut];
                return (
                  <tr
                    key={c.id}
                    className={selectedId === c.id ? 'selected' : ''}
                    onClick={() => setSelectedId(c.id)}
                  >
                    <td><input type="checkbox" onClick={e => e.stopPropagation()} /></td>
                    <td><span className="ce-numero">{c.numero}</span></td>
                    <td>{c.expediteur}</td>
                    <td className="ce-objet-cell">{c.objet}</td>
                    <td className="ce-date-cell">{c.dateReception}</td>
                    <td>
                      <span className="ce-badge" style={{ background: ps.bg, color: ps.color, border: `1px solid ${ps.border}` }}>
                        {c.priorite}
                      </span>
                    </td>
                    <td>
                      <span className="ce-statut-badge">
                        <span className="ce-dot" style={{ background: ss.dot }} />
                        {c.statut}
                      </span>
                    </td>
                    <td>
                      <div className="ce-actions">
                        <button title="Voir"><Eye size={15} /></button>
                        <button title="Transférer"><Send size={15} /></button>
                        <button title="Dossier"><FolderOpen size={15} /></button>
                        <button title="Plus"><MoreVertical size={15} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="ce-pagination">
            <span className="ce-pagination-info">Affichage 1 à 10 sur 320 résultats</span>
            <div className="ce-pagination-controls">
              <button className="ce-page-btn"><ChevronsLeft size={14} /></button>
              <button className="ce-page-btn"><ChevronLeft size={14} /></button>
              <button className="ce-page-btn active">1</button>
              <button className="ce-page-btn">2</button>
              <button className="ce-page-btn">3</button>
              <button className="ce-page-btn">4</button>
              <button className="ce-page-btn">5</button>
              <span>…</span>
              <button className="ce-page-btn">32</button>
              <button className="ce-page-btn"><ChevronRight size={14} /></button>
              <button className="ce-page-btn"><ChevronsRight size={14} /></button>
            </div>
            <div className="ce-per-page">
              Lignes par page <select defaultValue="10"><option>5</option><option>10</option><option>25</option><option>50</option></select>
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="ce-detail-panel">
            <div className="ce-detail-header">
              <h3>Détails du courrier</h3>
              <button className="ce-close-btn" onClick={() => setSelectedId(null)}><X size={16} /></button>
            </div>

            <div className="ce-detail-status-row">
              <span className="ce-statut-badge">
                <span className="ce-dot" style={{ background: statutStyles[selected.statut].dot }} />
                {selected.statut}
              </span>
              <span className="ce-badge" style={{
                background: prioriteStyles[selected.priorite].bg,
                color: prioriteStyles[selected.priorite].color,
                border: `1px solid ${prioriteStyles[selected.priorite].border}`
              }}>
                {selected.priorite} priorité
              </span>
            </div>

            <h4 className="ce-detail-numero">{selected.numero}</h4>

            <div className="ce-detail-fields">
              <div className="ce-field"><span>Expéditeur</span><strong>{selected.expediteur}</strong></div>
              <div className="ce-field"><span>Date de réception</span><strong>{selected.dateReception}</strong></div>
              <div className="ce-field"><span>Objet</span><strong>{selected.objet}</strong></div>
            </div>

            {/* Attachments */}
            {selected.pieces.length > 0 && (
              <div className="ce-detail-attachments">
                <div className="ce-attach-title"><Paperclip size={14} /> Pièces jointes ({selected.pieces.length})</div>
                {selected.pieces.map((p, i) => (
                  <div key={i} className="ce-attach-item">
                    <div className={`ce-attach-icon ${p.type.toLowerCase()}`}>
                      {p.type}
                    </div>
                    <div className="ce-attach-info">
                      <span>{p.name}</span>
                      <small>{p.size}</small>
                    </div>
                    <button className="ce-attach-dl"><Download size={14} /></button>
                  </div>
                ))}
              </div>
            )}

            {/* Notes */}
            <div className="ce-detail-notes">
              <strong>Notes</strong>
              <p>Rapport à préparer avant le 30 juin 2024.</p>
            </div>

            {/* History */}
            <div className="ce-detail-history">
              <strong>Historique</strong>
              <div className="ce-history-item">
                <span className="ce-hist-dot red" />
                <div><strong>Reçu par Sofiane Hamidi</strong><small>15/05/2024 10:45</small></div>
              </div>
              <div className="ce-history-item">
                <span className="ce-hist-dot orange" />
                <div><strong>Assigné à Imane B.</strong><small>15/05/2024 11:02</small></div>
              </div>
              <div className="ce-history-item">
                <span className="ce-hist-dot yellow" />
                <div><strong>Marqué comme non lu</strong><small>15/05/2024 11:05</small></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="ce-detail-actions">
              <button className="ce-mark-btn">✓ Marquer comme traité</button>
              <button className="ce-transfer-btn"><Send size={14} /> Transférer</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── SUB-COMPONENTS ──────────────────────────────────── */
function FilterDropdown({ label, value }: { label: string; value: string }) {
  return (
    <div className="ce-filter-dropdown">
      <span className="ce-fd-label">{label}</span>
      <span className="ce-fd-value">{value} <ChevronDown size={12} /></span>
    </div>
  );
}

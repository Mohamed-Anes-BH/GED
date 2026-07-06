import { useState } from 'react';
import {
  UploadCloud, X, HelpCircle, Lock, Monitor,
  FolderTree, Building, Map, Box, MapPin, Search, PlusCircle, Check, Scan
} from 'lucide-react';
import '../styles/upload.css';

/* ─── COMPONENT ──────────────────────────────────────────── */
export function NouveauDocumentPage({ variant = 1 }: { variant?: 1 | 2 }) {
  return (
    <div className="nd-page">
      {/* Header */}
      <div className="nd-header">
        <h2 className="nd-page-title">Nouveau document</h2>
        <p className="nd-page-subtitle">Créez et classez un nouveau document dans la GED.</p>
        <div className="nd-top-right">
          <span className="nd-bc-item">Documents</span> <span>›</span>
          <span className="nd-bc-active">Nouveau document</span>
        </div>
      </div>

      <div className="nd-main-layout">
        
        {/* Left Column (Forms) */}
        <div className="nd-left-col">
          
          <div className="nd-row-2">
            
            {/* 1. Informations générales */}
            <div className="nd-card">
              <div className="nd-card-header">
                <div className="nd-step-badge">1</div>
                <h3>Informations générales</h3>
              </div>
              <div className="nd-form-group-row">
                <div className="nd-form-field">
                  <label>Nom du document <span className="nd-req">*</span></label>
                  <input type="text" placeholder="Saisir le nom du document" />
                </div>
                <div className="nd-form-field">
                  <label>Code document</label>
                  <div className="nd-input-icon-right">
                    <input type="text" placeholder="Auto-généré" disabled />
                    <Lock size={14} className="nd-icon-muted" />
                  </div>
                </div>
              </div>
              <div className="nd-form-field">
                <label>Description</label>
                <textarea placeholder="Décrivez brièvement le contenu du document..." rows={2}></textarea>
              </div>
              <div className="nd-form-group-row">
                <div className="nd-form-field">
                  <label>Catégorie <span className="nd-req">*</span></label>
                  <select><option>Sélectionner</option></select>
                </div>
                <div className="nd-form-field">
                  <label>Type de document <span className="nd-req">*</span></label>
                  <select><option>Sélectionner</option></select>
                </div>
                <div className="nd-form-field">
                  <label>Statut <span className="nd-req">*</span></label>
                  <select defaultValue="Actif">
                    <option value="Actif">Actif</option>
                  </select>
                  <span className="nd-status-dot"></span>
                </div>
              </div>
            </div>

            {/* 2. Classification */}
            <div className="nd-card">
              <div className="nd-card-header">
                <div className="nd-step-badge">2</div>
                <h3>Classification</h3>
              </div>
              <div className="nd-form-group-row cols-3">
                <div className="nd-form-field">
                  <label>Direction <span className="nd-req">*</span></label>
                  <select><option>Sélectionner la direction</option></select>
                </div>
                <div className="nd-form-field">
                  <label>Département <span className="nd-req">*</span></label>
                  <select><option>Sélectionner le département</option></select>
                </div>
                <div className="nd-form-field">
                  <label>Service <span className="nd-req">*</span></label>
                  <select><option>Sélectionner le service</option></select>
                </div>
              </div>
              <div className="nd-form-group-row mt-col">
                <div className="nd-form-field">
                  <label>Dossier <span className="nd-req">*</span></label>
                  <select><option>Sélectionner le dossier</option></select>
                </div>
                <div className="nd-form-field">
                  <label>Sous-dossier</label>
                  <select><option>Sélectionner le sous-dossier</option></select>
                </div>
              </div>
            </div>

          </div>

          <div className="nd-row-2">
            
            {/* 3. Upload du document */}
            <div className="nd-card">
              <div className="nd-card-header">
                <div className="nd-step-badge">3</div>
                <h3>Upload du document</h3>
              </div>
              <div className="nd-upload-flex">
                <div className="nd-dropzone">
                  <UploadCloud size={32} className="nd-upload-icon" />
                  <p>Glissez-déposez votre fichier ici<br/><span>ou</span></p>
                  <button className="nd-btn-outline">Choisir un fichier</button>
                </div>
                <div className="nd-preview-col">
                  <span className="nd-preview-label">Aperçu</span>
                  <div className="nd-doc-preview-mock">
                    <div className="nd-mock-lines"></div>
                  </div>
                  <span className="nd-preview-size">PDF • 2.4 Mo</span>
                </div>
              </div>
              
              {/* Progress bar mock */}
              <div className="nd-upload-progress">
                <div className="nd-up-file-icon">PDF</div>
                <div className="nd-up-info">
                  <div className="nd-up-title-row">
                    <span>Rapport_prestation_2024.pdf</span>
                    <button><X size={12} /></button>
                  </div>
                  <span className="nd-up-size">2.4 Mo</span>
                  <div className="nd-progress-bar-container">
                    <div className="nd-progress-fill" style={{ width: '85%' }}></div>
                    <span className="nd-progress-text">85%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Métadonnées */}
            <div className="nd-card">
              <div className="nd-card-header">
                <div className="nd-step-badge">4</div>
                <h3>Métadonnées</h3>
              </div>
              <div className="nd-form-group-row">
                <div className="nd-form-field">
                  <label>Auteur <span className="nd-req">*</span></label>
                  <input type="text" defaultValue="Sofiane Hamidi" />
                </div>
                <div className="nd-form-field">
                  <label>Responsable <span className="nd-req">*</span></label>
                  <input type="text" defaultValue="Yacine M." />
                </div>
                <div className="nd-form-field">
                  <label>Date du document <span className="nd-req">*</span></label>
                  <input type="date" defaultValue="2024-05-15" />
                </div>
                <div className="nd-form-field">
                  <label>Date de création <span className="nd-req">*</span></label>
                  <input type="date" defaultValue="2024-05-15" disabled />
                </div>
              </div>
              
              <div className="nd-form-group-row cols-3">
                <div className="nd-form-field">
                  <label>Confidentialité <span className="nd-req">*</span></label>
                  <select defaultValue="Interne">
                    <option value="Interne">Interne</option>
                  </select>
                </div>
                <div className="nd-form-field">
                  <label>Version</label>
                  <input type="text" defaultValue="1.0" />
                </div>
                <div className="nd-form-field checkbox-field">
                  <label>Version finale</label>
                  <div className="nd-cb-wrap">
                    <input type="checkbox" defaultChecked />
                    <HelpCircle size={14} className="nd-icon-muted" />
                  </div>
                </div>
              </div>
              
              <div className="nd-form-field">
                <label>Mots-clés (Tags)</label>
                <input type="text" placeholder="Ajouter un tag et appuyer sur Entrée..." className="nd-tag-input" />
                <div className="nd-tags-list">
                  <span className="nd-tag">rapport <X size={10}/></span>
                  <span className="nd-tag">production <X size={10}/></span>
                  <span className="nd-tag">céréalière <X size={10}/></span>
                  <span className="nd-tag">annuel <X size={10}/></span>
                </div>
              </div>
            </div>

          </div>

          {/* 5. Emplacement physique */}
          <div className="nd-card">
            <div className="nd-card-header">
              <div className="nd-step-badge">5</div>
              <h3>Emplacement physique <span className="nd-subtitle">(Original papier)</span></h3>
              <HelpCircle size={14} className="nd-icon-muted ml-2" />
            </div>
            
            <div className="nd-emp-layout">
              <div className="nd-emp-form">
                <div className="nd-form-group-row cols-3">
                  <div className="nd-form-field">
                    <label>Site <span className="nd-req">*</span></label>
                    <select><option>Administration centrale</option></select>
                  </div>
                  <div className="nd-form-field">
                    <label>Bâtiment <span className="nd-req">*</span></label>
                    <select><option>Bâtiment A</option></select>
                  </div>
                  <div className="nd-form-field">
                    <label>Bureau <span className="nd-req">*</span></label>
                    <select><option>Bureau Juridique</option></select>
                  </div>
                </div>
                <div className="nd-form-group-row cols-3 mt-col">
                  <div className="nd-form-field">
                    <label>Rayon <span className="nd-req">*</span></label>
                    <select><option>Rayon 2</option></select>
                  </div>
                  <div className="nd-form-field">
                    <label>Étagère <span className="nd-req">*</span></label>
                    <select><option>Étagère 1</option></select>
                  </div>
                  <div className="nd-form-field">
                    <label>Boîte <span className="nd-req">*</span></label>
                    <select><option>Boîte B-025</option></select>
                  </div>
                </div>
                <div className="nd-form-field mt-col" style={{ width: '32%' }}>
                  <label>Numéro dans la boîte <span className="nd-req">*</span></label>
                  <input type="text" defaultValue="18" />
                </div>
              </div>
              
              <div className="nd-emp-diagram">
                <span className="nd-emp-diag-title">Chemin d'emplacement</span>
                <div className="nd-emp-path">
                  <div className="nd-emp-node"><Building size={20}/><span>Administration<br/>centrale</span></div>
                  <span className="nd-emp-arrow">→</span>
                  <div className="nd-emp-node"><Map size={20}/><span>Bâtiment A</span></div>
                  <span className="nd-emp-arrow">→</span>
                  <div className="nd-emp-node"><Monitor size={20}/><span>Bureau<br/>Juridique</span></div>
                  <span className="nd-emp-arrow">→</span>
                  <div className="nd-emp-node"><FolderTree size={20}/><span>Rayon 2</span></div>
                  <span className="nd-emp-arrow">→</span>
                  <div className="nd-emp-node"><Box size={20}/><span>Étagère 1</span></div>
                  <span className="nd-emp-arrow">→</span>
                  <div className="nd-emp-node"><Box size={20}/><span>Boîte B-025</span></div>
                  <span className="nd-emp-arrow">→</span>
                  <div className="nd-emp-node active"><MapPin size={20}/><span>N°18</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="nd-row-4">
            {/* 6. Archivage */}
            <div className="nd-card">
              <div className="nd-card-header">
                <div className="nd-step-badge">6</div>
                <h3>Archivage</h3>
              </div>
              <div className="nd-radio-group">
                <label className="nd-radio"><input type="radio" name="arch" defaultChecked /> Document Actif</label>
                <label className="nd-radio"><input type="radio" name="arch" /> Document Mort (Archive physique)</label>
              </div>
              <div className="nd-form-field mt-col">
                <label>Date d'archivage</label>
                <input type="date" disabled />
              </div>
            </div>

            {/* 7. OCR */}
            <div className="nd-card">
              <div className="nd-card-header">
                <div className="nd-step-badge">7</div>
                <h3>OCR</h3>
              </div>
              <div className="nd-ocr-box">
                <Scan size={24} className="nd-icon-warning" />
                <span>Si le document est scanné</span>
                <label className="nd-cb-label mt-2"><input type="checkbox" /> Appliquer OCR après enregistrement</label>
              </div>
            </div>

            {/* 8. Workflow */}
            <div className="nd-card">
              <div className="nd-card-header">
                <div className="nd-step-badge">8</div>
                <h3>Workflow</h3>
              </div>
              <div className="nd-form-field">
                <label>Responsable validation <span className="nd-req">*</span></label>
                <select><option>Sélectionner</option></select>
              </div>
              <div className="nd-form-field mt-col">
                <label>Circuit d'approbation <span className="nd-req">*</span></label>
                <select><option>Sélectionner le circuit</option></select>
              </div>
            </div>

            {/* 9. Diffusion */}
            <div className="nd-card">
              <div className="nd-card-header">
                <div className="nd-step-badge">9</div>
                <h3>Diffusion</h3>
              </div>
              <div className="nd-form-field">
                <label>Utilisateurs destinataires</label>
                <input type="text" placeholder="Sélectionner des utilisateurs" />
              </div>
              <div className="nd-form-field mt-col">
                <label>Groupes / Départements</label>
                <input type="text" placeholder="Sélectionner des groupes" />
              </div>
            </div>

          </div>

        </div>

        {/* Right Column (Sidebar Summary) */}
        <div className="nd-right-col">
          
          <div className="nd-graphic-box">
            {/* Graphic Mockup representing the folder graphic */}
            <div className="nd-graphic-art">
              <div className="nd-art-folder">
                 <div className="nd-art-doc">📄</div>
                 <div className="nd-art-plus">+</div>
              </div>
            </div>
          </div>

          <div className="nd-side-card">
            <h3>Résumé du document</h3>
            <div className="nd-summary-list">
              <div className="nd-sum-item">
                <span>Nom</span>
                <strong>Rapport_prestation_2024.pdf</strong>
              </div>
              <div className="nd-sum-item">
                <span>Catégorie</span>
                <strong>Rapports</strong>
              </div>
              <div className="nd-sum-item">
                <span>Type</span>
                <strong>Rapport annuel</strong>
              </div>
              <div className="nd-sum-item">
                <span>Statut</span>
                <strong><span className="nd-dot-green"></span> Actif</strong>
              </div>
              
              <div className="nd-sum-item vertical">
                <span>Emplacement :</span>
                <p>Administration centrale › Bâtiment A ›<br/>
                Bureau Juridique › Rayon 2 ›<br/>
                Étagère 1 › Boîte B-025 › N°18</p>
              </div>
            </div>
          </div>

          <div className="nd-info-box">
            <span className="nd-info-icon">💡</span>
            <p>Les champs marqués d'un <span className="nd-req">*</span><br/>sont obligatoires.</p>
          </div>

        </div>

      </div>
      
      {/* Footer Action Bar */}
      <div className="nd-action-bar">
        <button className="nd-btn-ghost">Annuler</button>
        <div className="nd-action-right">
          <button className="nd-btn-outline-orange">Enregistrer</button>
          <button className="nd-btn-outline-orange"><PlusCircle size={16}/> Enregistrer et nouveau</button>
          <button className="nd-btn-primary"><Check size={16}/> Enregistrer et fermer</button>
        </div>
      </div>
      
    </div>
  );
}
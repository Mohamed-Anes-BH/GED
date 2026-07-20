import { useState, useRef, useEffect } from 'react';
import {
  UploadCloud, X, HelpCircle, Lock, Monitor,
  FolderTree, Building, Map, Box, MapPin, Search, PlusCircle, Check, Scan, Loader2
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOrganizationCrud } from '../hooks/useOrganization';
import { useDependentDropdowns } from '../hooks/useDependentDropdowns';
import { 
  categoriesService, directionsService, departementsService, servicesService 
} from '../services/organization';
import { useDossiers } from '../hooks/useDossiers';
import { documentsService } from '../services/documents';
import { courriersService } from '../services/courriers';
import {
  DOCUMENT_STATUSES, DOCUMENT_CATEGORIES, DOSSIERS_STATIC, DOCUMENT_TAGS,
  DIRECTIONS_STATIC, DEPARTEMENTS_BY_DIR, SERVICES_BY_DEPT, DeptKey, SvcKey,
  SITES, BATIMENTS, BUREAUX,
  PHYSICAL_BUILDINGS, PHYSICAL_OFFICES, PHYSICAL_TREASURIES, PHYSICAL_SHELVES,
} from '../constants/dropdowns';
import '../styles/upload.css';

export function NouveauDocumentPage({ variant = 1 }: { variant?: 1 | 2 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<number | ''>('');
  const [status, setStatus] = useState('actif');
  
  // Courrier extra states
  const [sender, setSender] = useState('');
  const [expNum, setExpNum] = useState('');
  const [expDate, setExpDate] = useState('');
  const [arrivalDate, setArrivalDate] = useState(new Date().toISOString().split('T')[0]);
  const [regNum, setRegNum] = useState('');
  const [recipient, setRecipient] = useState('');
  
  // Tags
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };
  const removeTag = (t: string) => setTags(tags.filter(x => x !== t));
  
  // File
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Organization (API-driven with static fallback)
  const [direction, setDirection] = useState<number | ''>('');
  const [departement, setDepartement] = useState<number | ''>('');
  const [service, setService] = useState<number | ''>('');
  const [dossier, setDossier] = useState<number | ''>('');
  // static dependent selects
  const [staticDirKey, setStaticDirKey] = useState<DeptKey | ''>('');
  const [staticDeptKey, setStaticDeptKey] = useState<SvcKey | ''>('');
  const staticDepts = staticDirKey ? DEPARTEMENTS_BY_DIR[staticDirKey] ?? [] : [];
  const staticSvcs  = staticDeptKey ? SERVICES_BY_DEPT[staticDeptKey as SvcKey] ?? [] : [];

  // Physical Location
  const [physSite, setPhysSite]           = useState('Siège');
  const [physBuilding, setPhysBuilding]   = useState('');
  const [physOffice, setPhysOffice]       = useState('');
  const [physTreasury, setPhysTreasury]   = useState('');
  const [physShelf, setPhysShelf]         = useState('');

  // Loads
  const { items: categories } = useOrganizationCrud(categoriesService);
  const {
    directions,
    departements,
    services,
    fetchDepartements,
    fetchServices,
  } = useDependentDropdowns();
  const { dossiers } = useDossiers();

  const selectedCategoryCode = categories.find((c: any) => c.id === category)?.code;

  // Handle URL preselection
  useEffect(() => {
    const preselectedType = new URLSearchParams(location.search).get('type');
    if (categories.length > 0 && preselectedType) {
      const cat = categories.find((c: any) => c.code === `COURRIER_${preselectedType.toUpperCase()}`);
      if (cat) setCategory(cat.id);
    }
  }, [categories, location.search]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!title) setTitle(selectedFile.name.split('.')[0]);
      setUploadProgress(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      if (!title) setTitle(droppedFile.name.split('.')[0]);
      setUploadProgress(null);
    }
  };

  const clearFile = () => {
    setFile(null);
    setUploadProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (redirectOrNew: 'redirect' | 'new') => {
    setFormError(null);

    // 1. Check Courrier Entrant Case
    if (selectedCategoryCode === 'COURRIER_ENTRANT') {
      if (!title || !category || !file || !sender) {
        setFormError("Veuillez remplir les champs obligatoires (Objet/Nom, Catégorie, Fichier et Expéditeur).");
        return;
      }
      setLoading(true);
      try {
        const payload = {
          objet: title,
          notes: description || null,
          expediteur: sender,
          date_reception: arrivalDate || new Date().toISOString().split('T')[0],
          numero_expedition: expNum || null,
          date_expedition: expDate || null,
          numero_enregistrement: regNum || null,
          statut: 'nouveau',
          direction: direction || null,
          departement: departement || null,
          service: service || null,
          tags: tags // Note: MVP representation
        };
        const created = await courriersService.createEntrant(payload);
        if (file) {
          setUploadProgress(0);
          await courriersService.uploadEntrantAttachment(created.id, file, (pct) => {
            setUploadProgress(pct);
          });
        }
        alert('Courrier entrant créé avec succès !');
        navigate('/courriers-entrants');
        return;
      } catch (err: any) {
        console.error(err);
        const errorDetail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
        setFormError('Erreur lors de la création du courrier entrant : ' + errorDetail);
        return;
      } finally {
        setLoading(false);
      }
    }

    // 2. Check Courrier Sortant Case
    if (selectedCategoryCode === 'COURRIER_SORTANT') {
      if (!title || !category || !file || !recipient) {
        setFormError("Veuillez remplir les champs obligatoires (Objet/Nom, Catégorie, Fichier et Destinataire).");
        return;
      }
      setLoading(true);
      try {
        const payload = {
          objet: title,
          notes: description || null,
          destinataire: recipient,
          numero_expedition: expNum || null,
          date_expedition: expDate || null,
          statut: 'brouillon',
          direction: direction || null,
          departement: departement || null,
          service: service || null,
          tags: tags // Note: MVP representation
        };
        const created = await courriersService.createSortant(payload);
        if (file) {
          setUploadProgress(0);
          await courriersService.uploadSortantAttachment(created.id, file, (pct) => {
            setUploadProgress(pct);
          });
        }
        alert('Courrier sortant créé avec succès !');
        navigate('/courriers-sortants');
        return;
      } catch (err: any) {
        console.error(err);
        const errorDetail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
        setFormError('Erreur lors de la création du courrier sortant : ' + errorDetail);
        return;
      } finally {
        setLoading(false);
      }
    }

    // 3. Normal Document Case
    if (!title || !category || !file) {
      setFormError('Veuillez remplir les champs obligatoires (Nom, Catégorie et Fichier).');
      return;
    }
    
    setLoading(true);
    try {
      // 1. Create document
      const doc = await documentsService.createDocument({
        title,
        description,
        category,
        direction: direction || null,
        departement: departement || null,
        service: service || null,
        dossier: dossier || null,
        status,
        tags: tags, // Note: MVP representation
        ...(physSite || physBuilding || physOffice || physTreasury || physShelf ? {
          physical_location_input: {
            site:      physSite      || 'Siège',
            building:  physBuilding  || null,
            office:    physOffice    || null,
            treasury:  physTreasury  || null,
            shelf:     physShelf     || null,
          }
        } : {})
      });

      // 2. Upload file
      setUploadProgress(0);
      await documentsService.uploadFile(doc.id, file, (pct) => {
        setUploadProgress(pct);
      });

      if (redirectOrNew === 'redirect') {
        navigate('/documents');
      } else {
        // new
        setTitle('');
        setDescription('');
        setFile(null);
        setUploadProgress(null);
        setTags([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
        alert('Document enregistré avec succès ! Vous pouvez en créer un autre.');
      }
    } catch (err: any) {
      console.error(err);
      const errorDetail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      setFormError('Erreur lors de la création du document : ' + errorDetail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nd-page">
      <div className="nd-header">
        <h2 className="nd-page-title">Nouveau document</h2>
        <p className="nd-page-subtitle">Créez et classez un nouveau document dans la GED.</p>
        <div className="nd-top-right">
          <span className="nd-bc-item">Documents</span> <span>›</span>
          <span className="nd-bc-active">Nouveau document</span>
        </div>
      </div>

      <div className="nd-main-layout">
        
        <div className="nd-left-col">
          
          <div className="nd-row-2">
            <div className="nd-card">
              <div className="nd-card-header">
                <div className="nd-step-badge">1</div>
                <h3>Informations générales</h3>
              </div>
              <div className="nd-form-group-row">
                <div className="nd-form-field">
                  <label>Nom du document <span className="nd-req">*</span></label>
                  <input type="text" placeholder="Saisir le nom du document" value={title} onChange={e=>setTitle(e.target.value)} />
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
                <textarea placeholder="Décrivez brièvement le contenu du document..." rows={2} value={description} onChange={e=>setDescription(e.target.value)}></textarea>
              </div>
              <div className="nd-form-group-row">
                <div className="nd-form-field">
                  <label>Catégorie <span className="nd-req">*</span></label>
                  <select value={category} onChange={e => setCategory(Number(e.target.value) || e.target.value as any)}>
                    <option value="">Sélectionner</option>
                    {categories.length > 0 
                      ? categories.map((c:any) => <option key={c.id} value={c.id}>{c.name}</option>)
                      : DOCUMENT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)
                    }
                  </select>
                </div>
                <div className="nd-form-field">
                  <label>Statut <span className="nd-req">*</span></label>
                  <select value={status} onChange={e=>setStatus(e.target.value)}>
                    {DOCUMENT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <span className="nd-status-dot"></span>
                </div>
              </div>
              <div className="nd-form-field">
                <label>Tags</label>
                <div className="nce-tags-input" onClick={() => document.getElementById('nd-tag-input')?.focus()} style={{
                  display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px', 
                  border: '1px solid var(--dash-border)', borderRadius: 12, 
                  background: 'var(--dash-bg)', minHeight: 40, cursor: 'text'
                }}>
                  {tags.map(t => (
                    <span key={t} className="nce-tag" style={{
                      display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px',
                      background: 'rgba(59,130,246,.1)', color: '#3B82F6', borderRadius: 999, fontSize: 11, fontWeight: 500
                    }}>
                      {t} <button type="button" onClick={() => removeTag(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 12, padding: 0 }}>×</button>
                    </span>
                  ))}
                  <input
                    id="nd-tag-input"
                    placeholder={tags.length === 0 ? 'Ajouter un tag...' : ''}
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
                    style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13, minWidth: 120, color: 'var(--dash-text)' }}
                  />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                  {DOCUMENT_TAGS.filter(t => !tags.includes(t)).map(t => (
                    <button key={t} type="button" onClick={() => setTags(prev => [...prev, t])}
                      style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, border: '1px solid var(--dash-border)', background: 'var(--dash-bg)', color: 'var(--dash-text-muted)', cursor: 'pointer' }}>
                      + {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {selectedCategoryCode === 'COURRIER_ENTRANT' && (
              <div className="nd-card">
                <div className="nd-card-header">
                  <div className="nd-step-badge" style={{background: '#FF6B00'}}>CE</div>
                  <h3>Informations Courrier Entrant</h3>
                </div>
                <div className="nd-form-group-row">
                  <div className="nd-form-field">
                    <label>Expéditeur <span className="nd-req">*</span></label>
                    <input type="text" placeholder="Expéditeur du courrier" value={sender} onChange={e=>setSender(e.target.value)} required />
                  </div>
                  <div className="nd-form-field">
                    <label>Numéro d'expédition</label>
                    <input type="text" placeholder="Ex: EXP-2026-X" value={expNum} onChange={e=>setExpNum(e.target.value)} />
                  </div>
                </div>
                <div className="nd-form-group-row cols-3">
                  <div className="nd-form-field">
                    <label>Date d'expédition</label>
                    <input type="date" value={expDate} onChange={e=>setExpDate(e.target.value)} />
                  </div>
                  <div className="nd-form-field">
                    <label>Date d'arrivée</label>
                    <input type="date" value={arrivalDate} onChange={e=>setArrivalDate(e.target.value)} />
                  </div>
                  <div className="nd-form-field">
                    <label>Numéro d'enregistrement</label>
                    <input type="text" placeholder="Ex: REG-2026-Y" value={regNum} onChange={e=>setRegNum(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {selectedCategoryCode === 'COURRIER_SORTANT' && (
              <div className="nd-card">
                <div className="nd-card-header">
                  <div className="nd-step-badge" style={{background: '#3B82F6'}}>CS</div>
                  <h3>Informations Courrier Sortant</h3>
                </div>
                <div className="nd-form-group-row">
                  <div className="nd-form-field">
                    <label>Destinataire <span className="nd-req">*</span></label>
                    <input type="text" placeholder="Destinataire du courrier" value={recipient} onChange={e=>setRecipient(e.target.value)} required />
                  </div>
                  <div className="nd-form-field">
                    <label>Numéro d'expédition</label>
                    <input type="text" placeholder="Ex: EXP-2026-Z" value={expNum} onChange={e=>setExpNum(e.target.value)} />
                  </div>
                </div>
                <div className="nd-form-group-row">
                  <div className="nd-form-field">
                    <label>Date d'expedition</label>
                    <input type="date" value={expDate} onChange={e=>setExpDate(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            <div className="nd-card">
              <div className="nd-card-header">
                <div className="nd-step-badge">2</div>
                <h3>Classification</h3>
              </div>
              {/* Direction → Département → Service (API with static fallback) */}
              <div className="nd-form-group-row cols-3">
                <div className="nd-form-field">
                  <label>Direction</label>
                  {directions.length > 0 ? (
                    <select value={direction} onChange={e => { const val = Number(e.target.value) || ''; setDirection(val); setDepartement(''); setService(''); fetchDepartements(Number(val)); }}>
                      <option value="">Sélectionner</option>
                      {directions.map((d:any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  ) : (
                    <select value={staticDirKey} onChange={e => { setStaticDirKey(e.target.value as DeptKey | ''); setStaticDeptKey(''); }}>
                      <option value="">Sélectionner</option>
                      {DIRECTIONS_STATIC.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  )}
                </div>
                <div className="nd-form-field">
                  <label>Département</label>
                  {directions.length > 0 ? (
                    <select value={departement} onChange={e => { const val = Number(e.target.value) || ''; setDepartement(val); setService(''); fetchServices(Number(val)); }}>
                      <option value="">Sélectionner</option>
                      {departements.map((d:any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  ) : (
                    <select value={staticDeptKey} onChange={e => setStaticDeptKey(e.target.value as SvcKey | '')} disabled={!staticDirKey}>
                      <option value="">Sélectionner</option>
                      {staticDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  )}
                </div>
                <div className="nd-form-field">
                  <label>Service</label>
                  {directions.length > 0 ? (
                    <select value={service} onChange={e => setService(Number(e.target.value) || '')}>
                      <option value="">Sélectionner</option>
                      {services.map((s:any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  ) : (
                    <select disabled={!staticDeptKey}>
                      <option value="">Sélectionner</option>
                      {staticSvcs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  )}
                </div>
              </div>
              {selectedCategoryCode !== 'COURRIER_ENTRANT' && selectedCategoryCode !== 'COURRIER_SORTANT' && (
                <div className="nd-form-group-row mt-col">
                  <div className="nd-form-field">
                    <label>Dossier</label>
                    <select value={dossier} onChange={e => setDossier(Number(e.target.value) || e.target.value as any)}>
                      <option value="">Sélectionner</option>
                      {dossiers.length > 0 
                        ? dossiers.map((d:any) => <option key={d.id} value={d.id}>{d.name}</option>)
                        : DOSSIERS_STATIC.map(d => <option key={d} value={d}>{d}</option>)
                      }
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="nd-row-2">
            <div className="nd-card">
              <div className="nd-card-header">
                <div className="nd-step-badge">3</div>
                <h3>Upload du document</h3>
              </div>
              <div className="nd-upload-flex">
                <div className="nd-dropzone" onDragOver={e=>e.preventDefault()} onDrop={handleDrop}>
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                  <UploadCloud size={32} className="nd-upload-icon" />
                  <p>Glissez-déposez votre fichier ici<br/><span>ou</span></p>
                  <button onClick={()=>fileInputRef.current?.click()} className="nd-btn-outline">Choisir un fichier</button>
                </div>
                <div className="nd-preview-col">
                  <span className="nd-preview-label">Aperçu</span>
                  <div className="nd-doc-preview-mock">
                    <div className="nd-mock-lines"></div>
                  </div>
                  {file && <span className="nd-preview-size">{(file.size / 1024 / 1024).toFixed(2)} Mo</span>}
                </div>
              </div>
              
              {file && (
                <div className="nd-upload-progress">
                  <div className="nd-up-file-icon">DOC</div>
                  <div className="nd-up-info">
                    <div className="nd-up-title-row">
                      <span>{file.name}</span>
                      <button onClick={clearFile}><X size={12} /></button>
                    </div>
                    <span className="nd-up-size">{(file.size / 1024 / 1024).toFixed(2)} Mo</span>
                    <div className="nd-progress-bar-container">
                      <div className="nd-progress-fill" style={{ width: uploadProgress === null ? '0%' : `${uploadProgress}%`, backgroundColor: uploadProgress === 100 ? '#22C55E' : '#FF6B00' }}></div>
                      <span className="nd-progress-text" style={{ color: uploadProgress === 100 ? '#22C55E' : uploadProgress === null ? '#71717A' : '#FF6B00' }}>
                        {uploadProgress === null ? "Prêt (en attente d'enregistrement)" : uploadProgress === 100 ? 'Téléversé avec succès !' : `Téléversment... ${uploadProgress}%`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="nd-card">
              <div className="nd-card-header">
                <div className="nd-step-badge">4</div>
                <h3>Emplacement physique</h3>
              </div>
              <div className="nd-form-group-row cols-4">
                <div className="nd-form-field">
                  <label>Site</label>
                  <select value={physSite} onChange={e => setPhysSite(e.target.value)}>
                    <option value="Siège">Siège</option>
                    <option value="Annexe">Annexe</option>
                  </select>
                </div>
                <div className="nd-form-field">
                  <label>Bâtiment</label>
                  <select value={physBuilding} onChange={e => setPhysBuilding(e.target.value)}>
                    <option value="">Sélectionner</option>
                    {PHYSICAL_BUILDINGS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                  </select>
                </div>
                <div className="nd-form-field">
                  <label>Bureau</label>
                  <select value={physOffice} onChange={e => setPhysOffice(e.target.value)}>
                    <option value="">Sélectionner</option>
                    {PHYSICAL_OFFICES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="nd-form-field">
                  <label>Trésorerie</label>
                  <select value={physTreasury} onChange={e => setPhysTreasury(e.target.value)}>
                    <option value="">Sélectionner</option>
                    {PHYSICAL_TREASURIES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="nd-form-group-row cols-3">
                <div className="nd-form-field">
                  <label>Étagère</label>
                  <select value={physShelf} onChange={e => setPhysShelf(e.target.value)}>
                    <option value="">Sélectionner</option>
                    {PHYSICAL_SHELVES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div className="nd-form-field">
                  <label>Numéro de boîte</label>
                  <div className="nce-auto-number" style={{ fontSize: 12 }}>
                    <MapPin size={13} style={{ color: '#FF6B00' }} /> Auto-généré
                  </div>
                </div>
                <div className="nd-form-field">
                  <label>Numéro de document</label>
                  <div className="nce-auto-number" style={{ fontSize: 12 }}>
                    <MapPin size={13} style={{ color: '#FF6B00' }} /> Auto-généré
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="nd-right-col">
          <div className="nd-graphic-box">
            <div className="nd-graphic-art">
              <div className="nd-art-folder">
                 <div className="nd-art-doc">📄</div>
                 <div className="nd-art-plus">+</div>
              </div>
            </div>
          </div>

          <div className="nd-side-card">
            <h3>Résumé</h3>
            <div className="nd-summary-list">
              <div className="nd-sum-item">
                <span>Nom</span>
                <strong>{title || '-'}</strong>
              </div>
              <div className="nd-sum-item">
                <span>Catégorie</span>
                <strong>{categories.find((c:any) => c.id === category)?.name || DOCUMENT_CATEGORIES.find((c:any) => c.value === category)?.label || '-'}</strong>
              </div>
              <div className="nd-sum-item">
                <span>Fichier</span>
                <strong>{file ? file.name : '-'}</strong>
              </div>
              <div className="nd-sum-item">
                <span>Statut</span>
                <strong><span className="nd-dot-green"></span> {status}</strong>
              </div>
            </div>
          </div>
        </div>

      </div>
      
      <div className="nd-action-bar" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
        {formError && (
          <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: 500 }}>
            {formError}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => navigate('/documents')} className="nd-btn-ghost">Annuler</button>
          <div className="nd-action-right">
            <button disabled={loading} onClick={() => handleSubmit('new')} className="nd-btn-outline-orange">
               {loading ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16}/>} Enregistrer et nouveau
            </button>
            <button disabled={loading} onClick={() => handleSubmit('redirect')} className="nd-btn-primary">
               {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16}/>} Enregistrer et fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
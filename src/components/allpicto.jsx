import React, { useState, useEffect, useMemo } from 'react';
import './allpicto.css';

const AllPicto = () => {
  const [pictos, setPictos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [progressFilter, setProgressFilter] = useState('all'); // 'all', 'obtained', 'missing'
  const [obtainedPictos, setObtainedPictos] = useState(new Set());

  // Charger les données JSON et la progression sauvegardée
  useEffect(() => {
    const loadPictos = async () => {
      try {
        const response = await fetch('/All-Pictos-Finder-Clair-Obscur-Expedition-33/pictofr_new.json');
        const data = await response.json();
        setPictos(data);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des pictos:', error);
        setLoading(false);
      }
    };

    loadPictos();
    loadProgress();
  }, []);

  // Sauvegarder la progression dans le localStorage
  const saveProgress = (newObtainedPictos) => {
    localStorage.setItem('pictosProgress', JSON.stringify(Array.from(newObtainedPictos)));
  };

  // Charger la progression depuis le localStorage
  const loadProgress = () => {
    try {
      const saved = localStorage.getItem('pictosProgress');
      if (saved) {
        setObtainedPictos(new Set(JSON.parse(saved)));
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la progression:', error);
    }
  };

  // Gérer la case à cocher
  const handlePictoToggle = (pictoId) => {
    const newObtainedPictos = new Set(obtainedPictos);
    if (newObtainedPictos.has(pictoId)) {
      newObtainedPictos.delete(pictoId);
    } else {
      newObtainedPictos.add(pictoId);
    }
    setObtainedPictos(newObtainedPictos);
    saveProgress(newObtainedPictos);
  };

  // Exporter la progression
  const exportProgress = () => {
    const progressData = {
      exportDate: new Date().toISOString(),
      totalPictos: pictos.length,
      obtainedPictos: Array.from(obtainedPictos),
      obtainedCount: obtainedPictos.size,
      missingCount: pictos.length - obtainedPictos.size
    };

    const blob = new Blob([JSON.stringify(progressData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pictos-progression-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Importer la progression
  const importProgress = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const progressData = JSON.parse(e.target.result);
          if (progressData.obtainedPictos && Array.isArray(progressData.obtainedPictos)) {
            setObtainedPictos(new Set(progressData.obtainedPictos));
            saveProgress(new Set(progressData.obtainedPictos));
            alert(`Progression importée avec succès ! ${progressData.obtainedCount} pictos obtenus.`);
          } else {
            alert('Format de fichier invalide.');
          }
        } catch (error) {
          alert('Erreur lors de l\'import du fichier.');
          console.error('Erreur d\'import:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  // Filtrer et trier les données
  const filteredAndSortedPictos = useMemo(() => {
    let filtered = pictos.filter(picto => {
      const matchesSearch = picto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        picto.bonus.toLowerCase().includes(searchTerm.toLowerCase()) ||
        picto.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        picto.emplacement.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;
      
      // Appliquer le filtre de progression
      switch (progressFilter) {
        case 'obtained':
          return obtainedPictos.has(picto.id);
        case 'missing':
          return !obtainedPictos.has(picto.id);
        default:
          return true;
      }
    });

    // Tri
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [pictos, searchTerm, sortField, sortDirection, progressFilter, obtainedPictos]);

  // Pagination
  const paginatedPictos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedPictos.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedPictos, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedPictos.length / itemsPerPage);

  // Gérer le tri
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Gérer la recherche
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Gérer le changement de page
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Gérer le filtre de progression
  const handleProgressFilter = (filter) => {
    setProgressFilter(filter);
    setCurrentPage(1);
  };

  // Obtenir l'icône de tri
  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  // Obtenir la couleur de rareté basée sur le niveau
  const getRarityClass = (niveau) => {
    const level = parseInt(niveau);
    if (level >= 25) return 'legendary';
    if (level >= 15) return 'epic';
    if (level >= 10) return 'rare';
    if (level >= 5) return 'uncommon';
    return 'common';
  };

  // Composant de la modale d'aide
  const HelpModal = () => (
    <div className="modal-overlay" onClick={() => setShowHelpModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎨 Guide des Codes Couleurs</h2>
          <button 
            className="modal-close-btn"
            onClick={() => setShowHelpModal(false)}
          >
            ✕
          </button>
        </div>
        
        <div className="modal-body">
          <div className="color-guide">
            <h3>Rareté des Pictos (basée sur le niveau)</h3>
            
            <div className="color-item">
              <span className="color-badge common">Commun</span>
              <span className="color-description">
                Niveau 1-4 : Pictos de base, facilement accessibles
              </span>
            </div>
            
            <div className="color-item">
              <span className="color-badge uncommon">Peu commun</span>
              <span className="color-description">
                Niveau 5-9 : Pictos intermédiaires, plus puissants
              </span>
            </div>
            
            <div className="color-item">
              <span className="color-badge rare">Rare</span>
              <span className="color-description">
                Niveau 10-14 : Pictos rares, effets significatifs
              </span>
            </div>
            
            <div className="color-item">
              <span className="color-badge epic">Épique</span>
              <span className="color-description">
                Niveau 15-24 : Pictos épiques, très puissants
              </span>
            </div>
            
            <div className="color-item">
              <span className="color-badge legendary">Légendaire</span>
              <span className="color-description">
                Niveau 25+ : Pictos légendaires, les plus rares et puissants
              </span>
            </div>
          </div>
          
          <div className="usage-tips">
            <h3>💡 Conseils d'utilisation</h3>
            <ul>
              <li>Les pictos de niveau élevé sont généralement plus difficiles à obtenir</li>
              <li>La rareté n'indique pas toujours la puissance, mais plutôt l'accessibilité</li>
              <li>Certains pictos de bas niveau peuvent être très utiles dans des builds spécifiques</li>
              <li>Utilisez la recherche pour trouver des pictos par effet ou zone</li>
            </ul>
          </div>

          <div className="usage-tips">
            <h3>💾 Sauvegarde et Partage de Progression</h3>
            
            <div className="color-item">
              <span className="color-badge" style={{backgroundColor: '#43b581', color: 'white'}}>📤 Exporter</span>
              <span className="color-description">
                <strong>Comment ça marche :</strong> Cliquez sur "📤 Exporter la progression" pour télécharger un fichier de sauvegarde de votre progression actuelle.
              </span>
            </div>
            
            <div className="color-item">
              <span className="color-badge" style={{backgroundColor: '#faa61a', color: 'white'}}>📥 Importer</span>
              <span className="color-description">
                <strong>Comment ça marche :</strong> Cliquez sur "📥 Importer la progression" et sélectionnez un fichier de sauvegarde précédemment exporté.
              </span>
            </div>

            <h4 style={{color: 'var(--discord-text)', marginTop: '20px', marginBottom: '15px'}}>🔍 Qu'est-ce qu'un fichier JSON ?</h4>
            <p style={{color: 'var(--discord-text-muted)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '15px'}}>
              Un fichier JSON est un format de fichier standard qui permet de sauvegarder des informations de manière organisée. 
              C'est comme un "carnet de notes numérique" que votre ordinateur peut lire et comprendre.
            </p>

            <h4 style={{color: 'var(--discord-text)', marginTop: '20px', marginBottom: '15px'}}>📱 Comment utiliser ces fichiers ?</h4>
            <ul style={{color: 'var(--discord-text-muted)', fontSize: '0.9rem', lineHeight: '1.5'}}>
              <li><strong>Pour sauvegarder :</strong> L'exportation crée automatiquement un fichier que vous pouvez stocker sur votre ordinateur, téléphone ou dans le cloud</li>
              <li><strong>Pour partager :</strong> Envoyez le fichier exporté à un ami pour qu'il puisse importer votre progression</li>
              <li><strong>Pour changer d'appareil :</strong> Exportez sur un appareil, puis importez sur un autre</li>
              <li><strong>Pour faire une sauvegarde de sécurité :</strong> Gardez plusieurs versions de votre progression à différents moments</li>
            </ul>

            <h4 style={{color: 'var(--discord-text)', marginTop: '20px', marginBottom: '15px'}}>⚠️ Points importants</h4>
            <ul style={{color: 'var(--discord-text-muted)', fontSize: '0.9rem', lineHeight: '1.5'}}>
              <li>Les fichiers JSON ne contiennent que votre progression, pas vos données personnelles</li>
              <li>Vous pouvez importer/exporter autant de fois que vous voulez</li>
              <li>L'importation remplace complètement votre progression actuelle</li>
              <li>Gardez vos fichiers de sauvegarde dans un endroit sûr</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement des pictos...</p>
      </div>
    );
  }

  return (
    <div className="allpicto-container">
      <header className="allpicto-header">
        <h1>🎯 All Picto Finder Expedition 33
        </h1>
        <p className="subtitle">Découvrez tous les {pictos.length} pictos disponibles dans Expedition 33</p>
      </header>

      <div className="search-container">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Rechercher un picto (nom, bonus, zone, emplacement)..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        
        <div className="search-actions">
          <button 
            className="help-btn"
            onClick={() => setShowHelpModal(true)}
            title="Guide des codes couleurs"
          >
            ❓ Aide
          </button>
          
          <div className="results-info">
            {filteredAndSortedPictos.length} picto(s) trouvé(s)
          </div>
        </div>
      </div>

      {/* Filtres de progression et actions */}
      <div className="progress-controls">
        <div className="progress-filters">
          <button 
            className={`progress-filter-btn ${progressFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleProgressFilter('all')}
          >
            📋 Tous ({pictos.length})
          </button>
          <button 
            className={`progress-filter-btn ${progressFilter === 'obtained' ? 'active' : ''}`}
            onClick={() => handleProgressFilter('obtained')}
          >
            ✅ Obtenus ({obtainedPictos.size})
          </button>
          <button 
            className={`progress-filter-btn ${progressFilter === 'missing' ? 'active' : ''}`}
            onClick={() => handleProgressFilter('missing')}
          >
            ❌ Manquants ({pictos.length - obtainedPictos.size})
          </button>
        </div>
        
        <div className="progress-actions">
          <button className="export-btn" onClick={exportProgress}>
            📤 Exporter la progression
          </button>
          <label className="import-btn">
            📥 Importer la progression
            <input
              type="file"
              accept=".json"
              onChange={importProgress}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      <div className="table-container">
        <table className="pictos-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} className="sortable">
                ID {getSortIcon('id')}
              </th>
              <th className="progress-header">
                ✅ Progression
              </th>
              <th onClick={() => handleSort('name')} className="sortable">
                Nom {getSortIcon('name')}
              </th>
              <th onClick={() => handleSort('niveau')} className="sortable">
                ⚔️ Niveau {getSortIcon('niveau')}
              </th>
              <th onClick={() => handleSort('bonus')} className="sortable">
                🎯 Bonus {getSortIcon('bonus')}
              </th>
              <th onClick={() => handleSort('zone')} className="sortable">
                🗺️ Zone {getSortIcon('zone')}
              </th>
              <th onClick={() => handleSort('emplacement')} className="sortable">
                📍 Emplacement {getSortIcon('emplacement')}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedPictos.map((picto) => (
              <tr key={picto.id} className="picto-row">
                <td className="id-cell">#{picto.id}</td>
                <td className="progress-cell">
                  <input
                    type="checkbox"
                    checked={obtainedPictos.has(picto.id)}
                    onChange={() => handlePictoToggle(picto.id)}
                    className="progress-checkbox"
                    title={obtainedPictos.has(picto.id) ? "Marquer comme non obtenu" : "Marquer comme obtenu"}
                  />
                </td>
                <td className="name-cell">
                  <span className={`name-badge ${getRarityClass(picto.niveau)}`}>
                    {picto.name}
                  </span>
                </td>
                <td className="niveau-cell">
                  <span className={`niveau-badge ${getRarityClass(picto.niveau)}`}>
                    {picto.niveau}
                  </span>
                </td>
                <td className="bonus-cell">
                  <div className="bonus-content">
                    {picto.bonus.split('\n').map((line, index) => (
                      <div key={index} className="bonus-line">
                        {line}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="zone-cell">
                  <div className="zone-content">
                    {picto.zone}
                  </div>
                </td>
                <td className="emplacement-cell">
                  <div className="emplacement-content">
                    {picto.emplacement}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination-container">
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ⬅️ Précédent
          </button>
          
          <div className="pagination-info">
            <span className="page-numbers">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </span>
            <span className="page-info">
              Page {currentPage} sur {totalPages}
            </span>
          </div>

          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Suivant ➡️
          </button>
        </div>
      )}

      <footer className="table-footer">
        <div className="stats">
          <div className="stat-item">
            <span className="stat-label">Total des pictos:</span>
            <span className="stat-value">{pictos.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Obtenus:</span>
            <span className="stat-value obtained">{obtainedPictos.size}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Manquants:</span>
            <span className="stat-value missing">{pictos.length - obtainedPictos.size}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Progression:</span>
            <span className="stat-value progress">
              {Math.round((obtainedPictos.size / pictos.length) * 100)}%
            </span>
          </div>
        </div>
      </footer>

      {/* Modale d'aide */}
      {showHelpModal && <HelpModal />}
    </div>
  );
};

export default AllPicto;

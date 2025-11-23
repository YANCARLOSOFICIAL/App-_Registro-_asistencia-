import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '../hooks/useDebounce';
import './SearchBar.css';

const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ users: [], events: [], documents: [] });
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const debouncedQuery = useDebounce(query, 300);

  // Search in backend
  useEffect(() => {
    const searchData = async () => {
      if (debouncedQuery.trim() === '') {
        setResults({ users: [], events: [], documents: [] });
        setLoading(false);
        return;
      }

      setLoading(true);
      const token = localStorage.getItem('token');
      const searchQuery = debouncedQuery.toLowerCase();

      try {
        // Search in parallel
        const [usersRes, eventsRes, documentsRes] = await Promise.all([
          fetch('http://localhost:5000/api/users', {
            headers: { 'Authorization': `Bearer ${token}` }
          }).catch(() => ({ ok: false })),
          fetch('http://localhost:5000/api/events', {
            headers: { 'Authorization': `Bearer ${token}` }
          }).catch(() => ({ ok: false })),
          fetch('http://localhost:5000/api/documents').catch(() => ({ ok: false }))
        ]);

        const users = usersRes.ok ? await usersRes.json() : [];
        const events = eventsRes.ok ? await eventsRes.json() : [];
        const documents = documentsRes.ok ? await documentsRes.json() : [];

        // Filter results
        const filteredUsers = users.filter(user =>
          user.name?.toLowerCase().includes(searchQuery) ||
          user.email?.toLowerCase().includes(searchQuery)
        ).slice(0, 3);

        const filteredEvents = events.filter(event =>
          event.name?.toLowerCase().includes(searchQuery) ||
          event.description?.toLowerCase().includes(searchQuery)
        ).slice(0, 3);

        const filteredDocuments = documents.filter(doc =>
          doc.title?.toLowerCase().includes(searchQuery) ||
          doc.description?.toLowerCase().includes(searchQuery)
        ).slice(0, 3);

        setResults({
          users: filteredUsers,
          events: filteredEvents,
          documents: filteredDocuments
        });
      } catch (error) {
        console.error('Search error:', error);
      }

      setLoading(false);
    };

    searchData();
  }, [debouncedQuery]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectUser = (userId) => {
    navigate('/users');
    setIsOpen(false);
    setQuery('');
  };

  const handleSelectEvent = (eventId) => {
    navigate('/events');
    setIsOpen(false);
    setQuery('');
  };

  const handleSelectDocument = (docId) => {
    navigate('/documents');
    setIsOpen(false);
    setQuery('');
  };

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div className="search-bar" ref={searchRef}>
      <button className="search-trigger" onClick={handleOpen} aria-label="Search">
        🔍
        <span className="search-trigger-text">Buscar datos...</span>
        <kbd className="search-shortcut">⌘K</kbd>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="search-overlay" onClick={() => setIsOpen(false)} />
            <motion.div
              className="search-modal"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  ref={inputRef}
                  type="text"
                  className="search-input"
                  placeholder="Buscar usuarios, eventos, documentos..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                />
                {query && (
                  <button
                    className="search-clear"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="search-results">
                {loading ? (
                  <div className="search-loading">
                    <div className="spinner spinner-sm"></div>
                    <p>Buscando...</p>
                  </div>
                ) : (
                  <>
                    {query.trim() === '' ? (
                      <div className="search-suggestions">
                        <p className="search-suggestions-title">💡 Comienza a escribir para buscar</p>
                        <div className="search-hints-list">
                          <p>• Busca usuarios por nombre o email</p>
                          <p>• Busca eventos por título</p>
                          <p>• Busca documentos por título</p>
                        </div>
                      </div>
                    ) : results.users.length === 0 && results.events.length === 0 && results.documents.length === 0 ? (
                      <div className="search-empty">
                        <span>🔍</span>
                        <p>No se encontraron resultados para "{query}"</p>
                      </div>
                    ) : (
                      <>
                        {/* Users Results */}
                        {results.users.length > 0 && (
                          <div className="search-category">
                            <p className="search-category-title">👥 Usuarios ({results.users.length})</p>
                            {results.users.map((user) => (
                              <button
                                key={user._id}
                                className="search-result-item"
                                onClick={() => handleSelectUser(user._id)}
                              >
                                <span className="search-result-icon">👤</span>
                                <div className="search-result-content">
                                  <span className="search-result-title">{user.name}</span>
                                  <span className="search-result-subtitle">{user.email}</span>
                                </div>
                                <span className={`badge badge-${user.role === 'admin' ? 'danger' : 'primary'}`}>
                                  {user.role}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Events Results */}
                        {results.events.length > 0 && (
                          <div className="search-category">
                            <p className="search-category-title">📅 Eventos ({results.events.length})</p>
                            {results.events.map((event) => (
                              <button
                                key={event._id}
                                className="search-result-item"
                                onClick={() => handleSelectEvent(event._id)}
                              >
                                <span className="search-result-icon">📅</span>
                                <div className="search-result-content">
                                  <span className="search-result-title">{event.name}</span>
                                  <span className="search-result-subtitle">
                                    {new Date(event.date).toLocaleDateString('es-ES')}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Documents Results */}
                        {results.documents.length > 0 && (
                          <div className="search-category">
                            <p className="search-category-title">📄 Documentos ({results.documents.length})</p>
                            {results.documents.map((doc) => (
                              <button
                                key={doc._id}
                                className="search-result-item"
                                onClick={() => handleSelectDocument(doc._id)}
                              >
                                <span className="search-result-icon">📄</span>
                                <div className="search-result-content">
                                  <span className="search-result-title">{doc.title}</span>
                                  {doc.description && (
                                    <span className="search-result-subtitle">{doc.description}</span>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>

              <div className="search-footer">
                <span className="search-hint">
                  <kbd>↑</kbd> <kbd>↓</kbd> navegar
                </span>
                <span className="search-hint">
                  <kbd>↵</kbd> seleccionar
                </span>
                <span className="search-hint">
                  <kbd>esc</kbd> cerrar
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;

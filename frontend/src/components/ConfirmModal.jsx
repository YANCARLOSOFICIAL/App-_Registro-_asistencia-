import Modal from './Modal';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar acción',
  message = '¿Estás seguro de que deseas continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger', // 'danger', 'warning', 'primary'
  loading = false
}) => {
  const handleConfirm = () => {
    onConfirm();
    if (!loading) {
      onClose();
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return '⚠️';
      case 'warning':
        return '⚡';
      case 'primary':
        return 'ℹ️';
      default:
        return '❓';
    }
  };

  const getButtonClass = () => {
    switch (variant) {
      case 'danger':
        return 'btn-danger';
      case 'warning':
        return 'btn btn-warning';
      case 'primary':
        return 'btn-primary';
      default:
        return 'btn-primary';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      closeOnOverlayClick={!loading}
      footer={
        <>
          <button
            className="btn btn-outline"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            className={`btn ${getButtonClass()}`}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <div
                  className="spinner spinner-sm"
                  style={{ borderTopColor: 'white' }}
                ></div>
                Procesando...
              </>
            ) : (
              confirmText
            )}
          </button>
        </>
      }
    >
      <div style={{ textAlign: 'center', padding: 'var(--spacing-md)' }}>
        <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>
          {getIcon()}
        </div>
        <p style={{ color: 'var(--text-primary)', fontSize: 'var(--text-base)' }}>
          {message}
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmModal;

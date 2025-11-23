import './Skeleton.css';

export const Skeleton = ({ width, height, variant = 'text', className = '' }) => {
  return (
    <div
      className={`skeleton skeleton-${variant} ${className}`}
      style={{
        width: width || (variant === 'text' ? '100%' : undefined),
        height: height || (variant === 'text' ? '1rem' : undefined),
      }}
    />
  );
};

export const SkeletonText = ({ lines = 3, lastLineWidth = '70%' }) => {
  return (
    <div className="skeleton-text-block">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? lastLineWidth : '100%'}
        />
      ))}
    </div>
  );
};

export const SkeletonCard = () => {
  return (
    <div className="skeleton-card">
      <Skeleton variant="rect" width="100%" height="200px" />
      <div style={{ padding: 'var(--spacing-md)' }}>
        <Skeleton variant="text" width="60%" height="1.5rem" />
        <SkeletonText lines={2} />
      </div>
    </div>
  );
};

export const SkeletonTable = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="skeleton-table">
      {/* Header */}
      <div className="skeleton-table-row skeleton-table-header">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} variant="text" width="80%" height="1rem" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="skeleton-table-row">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" width="90%" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const SkeletonAvatar = ({ size = '40px' }) => {
  return <Skeleton variant="circle" width={size} height={size} />;
};

export const SkeletonButton = ({ width = '120px', height = '40px' }) => {
  return <Skeleton variant="rect" width={width} height={height} />;
};

export default Skeleton;

import React, { useRef, useEffect } from 'react';

const GeofencePopup = ({ onAdd, onUpdate, map }) => {
  const popupRef = useRef(null);

  useEffect(() => {
    if (popupRef.current) {
      // Perform operations using popupRef.current
    }
  }, [map]);

  return (
    <div ref={popupRef}>
      {/* Your popup content */}
    </div>
  );
};

export default GeofencePopup;

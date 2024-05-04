import '../stylesheets/Notification.css';
import { useState, useEffect } from 'react';

export default function Notification(props) {
  const message = props.message;
  const onClose = props.onClose;
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
    // call onClose to setShowNotif in parent component to false
    onClose();
  };
  
  return (
    <div className={`notif ${visible ? 'visible' : ""}`}>
      <span className="close-button" onClick={handleClose}>&times;</span>
      <p>{message}</p>
    </div>
  );
}
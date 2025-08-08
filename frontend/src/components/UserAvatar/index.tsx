import React, { useState } from 'react';
import UserProfile from '../UserProfile';
import type { User } from '../../types';

interface UserAvatarProps {
  user: User;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user }) => {
  const [showProfile, setShowProfile] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Debug: verificar URL do avatar
  console.log('UserAvatar Debug:', {
    user,
    avatar: user.avatar,
    constructedURL: user.avatar ? `${import.meta.env.VITE_BASE_URL || 'http://localhost:5000'}${user.avatar}` : null
  });

  // Fetch example (this line is just added as per your request, but it's not used in the component)
  fetch('http://localhost:5000/uploads/avatars/avatar-1754625021155-201365052.jpg', {
    credentials: 'include'
  });

  return (
    <>
      <div className="user-avatar" onClick={() => setShowProfile(true)}>
        <div className="user-avatar-circle">
          {user.avatar ? (
            <img 
              src={`${import.meta.env.VITE_BASE_URL || 'http://localhost:5000'}${user.avatar}`} 
              alt={user.name} 
              crossOrigin="anonymous"
            />
          ) : (
            <span className="user-initials">{getInitials(user.name)}</span>
          )}
        </div>
      </div>

      {showProfile && (
        <UserProfile onClose={() => setShowProfile(false)} />
      )}
    </>
  );
};

export default UserAvatar;

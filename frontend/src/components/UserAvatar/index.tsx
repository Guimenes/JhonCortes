import React, { useState, memo } from 'react';
import UserProfile from '../UserProfile';
import type { User } from '../../types';

interface UserAvatarProps {
  user: User;
}

const UserAvatar: React.FC<UserAvatarProps> = memo(({ user }) => {
  const [showProfile, setShowProfile] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarUrl = user.avatar ? `${import.meta.env.VITE_BASE_URL || 'http://localhost:5000'}${user.avatar}` : null;

  return (
    <>
      <div className="user-avatar" onClick={() => setShowProfile(true)}>
        <div className="user-avatar-circle">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={user.name} 
              crossOrigin="anonymous"
              loading="lazy"
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
}, (prevProps, nextProps) => {
  // Custom comparison function
  return prevProps.user._id === nextProps.user._id && 
         prevProps.user.avatar === nextProps.user.avatar &&
         prevProps.user.name === nextProps.user.name;
});

UserAvatar.displayName = 'UserAvatar';

export default UserAvatar;

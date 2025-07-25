interface UserAvatarProps {
  userId: string;
  username: string;
}

const generateColor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
};

const UserAvatar = ({ userId, username }: UserAvatarProps) => {
  const color = generateColor(userId);
  // Use the first letter of the username for the initial
  const initial = username ? username.charAt(0).toUpperCase() : '?';

  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
      style={{ backgroundColor: color }}
      title={username} // Show the full username on hover
    >
      {initial}
    </div>
  );
};

export default UserAvatar;

import React from 'react';
import Svg, { Path } from 'react-native-svg';

type TrophyAnimatedProps = {
  size?: number;
  color?: string;
  isActive?: boolean;
};

export const TrophyAnimated = React.memo(function TrophyAnimated({
  size = 14,
  color = '#FFD93D',
  isActive = true,
}: TrophyAnimatedProps) {
  const fillColor = isActive ? color : color + '40';
  
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <Path
        d="M400 80H112c-8.8 0-16 7.2-16 16v48c0 44.2 35.8 80 80 80h8c17.6 35.8 48.5 63.2 86 73.2V368h-48c-17.7 0-32 14.3-32 32v16c0 8.8 7.2 16 16 16h160c8.8 0 16-7.2 16-16v-16c0-17.7-14.3-32-32-32h-48v-70.8c37.5-10 68.4-37.4 86-73.2h8c44.2 0 80-35.8 80-80V96c0-8.8-7.2-16-16-16zM176 176c-17.6 0-32-14.4-32-32v-16h32v48zm208-32c0 17.6-14.4 32-32 32v-48h32v16z"
        fill={fillColor}
      />
    </Svg>
  );
});

export default TrophyAnimated;

import React from 'react';
import Svg, { Path } from 'react-native-svg';

type CheckCircleAnimatedProps = {
  size?: number;
  color?: string;
  isActive?: boolean;
};

export const CheckCircleAnimated = React.memo(function CheckCircleAnimated({
  size = 14,
  color = '#4CAF50',
  isActive = true,
}: CheckCircleAnimatedProps) {
  const fillColor = isActive ? color : color + '40';
  
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <Path
        d="M256 48C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48zm106.5 150.5L228.8 332.8c-4.7 4.7-10.8 7-16.9 7s-12.3-2.3-16.9-7l-63.5-63.5c-9.4-9.4-9.4-24.6 0-33.9 9.4-9.4 24.6-9.4 33.9 0l46.6 46.6 116.8-116.8c9.4-9.4 24.6-9.4 33.9 0 9.3 9.3 9.3 24.5-.2 33.9z"
        fill={fillColor}
      />
    </Svg>
  );
});

export default CheckCircleAnimated;

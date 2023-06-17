// src/components/Icons/UpdateIcon.js
import React from 'react';
import { Svg, Path } from 'react-native-svg';

const UpdateIcon = (props) => {
  return (
    <Svg
      width={props.size}
      height={props.size}
      viewBox="0 0 512 512"
      fill={props.color || '#FFFFFF'}
      {...props}
    >
      <Path d="M256 0a256 256 0 1 0 0 512A256 256 0 1 0 256 0zM127 281c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l71 71L232 136c0-13.3 10.7-24 24-24s24 10.7 24 24l0 182.1 71-71c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9L273 393c-9.4 9.4-24.6 9.4-33.9 0L127 281z" />
    </Svg>
  );
};

export default UpdateIcon;
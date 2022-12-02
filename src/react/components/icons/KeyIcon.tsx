import { Ref, SVGAttributes, forwardRef } from 'react';

import React from 'react';
import logo from "../../../../static/keyVisual.png";

export const KeyIcon = forwardRef(
  (props: SVGAttributes<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
    <svg width="202" height="202" viewBox="0 0 252 252" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
      <rect x="0.5" y="0.5" width="251" height="251" fill="url(#pattern0)"/>
      <defs>
        <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
        <use xlinkHref="#image0" transform="translate(0.04 0.02) scale(0.0018 0.0018)"/>
        </pattern>
        <image id="image0" width="520" height="520" xlinkHref={logo} />
      </defs>
    </svg>
  ),
);

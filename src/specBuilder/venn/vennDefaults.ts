/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import { VennDegreeOptions, VennProps } from '../../types';

export const DEFAULT_VENN_STYLES = {
  fontSize: 16,
  padding: 0,
  fontWeight: 'normal',
  intersectionFill: 'static-blue',
  color: 'white',
} satisfies Required<VennProps['style']>;

export const SET_ID_DELIMITER = '∩';

export const DEFAULT_VENN_COLOR = 'sets';
export const DEFAULT_VENN_METRIC = 'size';
export const DEFAULT_LABEL = 'label';


// the convertion here does not match to real math
// however its the orientations that work for venn-helper
export const degreesToRadians = new Map<VennDegreeOptions, number>([
  ['0deg', Math.PI / 2],
  ['90deg', 0],
  ['180deg', -Math.PI / 2],
  ['270deg', -Math.PI],
]);

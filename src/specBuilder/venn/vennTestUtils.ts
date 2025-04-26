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
import { VennSpecProps } from '../../types';
import { DEFAULT_VENN_COLOR, DEFAULT_VENN_METRIC, DEFAULT_VENN_STYLES } from './vennDefaults';

const { A, B, C } = {
	A: 'Instagram',
	B: 'TikTok',
	C: 'X',
};

export const data = [
	{ regions: [A], radius: 12 },
	{ regions: [B], radius: 12 },
	{ regions: [C], radius: 6 },
	{ regions: ['D'], radius: 6 },
	{ regions: [A, B], radius: 2 },
	{ regions: [A, 'D'], radius: 2 },
	{ regions: [A, C], radius: 2 },
	{ regions: [B, C], radius: 2 },
	{ regions: [A, B, C], radius: 1 },
];

export const defaultVennProps: VennSpecProps = {
	data,
	children: [],
	colorScheme: 'light',
	idKey: 'set_id',
	index: 0,
	dimension: '',
	markType: 'venn',
	chartWidth: 350,
	chartHeight: 350,
	style: DEFAULT_VENN_STYLES,
	orientation: '0deg',
	name: 'venn',
	label: 'label',
	color: "regions",
	metric: "radius"
};


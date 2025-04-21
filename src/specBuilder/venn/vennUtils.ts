/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {
	getColorProductionRule,
	getMarkOpacity,
	getTooltip,
	hasPopover,
	isInteractive,
} from '@specBuilder/marks/markUtils';
import { getColorValue } from '@specBuilder/specUtils';
import { PathMark, SymbolMark, TextMark, isArray } from 'vega';
import {
	type CircleRecord,
	type TextCenterRecord,
	computeTextCentres,
	intersectionAreaPath,
	normalizeSolution,
	scaleSolution,
	venn,
} from 'venn-helper';

import { ChartPopoverSpecProps, HighlightedItem, MarkChildElement, VennProps, VennSpecProps } from '../../types';
import { SET_ID_DELIMITER, VENN_DEFAULT_STYLES } from './vennDefaults';

type VennHelperProps = {
	sets: string[];
	size: number;
};

export const getVennSolution = (props: VennSpecProps) => {
	const { orientation } = props;

	const test = mapDataForVennHelper(props);

	let circles: CircleRecord = {};
	let textCenters: TextCenterRecord = {};

	if (test.length > 0) {
		let solution = venn(test);

		if (orientation !== undefined) {
			solution = normalizeSolution(solution, orientation) 
		}

		circles = scaleSolution(solution, props.chartWidth, props.chartHeight / 1.4, props.style.padding);
		textCenters = computeTextCentres(circles, test);
	}

	const allIntersections = test.map((datum) => {
		// we join by comma here to because its the output of venn-helper
		const setName = datum.sets.join(',');
		// Added size to the intersection data
		const { x: textX, y: textY } = textCenters[setName];
		return {
			set_id: datum.sets.join(SET_ID_DELIMITER),
			sets: datum.sets,
			path: intersectionAreaPath(datum.sets.map((set) => circles[set])),
			textY,
			textX,
			size: datum.size,
		};
	});

	const intersections = allIntersections.filter((datum) => datum.sets.length > 1);

	const circlesData = Object.entries(circles).map(([key, circle]) => ({
		set_id: key,
		x: circle.x,
		y: circle.y,
		// the size represents the radius, to scale we need to convert to the area of the square
		size: Math.pow(circle.radius * 2, 2),
		textX: textCenters[key].x,
		textY: textCenters[key].y,
	}));

	return { circles: circlesData, intersections, allIntersections };
};

function mapDataForVennHelper(props: VennSpecProps): VennHelperProps[] {
	const { data, metric, setField } = props;
	const unsafeData = data as unknown as Record<string, unknown>[];

	const parsed = unsafeData
		.map((datum) => {
			const res = { ...datum };

			if (metric) {
				if (typeof res[metric] === 'number') {
					res.size = datum[metric] as string;
				}

				if (!res[metric]) {
					throw new Error("set the metric prop to the default 'size' or set your own");
				}
			}

			if (setField) {
				if (typeof isArray(res[setField])) {
					res.sets = structuredClone(datum[setField]) as string[];
				}

				if (!res[setField]) {
					throw new Error("set the setField prop to the default 'sets' or set your own");
				}
			}

			return {
				size: res.size as number,
				sets: res.sets as string[],
			} satisfies VennHelperProps;
		})
		.filter((datum) => datum.sets.length > 0);

	return parsed;
}

export function mergeStylesWithDefaults(style: VennProps['style']) {
	return {
		fontSize: style?.fontSize ?? VENN_DEFAULT_STYLES.fontSize,
		padding: style?.padding ?? VENN_DEFAULT_STYLES.padding,
		fontWeight: style?.fontWeight ?? VENN_DEFAULT_STYLES.fontWeight,
		intersectionFill: style?.intersectionFill ?? VENN_DEFAULT_STYLES.intersectionFill,
		color: style?.color ?? VENN_DEFAULT_STYLES.color,
	} satisfies Required<VennProps['style']>;
}

export const getInteractiveMarkName = (
	children: MarkChildElement[],
	markName: string,
	highlightedItem?: HighlightedItem
): string | undefined => {
	if (isInteractive(children) || highlightedItem !== undefined) {
		return markName;
	}
	return undefined;
};

export const getPopoverMarkName = (children: MarkChildElement[], markName: string): string | undefined => {
	if (hasPopover(children)) {
		return markName;
	}
	return undefined;
};

export const getCircleMark = (props: VennSpecProps, popovers: ChartPopoverSpecProps[]): SymbolMark => {
	const { name, children, colorScheme } = props;

	return {
		type: 'symbol',
		name: name,
		from: { data: 'circles' },
		encode: {
			enter: {
				x: { field: 'x' },
				y: { field: 'y' },
				tooltip: getTooltip(children, name),
				size: { field: 'size' },
				shape: { value: 'circle' },
				fill: getColorProductionRule('set_id', colorScheme),
			},
			update: {
				opacity: getMarkOpacity(props, 0.5),
				// Add cursor pointer when there are popovers
				cursor: popovers.length ? { value: 'pointer' } : undefined,
			},
		},
	};
};

export const getTextMark = (props: VennSpecProps, dataSource: 'circles' | 'intersections'): TextMark => {
	const { label, style } = props;

	return {
		type: 'text',
		from: { data: dataSource },
		interactive: false,
		encode: {
			enter: {
				x: { field: 'textX' },
				y: { field: 'textY' },
				text: { field: `table_data.${label}` },
				fontSize: { value: style.fontSize },
        opacity: getMarkOpacity(props),
				fill: { value: style.color },
				fontWeight: { value: style?.fontWeight },
				align: { value: 'center' },
				baseline: { value: 'middle' },
			},
		},
	};
};

export const getInterserctionMark = (props: VennSpecProps, popovers: ChartPopoverSpecProps[]): PathMark => {
	const { name, children, colorScheme } = props;

	return {
		type: 'path',
		from: { data: 'intersections' },
		name: `${name}_intersections`,
		encode: {
			enter: {
				path: { field: 'path' },
				fill: { value: getColorValue('static-blue', colorScheme) },
				tooltip: getTooltip(children, `${name}`),
			},

			update: {
				fillOpacity: getMarkOpacity(props, 0, 0.7),
				cursor: popovers.length ? { value: 'pointer' } : undefined,
			},
		},
	};
};

export const getStrokeMark = (props: VennSpecProps): SymbolMark => {
	return {
		type: 'symbol',
		name: `${props.name}_stroke`,
		from: { data: 'circles' },
		interactive: false,
		encode: {
			enter: {
				x: { field: 'x' },
				y: { field: 'y' },
				size: { field: 'strokeSize' },
				shape: { value: 'circle' },
				stroke: getColorProductionRule('set_id', props.colorScheme),
			},
			update: {
				fill: getColorProductionRule('set_id', props.colorScheme),
				strokeWidth: { value: 1 },
				fillOpacity: { value: 0 },
				opacity: getMarkOpacity(props),
			},
		},
	};
};

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
import { COLOR_SCALE, DEFAULT_COLOR_SCHEME, TABLE } from '@constants';
import { getTooltipProps, hasInteractiveChildren } from '@specBuilder/marks/markUtils';
import { addFieldToFacetScaleDomain } from '@specBuilder/scale/scaleSpecBuilder';
import { addHighlightedItemSignalEvents } from '@specBuilder/signal/signalSpecBuilder';
import { sanitizeMarkChildren, toCamelCase } from '@utils';
import { produce } from 'immer';
import { Data, FilterTransform, FormulaTransform, LookupTransform, Mark, Scale, Signal, Spec } from 'vega';

import type { ChartData, ColorScheme, HighlightedItem, VennSpecProps } from '../../types';
import { VennProps } from '../../types';
import {
	DEFAULT_LABEL,
	DEFAULT_VENN_COLOR,
	DEFAULT_VENN_METRIC,
	DEFAULT_VENN_STYLES,
	SET_ID_DELIMITER,
} from './vennDefaults';
import {
	getCircleMark,
	getInterserctionMark,
	getCircleOverlays,
	getStrokeMark,
	getTextMark,
	getVennSolution,
	mergeStylesWithDefaults,
} from './vennUtils';

export const addVenn = produce<
	Spec,
	[
		VennProps & {
			colorScheme?: ColorScheme;
			highlightedItem?: HighlightedItem;
			index?: number;
			idKey: string;
			data: ChartData[];
			chartWidth?: number | undefined;
			chartHeight?: number | undefined;
		}
	]
>(
	(
		spec,
		{
			orientation = '0deg',
			name,
			metric = DEFAULT_VENN_METRIC,
			children,
			index = 0,
			color = DEFAULT_VENN_COLOR,
			colorScheme = DEFAULT_COLOR_SCHEME,
			data,
			chartWidth = 100,
			chartHeight = 100,
			style = DEFAULT_VENN_STYLES,
			label = DEFAULT_LABEL,
			...props
		}
	) => {
		const vennProps: VennSpecProps = {
			children: sanitizeMarkChildren(children),
			name: toCamelCase(name ?? `venn${index}`),
			dimension: 'venn',
			markType: 'venn',
			index,
			colorScheme,
			color,
			label,
			orientation,
			data,
			metric,
			chartHeight,
			chartWidth,
			style: mergeStylesWithDefaults(style),
			...props,
		};
		spec.data = addData(spec.data ?? [], vennProps);
		spec.signals = addSignals(spec.signals ?? [], vennProps);
		spec.scales = addScales(spec.scales ?? []);
		spec.marks = addMarks(spec.marks ?? [], vennProps);
	}
);

export const addData = produce<Data[], [VennSpecProps]>((data, props) => {
	const { circles, intersections } = getVennSolution(props);

	data.push({
		name: 'circles',
		values: circles,
		transform: [
			...getTableJoinTransforms(),
			{ type: 'formula', as: 'strokeSize', expr: 'datum.size * 1' },
			{ type: 'filter', expr: 'indexof(hiddenSeries, datum.table_data.rscSeriesId) === -1' },
		],
	});

	data.push({
		name: 'intersections',
		values: intersections,
		transform: getTableJoinTransforms(),
	});

	const tableIndex = data.findIndex((d) => d.name === TABLE);
	data[tableIndex].transform = data[tableIndex].transform ?? [];
	data[tableIndex].transform?.push(...getTableTransforms(props));
});

export const addMarks = produce<Mark[], [VennSpecProps]>((marks, props) => {
	marks.push(getStrokeMark(props));
	marks.push(getCircleMark(props));
	marks.push(getCircleOverlays(props));
	marks.push(getInterserctionMark(props));
	marks.push(getTextMark(props, 'circles'), getTextMark(props, 'intersections'));
});

export const addScales = produce<Scale[]>((scales) => {
	addFieldToFacetScaleDomain(scales, COLOR_SCALE, 'set_legend');
});

export const getTableTransforms = (props: VennSpecProps): (FormulaTransform | FilterTransform)[] => [
	{
		type: 'formula',
		as: 'set_id',
		expr: `join(datum.${props.color}, '${SET_ID_DELIMITER}')`,
	},
	{
		type: 'formula',
		as: 'set_legend',
		expr: `length(datum.${props.color}) > 1 ? datum.${props.color}[0]: join(datum.${props.color}, '${SET_ID_DELIMITER}')`,
	},
];

export const getTableJoinTransforms = (): (LookupTransform | FormulaTransform)[] => [
	{
		type: 'lookup',
		key: 'set_id',
		fields: ['set_id'],
		from: TABLE,
		as: ['table_data'],
	},
	{ type: 'formula', as: 'rscSeriesId', expr: 'datum.table_data.set_id' },
	{ type: 'formula', expr: 'datum.table_data.rscMarkId', as: 'rscMarkId' },
];

export const addSignals = produce<Signal[], [VennSpecProps]>((signals, props) => {
	const { children, name, idKey } = props;

	if (!hasInteractiveChildren(children)) return;
	addHighlightedItemSignalEvents(signals, name, idKey, 1, getTooltipProps(children)?.excludeDataKeys);
	addHighlightedItemSignalEvents(
		signals,
		`${name}_intersections`,
		idKey,
		1,
		getTooltipProps(children)?.excludeDataKeys
	);
});

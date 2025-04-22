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
import { ChartPopover } from '@components/ChartPopover';
import { ChartTooltip } from '@components/ChartTooltip';
import { Legend } from '@components/Legend';
import { Venn } from '@components/Venn';
import useChartProps from '@hooks/useChartProps';
import { StoryFn } from '@storybook/react';
import { bindWithProps } from '@test-utils';
import { Chart } from 'Chart';

import { Content } from '@adobe/react-spectrum';

import { ChartProps, VennProps } from '../../../types';

export default {
	title: 'RSC/Venn/Usability test',
	component: Venn,
};

const defaultChartProps: ChartProps = {
	data: [
		{ regions: ['A'], radius: 6, percentage: '50%', label: 'A' },
		{ regions: ['B'], radius: 6, percentage: '50%', label: 'B' },
		{ regions: ['A', 'B'], radius: 1, percentage: '20%' },
	],

	height: 350,
	width: 350,
};

const BasicVennStory: StoryFn<VennProps> = (args) => {
	const chartProps = useChartProps({ ...defaultChartProps });
	return (
		<Chart {...chartProps} debug>
			<Venn {...args} orientation={Math.PI / 2} metric="radius" setField="regions">
				<ChartTooltip>
					{(datum) => (
						<Content>
							<div>{datum.set_id}</div>
						</Content>
					)}
				</ChartTooltip>
				<ChartPopover>
					{(datum) => (
						<Content>
							<div>{datum.set_id}</div>
							<div>{datum.table_data.percentage}</div>
						</Content>
					)}
				</ChartPopover>
			</Venn>
			<Legend highlight />
		</Chart>
	);
};

const Basic = bindWithProps(BasicVennStory);

export { Basic };

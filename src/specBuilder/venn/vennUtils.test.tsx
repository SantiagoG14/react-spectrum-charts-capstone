/*
 * Copyright 2024 Adobe. All rights reserved.
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
    defaultVennProps,
    data as vennData 
} from './vennTestUtils';

import {
    getVennSolution,
    mapDataForVennHelper,
    mergeStylesWithDefaults,
    getSelectedCircleMark,
    getCircleMark,
    getTextMark,
    getInterserctionMark,
    getStrokeMark
} from './vennUtils'

describe('getVennSolution', () => {
    test('should return the correct object structure with defaultVennProps', () => {
        const vennSolution = getVennSolution(defaultVennProps);
        expect(vennSolution).toHaveProperty('circles');
        expect(vennSolution).toHaveProperty('intersections');
        expect(vennSolution).toHaveProperty('allIntersections');

    });

    test('should return empty arrays when no data is provided', () => {
        const vennSolution = getVennSolution({ ...defaultVennProps, data: [] });
        expect(vennSolution.circles).toEqual([]);
        expect(vennSolution.intersections).toEqual([]);
        expect(vennSolution.allIntersections).toEqual([]);
    });

    test('should return correct data for one circle', () => {
        const vennSolution = getVennSolution({ ...defaultVennProps, data: [{regions: ["A"], radius: 12}] });
        // Checking for correct length of arrays
        expect(vennSolution.circles).toHaveLength(1);
        expect(vennSolution.intersections).toHaveLength(0);
        expect(vennSolution.allIntersections).toHaveLength(1);

        // Checking for correct properties cirles array for only circle
        expect(vennSolution.circles[0]).toHaveProperty('set_id', 'A');
        expect(vennSolution.circles[0]).toHaveProperty('size');
        expect(vennSolution.circles[0]).toHaveProperty('x');
        expect(vennSolution.circles[0]).toHaveProperty('y');
        expect(vennSolution.circles[0]).toHaveProperty('textX');
        expect(vennSolution.circles[0]).toHaveProperty('textY');

        // Checking for correct properties intersections array for only circle
        expect(vennSolution.allIntersections[0]).toHaveProperty('set_id', 'A');
        expect(vennSolution.allIntersections[0]).toHaveProperty('sets');
        expect(vennSolution.allIntersections[0]).toHaveProperty('path');
        expect(vennSolution.allIntersections[0]).toHaveProperty('textX');
        expect(vennSolution.allIntersections[0]).toHaveProperty('textY');
        expect(vennSolution.allIntersections[0]).toHaveProperty('size', 12);
    });

    test('should return data for vennData with multiple circles and intersections', () => {
        const vennSolution = getVennSolution({ ...defaultVennProps, data: vennData ?? [] });
        // Checking for correct length of arrays
        
        expect(vennSolution.circles).toHaveLength(4);
        expect(vennSolution.intersections).toHaveLength(5);
        expect(vennSolution.allIntersections).toHaveLength(9);

        // 
        const firstCircle = vennSolution.circles[0];
        expect(firstCircle).toHaveProperty('set_id');
        expect(firstCircle).toHaveProperty('x');
        expect(firstCircle).toHaveProperty('y');
        expect(firstCircle).toHaveProperty('size');
        expect(firstCircle).toHaveProperty('textX');
        expect(firstCircle).toHaveProperty('textY');


        // Check intersection properties 
        const firstIntersection = vennSolution.intersections[0];
        expect(firstIntersection).toHaveProperty('set_id');
        expect(firstIntersection).toHaveProperty('sets');
        expect(Array.isArray(firstIntersection.sets)).toBe(true);
        expect(firstIntersection.sets.length).toBeGreaterThan(1);
        expect(firstIntersection).toHaveProperty('path');
        expect(firstIntersection).toHaveProperty('textX');
        expect(firstIntersection).toHaveProperty('textY');
        expect(firstIntersection).toHaveProperty('size');

        expect(vennSolution.allIntersections).toContainEqual(firstIntersection);
        
        // Check specific intersection properties if you know them
        // For example, if you know intersection between sets A and B exists:
        const abIntersection = vennSolution.intersections.find(
        i => i.sets.includes('Instagram') && i.sets.includes('X') && i.sets.length === 2
        );
        expect(abIntersection).toBeDefined();
    });

    test("should still give solution with orienation undefined in props", () => {
        const vennSolution = getVennSolution({ ...defaultVennProps, data: vennData ?? [], orientation: undefined });
        expect(vennSolution).toBeDefined()
    })

    test("should give correct data for two disjoint sets", () => {
        const vennSolution = getVennSolution({ ...defaultVennProps, data: [{regions: ["A"], radius: 12}, {regions: ['B'], radius:10}] });

        expect(vennSolution.circles).toHaveLength(2);
        expect(vennSolution.intersections).toHaveLength(0);
        expect(vennSolution.allIntersections).toHaveLength(2);
    })
})

// TO-DO: Maybe done since already going into branches to sanitize props for datum
describe('mapDataForVennHelper', () => {
    test('should return the correct object structure without modifying metric or color props', () => {
        
        // Might always go into the if statement branches because of the defaultVennProps
        const parsedData = mapDataForVennHelper({ ...defaultVennProps, data: vennData ?? [] })

        expect(parsedData).toHaveLength(9)

        const firstItem = parsedData[0]
        expect(firstItem).toHaveProperty('size')
        expect(firstItem).toHaveProperty('sets')

        expect(typeof firstItem.size).toBe('number')
        expect(Array.isArray(firstItem.sets)).toBe(true)
    })

    test('should throw error when giving an undefined metric prop', () => {
        expect(() => {
            mapDataForVennHelper({ ...defaultVennProps, data: vennData ?? [], metric: "fake" })
        }).toThrow()
    })

    test('should throw error when giving an undefined color prop', () => {
        expect(() => {
            mapDataForVennHelper({ ...defaultVennProps, data: vennData ?? [], color: "fake" })
        }).toThrow()
    })
})

describe('mergeStylesWithDefaults', () => {
    test('should set default styling when calling with undefined style', () => {
        const defaultStyles = mergeStylesWithDefaults({})

        expect(defaultStyles).toHaveProperty('fontSize')
        expect(defaultStyles).toHaveProperty('padding')
        expect(defaultStyles).toHaveProperty('fontWeight')
        expect(defaultStyles).toHaveProperty('intersectionFill')
        expect(defaultStyles).toHaveProperty('color')
    })

})

describe('getSelectedCircleMark', () => {
    test('should return a full selected cirlce mark when given defaultVennProps', () => {
        const selectedCircleMark = getSelectedCircleMark(defaultVennProps)

        expect(selectedCircleMark).toBeDefined()
        expect(selectedCircleMark).toHaveProperty('type', 'symbol')
        expect(selectedCircleMark).toHaveProperty('name')
        expect(selectedCircleMark).toHaveProperty('from')
        expect(selectedCircleMark).toHaveProperty('interactive', false)
        expect(selectedCircleMark).toHaveProperty('encode')

    })
})

describe('getCircleMark', () => {
    test('should return full circle mark when given defaultVennProps', () => {
        const circleMark = getCircleMark(defaultVennProps)

        expect(circleMark).toBeDefined()
        expect(circleMark).toHaveProperty('type', 'symbol')
        expect(circleMark).toHaveProperty('name')
        expect(circleMark).toHaveProperty('from')
        expect(circleMark).toHaveProperty('encode')
    })
})

describe('getTextMark', () => {
    test('should return full text mark with data property being set to circles', () => {
        const textMark = getTextMark(defaultVennProps, 'circles')

        expect(textMark).toBeDefined()
        expect(textMark).toHaveProperty('type', 'text')
        expect(textMark).toHaveProperty('from')
        expect(textMark.from).toHaveProperty('data', 'circles')
        expect(textMark).toHaveProperty('interactive')
        expect(textMark).toHaveProperty('encode')
    })
})


describe('getInterserctionMark', () => {
    test('should return full intersection text mark with defaultVennProps and check for given name being in name prop', () => {
        const intersectionTextMark = getInterserctionMark(defaultVennProps)

        expect(intersectionTextMark).toBeDefined()
        expect(intersectionTextMark).toHaveProperty('type', 'path')
        expect(intersectionTextMark).toHaveProperty('from')
        expect(intersectionTextMark.from).toHaveProperty('data', 'intersections')
        expect(intersectionTextMark).toHaveProperty('name', 'venn_intersections')
        expect(intersectionTextMark).toHaveProperty('encode')
    })
})

describe('getStrokeMark', () => {
    test('should return full text mark with data property being set to circles', () => {
        const textMark = getStrokeMark(defaultVennProps)

        expect(textMark).toBeDefined()
        expect(textMark).toHaveProperty('type', 'symbol')
        expect(textMark).toHaveProperty('from')
        expect(textMark.from).toHaveProperty('data', 'circles')
        expect(textMark).toHaveProperty('interactive')
        expect(textMark).toHaveProperty('encode')
    })
})

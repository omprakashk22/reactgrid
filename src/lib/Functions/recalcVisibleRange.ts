import { Range } from '../Model/Range';
import { State } from '../Model/State';
import { GridColumn, GridRow } from '../Model/InternalModel';
import { getScrollOfScrollableElement } from './scrollHelpers';
import { getVisibleSizeOfReactGrid, getReactGridOffsets, getStickyOffset } from './elementSizeHelpers';

export const VS_PAGE_HEIGHT = 400;
export const VS_PAGE_WIDTH = 300;
const ADDITONAL_INDEX = 1; // is needed for getting last element in array

export function recalcVisibleRange(state: State): State {
    /**
     * Here was disabled virtual rendering by selecting whole cell matrix as visible range in a quick way,
     * TODO: remove all unused code e.g. getting scrollable element, calculating visible size etc...
     */
    const visibleRange = new Range(state.cellMatrix.rows, state.cellMatrix.columns);
    return {
        ...state,
        visibleRange
    };
}

export function getVisibleScrollableSize(state: State, heights: number[], widths: number[]): { height: number, width: number } {
    const { height, width } = getVisibleSizeOfReactGrid(state);
    const sum = (a: number, b: number) => a + b;
    return {
        height: Math.max(heights.reduce(sum, height), 0),
        width: Math.max(widths.reduce(sum, width), 0)
    }
}

export function getVisibleColumns(state: State, scrollableWidth: number): GridColumn[] {
    const { columns } = state.cellMatrix.scrollableRange;
    const { left } = getReactGridOffsets(state);
    const { scrollLeft } = getScrollOfScrollableElement(state.scrollableElement);
    const firstIndex = Math.max(colBinarySearch(columns, scrollLeft - left - VS_PAGE_WIDTH) - ADDITONAL_INDEX - 1, 0);
    const lastIndex = colBinarySearch(columns, scrollableWidth + getStickyOffset(scrollLeft, left) + VS_PAGE_WIDTH, firstIndex);
    return columns.slice(firstIndex, lastIndex + ADDITONAL_INDEX);
}

export function getVisibleRows(state: State, scrollableHeight: number): GridRow[] {
    const { rows } = state.cellMatrix.scrollableRange;
    const { top } = getReactGridOffsets(state);
    const { scrollTop } = getScrollOfScrollableElement(state.scrollableElement);
    const firstIndex = Math.max(rowBinarySearch(rows, scrollTop - top - VS_PAGE_HEIGHT) - ADDITONAL_INDEX - 1, 0);
    const lastIndex = rowBinarySearch(rows, scrollableHeight + getStickyOffset(scrollTop, top) + VS_PAGE_HEIGHT, firstIndex);
    return rows.slice(firstIndex, lastIndex + ADDITONAL_INDEX);
}

function rowBinarySearch(arr: GridRow[], val: number, start = 0, end = arr.length - 1): number {
    const mid = (start + end) >> 1;
    if (mid < 0)
        return 0;
    if (start >= end)
        return mid;
    return val < arr[mid].top
        ? rowBinarySearch(arr, val, start, mid)
        : rowBinarySearch(arr, val, mid + 1, end);
}

function colBinarySearch(arr: GridColumn[], val: number, start = 0, end = arr.length - 1): number {
    const mid = (start + end) >> 1;
    if (mid < 0)
        return 0;
    if (start >= end)
        return mid;
    return val < arr[mid].left
        ? colBinarySearch(arr, val, start, mid)
        : colBinarySearch(arr, val, mid + 1, end);
}

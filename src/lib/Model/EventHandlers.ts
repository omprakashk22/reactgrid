import { recalcVisibleRange } from '../Functions/recalcVisibleRange';
import { getScrollableParent, getScrollOfScrollableElement } from '../Functions/scrollHelpers';
import { getVisibleSizeOfReactGrid } from '../Functions/elementSizeHelpers';
import { AbstractPointerEventsController } from './AbstractPointerEventsController';
import { StateModifier, StateUpdater } from './State';
import { PointerEvent, KeyboardEvent, ClipboardEvent, FocusEvent } from './domEventsTypes';
import { updateResponsiveSticky } from '../Functions/updateResponsiveSticky';

export class EventHandlers {

    constructor(public updateState: StateUpdater, public pointerEventsController: AbstractPointerEventsController) { }

    pointerDownHandler = (event: PointerEvent): void => this.updateState(state => this.pointerEventsController.handlePointerDown(event, state));
    keyDownHandler = (event: KeyboardEvent): void => this.updateState(state => state.currentBehavior.handleKeyDown(event, state));
    keyUpHandler = (event: KeyboardEvent): void => this.updateState(state => state.currentBehavior.handleKeyUp(event, state));
    copyHandler = (event: ClipboardEvent): void => this.updateState(state => state.currentBehavior.handleCopy(event, state));
    pasteHandler = (event: ClipboardEvent): void => this.updateState(state => state.currentBehavior.handlePaste(event, state));
    cutHandler = (event: ClipboardEvent): void => this.updateState(state => state.currentBehavior.handleCut(event, state));
    blurHandler = (event: FocusEvent): void => this.updateState(state => {
        if ((event.target as HTMLInputElement)?.id.startsWith('react-select-')) { // give back focus on react-select dropdown blur
            state.hiddenFocusElement?.focus({ preventScroll: true });
        }
        return state;
    });
    windowResizeHandler = (): void => this.updateState(recalcVisibleRange);
    reactgridRefHandler = (reactGridElement: HTMLDivElement): void => this.assignElementsRefs(reactGridElement, recalcVisibleRange);
    hiddenElementRefHandler = (hiddenFocusElement: HTMLInputElement): void => this.updateState(state => {
        if (state.props?.initialFocusLocation && hiddenFocusElement) {
            hiddenFocusElement.focus({ preventScroll: true });
        }
        state.hiddenFocusElement = hiddenFocusElement;
        return state;
    });

    pasteCaptureHandler = (event: ClipboardEvent): void => {
        const htmlData = event.clipboardData.getData('text/html');
        const parsedData = new DOMParser().parseFromString(htmlData, 'text/html');
        if (htmlData && parsedData.body.firstElementChild?.getAttribute('data-reactgrid') === 'reactgrid-content') {
            event.bubbles = false;
        }
    };

    protected scrollHandlerInternal = (visibleRangeCalculator: StateModifier): void => {
        try {
            return this.updateOnScrollChange(visibleRangeCalculator);
        } catch (error) {
            console.error(error);
        }
    };

    scrollHandler: () => void = () => this.scrollHandlerInternal(recalcVisibleRange);

    protected assignElementsRefs = (reactGridElement: HTMLDivElement, visibleRangeCalculator: StateModifier): void => {
        if (reactGridElement) {
            this.updateState(state => {
                const scrollableElement = getScrollableParent(reactGridElement, true);
                if (state.props) {
                    state = updateResponsiveSticky(state.props, state);
                }
                return visibleRangeCalculator({ ...state, reactGridElement, scrollableElement });
            });
        }
    }

    protected updateOnScrollChange = (visibleRangeCalculator: StateModifier): void => {
        this.updateState(visibleRangeCalculator);
    }
}

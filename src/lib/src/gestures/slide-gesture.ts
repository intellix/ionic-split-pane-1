import { PanGesture } from './pan-gesture';
import { clamp, assert } from '../util/util';
import { Platform } from '../platform/platform';
import { pointerCoord } from '../util/dom';

/**
 * @private
 */
export class SlideGesture extends PanGesture {
  public slide: SlideData = null;

  constructor(plt: Platform, element: HTMLElement, opts = {}) {
    super(plt, element, opts);
  }

  /*
   * Get the min and max for the slide. pageX/pageY.
   * Only called on dragstart.
   */
  getSlideBoundaries(slide: SlideData, ev: any) {
    return {
      min: 0,
      max: this.getNativeElement().offsetWidth,
    };
  }

  /*
   * Get the element's pos when the drag starts.
   * For example, an open side menu starts at 100% and a closed
   * sidemenu starts at 0%.
   */
  getElementStartPos(slide: SlideData, ev: any) {
    return 0;
  }

  onDragStart(ev: any) {
    this.onSlideBeforeStart(ev);
    const coord = <any>pointerCoord(ev);
    const pos = coord[this.direction];

    this.slide = {
      min: 0,
      max: 0,
      pointerStartPos: pos,
      pos: pos,
      timestamp: Date.now(),
      elementStartPos: 0,
      started: true,
      delta: 0,
      distance: 0,
      velocity: 0,
    };

    // TODO: we should run this in the next frame
    const {min, max} = this.getSlideBoundaries(this.slide, ev);
    this.slide.min = min;
    this.slide.max = max;
    this.slide.elementStartPos = this.getElementStartPos(this.slide, ev);
    this.onSlideStart(this.slide, ev);
  }

  onDragMove(ev: any) {
    const slide: SlideData = this.slide;
    assert(slide.min !== slide.max, 'slide data must be properly initialized');

    const coord = <any>pointerCoord(ev);
    const newPos = coord[this.direction];
    const newTimestamp = Date.now();
    const velocity = (newPos - slide.pos) / (newTimestamp - slide.timestamp);

    slide.pos = newPos;
    slide.timestamp = newTimestamp;
    slide.distance = clamp(
      slide.min,
      newPos - slide.pointerStartPos + slide.elementStartPos,
      slide.max,
    );
    slide.velocity = velocity;
    slide.delta = newPos - slide.pointerStartPos;
    this.onSlide(slide, ev);
  }

  onDragEnd(ev: any) {
    this.onSlideEnd(this.slide, ev);
    this.slide = null;
  }

  onSlideBeforeStart(ev?: any): void {}
  onSlideStart(slide?: SlideData, ev?: any): void {}
  onSlide(slide?: SlideData, ev?: any): void {}
  onSlideEnd(slide?: SlideData, ev?: any): void {}
}

/**
 * @private
 */
export interface SlideData {
  min: number;
  max: number;
  distance: number;
  delta: number;
  started: boolean;
  pos: any;
  timestamp: number;
  pointerStartPos: number;
  elementStartPos: number;
  velocity: number;
}

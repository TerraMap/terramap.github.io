interface PanzoomOptions {
  cursor?: string;
  maxScale?: number;
  increment?: number;
  minScale?: number;
  contain?: string | boolean;
  startTransform?: string;
  $zoomIn?: JQuery;
  $zoomOut?: JQuery;
  $zoomRange?: JQuery;
  $reset?: JQuery;
}

interface JQuery {
  panzoom(options?: PanzoomOptions | string, ...args: any[]): any;
}

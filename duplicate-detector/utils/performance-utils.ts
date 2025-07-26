// Performance monitoring utilities

/**
 * Performance timer for measuring execution time
 */
export class PerformanceTimer {
  private startTime: number = 0;
  private endTime: number = 0;
  private measurements: Map<string, number> = new Map();

  /**
   * Starts the timer
   */
  start(): void {
    this.startTime = performance.now();
  }

  /**
   * Stops the timer and returns elapsed time in milliseconds
   */
  stop(): number {
    this.endTime = performance.now();
    return this.getElapsedTime();
  }

  /**
   * Gets the elapsed time without stopping the timer
   */
  getElapsedTime(): number {
    const end = this.endTime || performance.now();
    return end - this.startTime;
  }

  /**
   * Records a measurement with a label
   */
  measure(label: string): void {
    this.measurements.set(label, this.getElapsedTime());
  }

  /**
   * Gets all measurements
   */
  getMeasurements(): Record<string, number> {
    return Object.fromEntries(this.measurements);
  }

  /**
   * Resets the timer
   */
  reset(): void {
    this.startTime = 0;
    this.endTime = 0;
    this.measurements.clear();
  }
}

/**
 * Memory usage monitor
 */
export class MemoryMonitor {
  private initialMemory: NodeJS.MemoryUsage;

  constructor() {
    this.initialMemory = process.memoryUsage();
  }

  /**
   * Gets current memory usage
   */
  getCurrentUsage(): NodeJS.MemoryUsage {
    return process.memoryUsage();
  }

  /**
   * Gets memory usage delta from initialization
   */
  getUsageDelta(): {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  } {
    const current = this.getCurrentUsage();
    return {
      rss: current.rss - this.initialMemory.rss,
      heapTotal: current.heapTotal - this.initialMemory.heapTotal,
      heapUsed: current.heapUsed - this.initialMemory.heapUsed,
      external: current.external - this.initialMemory.external,
      arrayBuffers: current.arrayBuffers - this.initialMemory.arrayBuffers
    };
  }

  /**
   * Formats memory usage in human-readable format
   */
  formatMemoryUsage(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  /**
   * Checks if memory usage exceeds threshold
   */
  isMemoryUsageHigh(thresholdMB: number = 500): boolean {
    const current = this.getCurrentUsage();
    const heapUsedMB = current.heapUsed / (1024 * 1024);
    return heapUsedMB > thresholdMB;
  }
}

/**
 * Utility for measuring async function performance
 */
export async function measureAsync<T>(
  fn: () => Promise<T>,
  label?: string
): Promise<{ result: T; duration: number; memory: NodeJS.MemoryUsage }> {
  const timer = new PerformanceTimer();
  const memoryBefore = process.memoryUsage();

  timer.start();
  const result = await fn();
  const duration = timer.stop();
  const memoryAfter = process.memoryUsage();

  if (label) {
    console.log(`${label}: ${duration.toFixed(2)}ms`);
  }

  return {
    result,
    duration,
    memory: {
      rss: memoryAfter.rss - memoryBefore.rss,
      heapTotal: memoryAfter.heapTotal - memoryBefore.heapTotal,
      heapUsed: memoryAfter.heapUsed - memoryBefore.heapUsed,
      external: memoryAfter.external - memoryBefore.external,
      arrayBuffers: memoryAfter.arrayBuffers - memoryBefore.arrayBuffers
    }
  };
}

/**
 * Utility for measuring synchronous function performance
 */
export function measureSync<T>(
  fn: () => T,
  label?: string
): { result: T; duration: number; memory: NodeJS.MemoryUsage } {
  const timer = new PerformanceTimer();
  const memoryBefore = process.memoryUsage();

  timer.start();
  const result = fn();
  const duration = timer.stop();
  const memoryAfter = process.memoryUsage();

  if (label) {
    console.log(`${label}: ${duration.toFixed(2)}ms`);
  }

  return {
    result,
    duration,
    memory: {
      rss: memoryAfter.rss - memoryBefore.rss,
      heapTotal: memoryAfter.heapTotal - memoryBefore.heapTotal,
      heapUsed: memoryAfter.heapUsed - memoryBefore.heapUsed,
      external: memoryAfter.external - memoryBefore.external,
      arrayBuffers: memoryAfter.arrayBuffers - memoryBefore.arrayBuffers
    }
  };
}

/**
 * Debounce utility for performance optimization
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Throttle utility for performance optimization
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Factory pattern for creating performance monitors

import { PerformanceTimer, MemoryMonitor } from './performance-utils';

export interface PerformanceMonitor {
  start(): void;
  stop(): number;
  getMetrics(): Record<string, unknown>;
  reset(): void;
}

export class TimerMonitor implements PerformanceMonitor {
  private timer = new PerformanceTimer();

  start(): void {
    this.timer.start();
  }

  stop(): number {
    return this.timer.stop();
  }

  getMetrics(): Record<string, unknown> {
    return {
      elapsed: this.timer.getElapsedTime(),
      measurements: this.timer.getMeasurements()
    };
  }

  reset(): void {
    this.timer.reset();
  }
}

export class MemoryPerformanceMonitor implements PerformanceMonitor {
  private memoryMonitor = new MemoryMonitor();
  private startTime = 0;
  private endTime = 0;

  start(): void {
    this.startTime = performance.now();
  }

  stop(): number {
    this.endTime = performance.now();
    return this.endTime - this.startTime;
  }

  getMetrics(): Record<string, unknown> {
    return {
      elapsed: this.endTime - this.startTime,
      memoryUsage: this.memoryMonitor.getCurrentUsage(),
      memoryDelta: this.memoryMonitor.getUsageDelta(),
      isHighMemory: this.memoryMonitor.isMemoryUsageHigh()
    };
  }

  reset(): void {
    this.startTime = 0;
    this.endTime = 0;
  }
}

export class CompositePerformanceMonitor implements PerformanceMonitor {
  private timer = new TimerMonitor();
  private memory = new MemoryPerformanceMonitor();

  start(): void {
    this.timer.start();
    this.memory.start();
  }

  stop(): number {
    const timerResult = this.timer.stop();
    this.memory.stop();
    return timerResult;
  }

  getMetrics(): Record<string, unknown> {
    return {
      ...this.timer.getMetrics(),
      ...this.memory.getMetrics()
    };
  }

  reset(): void {
    this.timer.reset();
    this.memory.reset();
  }
}

export type MonitorType = 'timer' | 'memory' | 'composite';

export class PerformanceMonitorFactory {
  static create(type: MonitorType): PerformanceMonitor {
    switch (type) {
      case 'timer':
        return new TimerMonitor();
      case 'memory':
        return new MemoryPerformanceMonitor();
      case 'composite':
        return new CompositePerformanceMonitor();
      default:
        throw new Error(`Unknown monitor type: ${type}`);
    }
  }
}

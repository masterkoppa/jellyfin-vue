/**
 * Utility for converting time between ticks and milliseconds, and formatting dates
 *
 * @mixin
 */
import Vue from 'vue';

/**
 * Converts .NET ticks to milliseconds
 *
 * @param {(number | null | undefined)} ticks - Number of .NET ticks to convert
 * @returns {number} The converted value in milliseconds
 */
export function ticksToMs(ticks: number | null | undefined): number {
  if (!ticks) {
    ticks = 0;
  }
  return Math.round(ticks / 10000);
}

/**
 * Converts milliseconds to .NET ticks
 *
 * @param {string} ms - Number of milliseconds to convert
 * @returns {number} The converted value in .NET ticks
 */
export function msToTicks(ms: number): number {
  return Math.round(ms * 10000);
}

declare module '@nuxt/types' {
  interface Context {
    ticksToMs: (ticks: number) => number;
    msToTicks: (ms: number) => number;
    formatTime: (seconds: number) => number;
    formatDateTime: (date: Date) => string;
  }

  interface NuxtAppOptions {
    ticksToMs: (ticks: number) => number;
    msToTicks: (ms: number) => number;
    formatTime: (seconds: number) => number;
    formatDateTime: (date: Date) => string;
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    ticksToMs: (ticks: number | null | undefined) => number;
    msToTicks: (ms: number) => number;
    formatTime: (seconds: number) => number;
    formatDateTime: (date: Date) => string;
  }
}

const dateTimeUtils = Vue.extend({
  methods: {
    /**
     * Converts .NET ticks to milliseconds
     *
     * @param {(number | null | undefined)} ticks - Number of .NET ticks to convert
     * @returns {number} The converted value in milliseconds
     */
    ticksToMs(ticks: number | null | undefined): number {
      return ticksToMs(ticks);
    },
    /**
     * Converts milliseconds to .NET ticks
     *
     * @param {string} ms - Number of milliseconds to convert
     * @returns {number} The converted value in .NET ticks
     */
    msToTicks(ms: number): number {
      return msToTicks(ms);
    },
    formatTime(seconds: number): string {
      let minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      minutes = minutes - hours * 60;
      seconds = Math.floor(seconds - (minutes * 60 + hours * 60 * 60));

      /**
       * Formats Time
       * E.g. 7 -> 07
       *
       * @param {number} number - Number to format
       * @returns {string} Formated seconds number
       */
      function formatDigits(number: number): string {
        return ('0' + number).slice(-2);
      }

      if (hours) {
        return `${hours}:${formatDigits(minutes)}:${formatDigits(seconds)}`;
      } else {
        return `${minutes}:${formatDigits(seconds)}`;
      }
    },
    /**
     * Formats Dates
     * E.g. 01-01-2021 01:00 (input) 01-01-2021 13:00 (current)
     *      returns 12 hours ago
     *      If the date passed is more than 7 days ago
     *      E.g. 01-01-2021 01:00 (input) 10-01-2021 13:00 (current)
     *      return 01:00 01/01/2021
     *
     * @param {Date} date - Date to be formatted
     * @returns {string} Formatted Date
     */
    formatDateTime(date: Date): string {
      if (
        this.$dateFns.isAfter(
          this.$dateFns.parseJSON(date),
          this.$dateFns.subDays(new Date(), 7)
        )
      ) {
        return this.$dateFns.formatRelative(
          this.$dateFns.parseJSON(date),
          new Date()
        );
      }
      return this.$dateFns.format(
        this.$dateFns.parseJSON(date),
        'HH:mm dd/MM/yy'
      );
    }
  }
});

export default dateTimeUtils;

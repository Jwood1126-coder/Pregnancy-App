import test from 'node:test';
import assert from 'node:assert/strict';

import {
  formatLength,
  formatWeight,
  basisLabel,
  trimesterLabel,
  formatDaysToGo
} from '../app/js/lib/units.js';

test('formatLength in US units', () => {
  assert.equal(formatLength(130, 'us'), '5.1 in'); // week 17
  assert.equal(formatLength(256, 'us'), '10.1 in'); // week 20
  assert.equal(formatLength(512, 'us'), '20.2 in'); // week 40
  assert.equal(formatLength(25.4, 'us'), '1.0 in');
  // Under an inch we keep two decimals so the earliest weeks aren't "0.0 in".
  assert.equal(formatLength(1, 'us'), '0.04 in'); // week 4
  assert.equal(formatLength(6, 'us'), '0.24 in'); // week 6
  assert.equal(formatLength(0, 'us'), '0.00 in');
});

test('formatLength in metric units', () => {
  assert.equal(formatLength(130, 'metric'), '13.0 cm');
  assert.equal(formatLength(256, 'metric'), '25.6 cm');
  assert.equal(formatLength(512, 'metric'), '51.2 cm');
  assert.equal(formatLength(1, 'metric'), '0.1 cm');
  assert.equal(formatLength(0, 'metric'), '0.0 cm');
});

test('formatLength defaults to US and refuses junk', () => {
  assert.equal(formatLength(130), '5.1 in');
  assert.equal(formatLength(Number.NaN, 'us'), '—');
  assert.equal(formatLength(-1, 'metric'), '—');
  assert.equal(formatLength(undefined, 'us'), '—');
});

test('formatWeight in US units', () => {
  // Below an ounce we say so in words rather than printing 0.0.
  assert.equal(formatWeight(0.5, 'us'), 'less than an ounce'); // weeks 4–7
  assert.equal(formatWeight(14, 'us'), 'less than an ounce'); // week 12
  assert.equal(formatWeight(28, 'us'), 'less than an ounce');
  assert.equal(formatWeight(29, 'us'), '1.0 oz');
  assert.equal(formatWeight(140, 'us'), '4.9 oz'); // week 17
  assert.equal(formatWeight(300, 'us'), '10.6 oz'); // week 20
  // A pound and over reads the way people say it out loud.
  assert.equal(formatWeight(500, 'us'), '1 lb 2 oz');
  assert.equal(formatWeight(1005, 'us'), '2 lb 3 oz'); // week 28
  assert.equal(formatWeight(3460, 'us'), '7 lb 10 oz'); // week 40
  assert.equal(formatWeight(3700, 'us'), '8 lb 3 oz'); // week 42
  // Ounces that round to a full pound carry instead of reading "2 lb 16 oz".
  assert.equal(formatWeight(896, 'us'), '2 lb');
  assert.equal(formatWeight(453.59237, 'us'), '1 lb');
});

test('formatWeight in metric units', () => {
  assert.equal(formatWeight(0.5, 'metric'), 'less than a gram'); // weeks 4–7
  assert.equal(formatWeight(1, 'metric'), '1 g');
  assert.equal(formatWeight(140, 'metric'), '140 g');
  assert.equal(formatWeight(999, 'metric'), '999 g');
  assert.equal(formatWeight(1000, 'metric'), '1.00 kg');
  assert.equal(formatWeight(1005, 'metric'), '1.01 kg'); // week 28
  assert.equal(formatWeight(3460, 'metric'), '3.46 kg'); // week 40
  assert.equal(formatWeight(3700, 'metric'), '3.70 kg'); // week 42
});

test('formatWeight defaults to US and refuses junk', () => {
  assert.equal(formatWeight(140), '4.9 oz');
  assert.equal(formatWeight(Number.NaN, 'us'), '—');
  assert.equal(formatWeight(-2, 'metric'), '—');
  assert.equal(formatWeight(undefined, 'metric'), '—');
});

test('basisLabel always names the measurement on screen', () => {
  assert.equal(basisLabel('crown-rump'), 'head to bottom');
  assert.equal(basisLabel('crown-heel'), 'head to heel');
});

test('trimesterLabel reads as an ordinal', () => {
  assert.equal(trimesterLabel(1), '1st trimester');
  assert.equal(trimesterLabel(2), '2nd trimester');
  assert.equal(trimesterLabel(3), '3rd trimester');
});

test('formatDaysToGo counts down, then counts past', () => {
  assert.equal(formatDaysToGo(158), '158 days to go');
  assert.equal(formatDaysToGo(2), '2 days to go');
  assert.equal(formatDaysToGo(1), '1 day to go');
  assert.equal(formatDaysToGo(0), 'Due today');
  assert.equal(formatDaysToGo(-1), '1 day past your due date');
  assert.equal(formatDaysToGo(-9), '9 days past your due date');
  assert.equal(formatDaysToGo(Number.NaN), '');
});

test('formatWeight rounds before it picks the unit', () => {
  // 15.996 oz must not print as "16.0 oz" — it rounds into a pound.
  assert.equal(formatWeight(453.5, 'us'), '1 lb');
  assert.equal(formatWeight(453.59237, 'us'), '1 lb');
  assert.equal(formatWeight(452, 'us'), '15.9 oz');
  // 999.6 g must not print as "1000 g".
  assert.equal(formatWeight(999.6, 'metric'), '1.00 kg');
  assert.equal(formatWeight(999.4, 'metric'), '999 g');
});

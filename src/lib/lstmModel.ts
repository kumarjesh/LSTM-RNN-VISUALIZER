import { LstmWeights, PresetSequence, StepCalculation, OverrideValues } from '../types/lstm';

/**
 * Standard mathematical activation functions
 */
export function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, z))));
}

export function tanh(z: number): number {
  return Math.tanh(Math.max(-20, Math.min(20, z)));
}

/**
 * Deterministic hash-based projection of words to continuous scalar input signals [-1, 1]
 */
export function tokenToScalar(token: string): number {
  const lower = token.toLowerCase().trim();
  const semanticMap: Record<string, number> = {
    // Subject retention
    'the': 0.1,
    'clouds': 0.95,
    'cloud': 0.85,
    'sky': 0.9,
    'are': 0.35,
    'is': 0.25,
    'in': -0.15,
    'was': 0.2,
    'were': 0.3,
    
    // Sentiment
    'movie': 0.1,
    'food': 0.15,
    'wonderful': 0.95,
    'fantastic': 0.98,
    'great': 0.85,
    'good': 0.7,
    'but': -0.85, // Strong contrast marker triggering forget gate
    'however': -0.8,
    'service': 0.1,
    'ending': 0.2,
    'terrible': -0.95,
    'awful': -0.9,
    'bad': -0.75,
    
    // Syntax / Brackets
    '(': 0.8,
    '[': 0.85,
    '{': 0.9,
    '}': -0.9,
    ']': -0.85,
    ')': -0.8,
    'depth': 0.05,
    
    // Grammatical dependency
    'chef': 0.88,
    'chefs': 0.92,
    'who': 0.0,
    'cooked': 0.15,
    'meals': 0.3,
    'meal': 0.25,
  };

  if (semanticMap[lower] !== undefined) {
    return semanticMap[lower];
  }

  // Fallback hash for arbitrary user tokens
  let hash = 0;
  for (let i = 0; i < lower.length; i++) {
    hash = (hash * 31 + lower.charCodeAt(i)) & 0xffffffff;
  }
  return Math.sin(hash) * 0.85;
}

/**
 * Standard preset sequences designed for clear educational demonstrations
 */
export const PRESET_SEQUENCES: PresetSequence[] = [
  {
    id: 'clouds-sky',
    title: 'Long-Range Context: "The clouds are in the ..."',
    description: 'Demonstrates how the cell state preserves the subject concept "clouds" across intervening functional words to predict "sky".',
    tokens: ['The', 'clouds', 'are', 'in', 'the', 'sky'],
    educationalFocus: 'Cell State Conveyor Belt ($C_t$) protects the subject feature from vanishing.',
    defaultWeights: {
      Wf_h: 0.65,
      Wf_x: 0.25,
      bf: 1.8, // Bias forget gate high to keep memory alive
      Wi_h: 0.4,
      Wi_x: 0.9,
      bi: -0.2,
      Wc_h: 0.5,
      Wc_x: 1.2,
      bc: 0.0,
      Wo_h: 0.7,
      Wo_x: 0.5,
      bo: 0.2,
    },
  },
  {
    id: 'sentiment-flip',
    title: 'Sentiment Reversal: "wonderful but ... terrible"',
    description: 'Shows the Forget Gate valve dropping near 0 upon encountering the contrastive conjunction "but", purging prior sentiment.',
    tokens: ['The', 'food', 'was', 'wonderful', 'but', 'service', 'was', 'terrible'],
    educationalFocus: 'Forget Gate ($f_t$) selectively wipes old positive memory when context changes.',
    defaultWeights: {
      Wf_h: 0.2,
      Wf_x: 2.1,
      bf: 0.4,
      Wi_h: 0.3,
      Wi_x: 1.5,
      bi: 0.1,
      Wc_h: 0.2,
      Wc_x: 1.8,
      bc: 0.0,
      Wo_h: 0.6,
      Wo_x: 0.8,
      bo: 0.5,
    },
  },
  {
    id: 'bracket-depth',
    title: 'Syntactic Counter: "( ( [ { depth } ] ) )"',
    description: 'Visualizes the LSTM cell acting as an accumulator counter, incrementing memory on open brackets and decrementing on closing brackets.',
    tokens: ['(', '(', '[', '{', 'depth', '}', ']', ')', ')'],
    educationalFocus: 'Candidate Gate ($\tilde{C}_t$) produces signed increments and decrements ($\pm 1$).',
    defaultWeights: {
      Wf_h: 0.1,
      Wf_x: 0.0,
      bf: 3.5, // High forget gate preserves count strictly
      Wi_h: 0.0,
      Wi_x: 1.2,
      bi: 0.8,
      Wc_h: 0.0,
      Wc_x: 1.8,
      bc: 0.0,
      Wo_h: 0.8,
      Wo_x: 0.3,
      bo: 0.1,
    },
  },
  {
    id: 'subject-verb',
    title: 'Grammar Agreement: "The chef who cooked meals was ..."',
    description: 'Tracks how singular subject "chef" is remembered even though the plural distractor "meals" appears right before the verb.',
    tokens: ['The', 'chef', 'who', 'cooked', 'the', 'meals', 'was', 'praised'],
    educationalFocus: 'Input Gate ($i_t$) attenuates intervening clause distractors.',
    defaultWeights: {
      Wf_h: 0.5,
      Wf_x: 0.3,
      bf: 1.5,
      Wi_h: 0.3,
      Wi_x: 0.8,
      bi: -0.1,
      Wc_h: 0.4,
      Wc_x: 1.1,
      bc: 0.0,
      Wo_h: 0.6,
      Wo_x: 0.4,
      bo: 0.3,
    },
  },
];

/**
 * Calculates a single timestep in the LSTM given previous states and current input
 */
export function computeLstmStep(
  token: string,
  stepIndex: number,
  ht_prev: number,
  Ct_prev: number,
  weights: LstmWeights,
  overrides?: OverrideValues
): StepCalculation {
  const xt = tokenToScalar(token);

  // 1. Forget Gate
  const zf = weights.Wf_h * ht_prev + weights.Wf_x * xt + weights.bf;
  let ft = sigmoid(zf);

  // 2. Input Gate
  const zi = weights.Wi_h * ht_prev + weights.Wi_x * xt + weights.bi;
  let it = sigmoid(zi);

  // 3. Candidate Cell State
  const zc = weights.Wc_h * ht_prev + weights.Wc_x * xt + weights.bc;
  let cTilde_t = tanh(zc);

  // Apply overrides if active
  if (overrides && overrides.enabled) {
    if (overrides.ft !== undefined) ft = overrides.ft;
    if (overrides.it !== undefined) it = overrides.it;
    if (overrides.cTilde_t !== undefined) cTilde_t = overrides.cTilde_t;
  }

  // 4. Memory Cell Update (The Conveyor Belt Blend)
  const retainedMemory = ft * Ct_prev;
  const newMemory = it * cTilde_t;
  const Ct = retainedMemory + newMemory;

  // 5. Output Gate
  const zo = weights.Wo_h * ht_prev + weights.Wo_x * xt + weights.bo;
  let ot = sigmoid(zo);

  if (overrides && overrides.enabled && overrides.ot !== undefined) {
    ot = overrides.ot;
  }

  // 6. Hidden State Output
  const tanhCt = tanh(Ct);
  const ht = ot * tanhCt;

  // Generate plain-text pedagogical annotation for this step
  let annotation = '';
  if (stepIndex === 0) {
    annotation = `Initial step processing "${token}". Cell state initialized from 0.0.`;
  } else if (ft < 0.3) {
    annotation = `Forget gate dropped to ${(ft * 100).toFixed(0)}%! Purging ${(
      (1 - ft) *
      100
    ).toFixed(0)}% of prior cell memory.`;
  } else if (ft > 0.85) {
    annotation = `High forget gate (${(ft * 100).toFixed(
      0
    )}%): Prior memory is securely preserved along the conveyor belt.`;
  } else if (it > 0.7 && Math.abs(cTilde_t) > 0.6) {
    annotation = `Input gate admitted strong new candidate signal (${newMemory >= 0 ? '+' : ''}${newMemory.toFixed(
      2
    )}) for "${token}".`;
  } else {
    annotation = `Balanced update: retaining ${(retainedMemory).toFixed(
      2
    )} old memory, adding ${(newMemory >= 0 ? '+' : '')}${newMemory.toFixed(
      2
    )} new memory.`;
  }

  return {
    stepIndex,
    token,
    xt,
    ht_prev,
    Ct_prev,
    zf,
    zi,
    zc,
    zo,
    ft,
    it,
    cTilde_t,
    retainedMemory,
    newMemory,
    Ct,
    ot,
    tanhCt,
    ht,
    annotation,
  };
}

/**
 * Computes all steps for a full sequence
 */
export function computeFullSequence(
  tokens: string[],
  weights: LstmWeights,
  currentStepIndex: number,
  overrides?: OverrideValues
): StepCalculation[] {
  const steps: StepCalculation[] = [];
  let ht_prev = 0;
  let Ct_prev = 0;

  for (let i = 0; i < tokens.length; i++) {
    const isOverriddenStep = overrides?.enabled && i === currentStepIndex;
    const stepCalc = computeLstmStep(
      tokens[i],
      i,
      ht_prev,
      Ct_prev,
      weights,
      isOverriddenStep ? overrides : undefined
    );
    steps.push(stepCalc);
    ht_prev = stepCalc.ht;
    Ct_prev = stepCalc.Ct;
  }

  return steps;
}
